const config = require("./utils/config");

const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

const { PubSub } = require("graphql-subscriptions");

const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

const pubsub = new PubSub();

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),

    authorCount: async () => Author.collection.countDocuments(),

    allBooks: async (root, args) => {
      let filteredBooks = await Book.find({}).populate("author");

      if (args.author) {
        const byAuthor = (book) => book.author.name === args.author;
        filteredBooks = filteredBooks.filter(byAuthor);
      }

      if (args.genre) {
        const byGenre = (book) => book.genres.includes(args.genre);
        filteredBooks = filteredBooks.filter(byGenre);
      }

      return filteredBooks;
    },

    allGenres: async () => {
      const books = await Book.find({});
      const genres = books.flatMap((book) => book.genres);
      return [...new Set(genres)];
    },

    allAuthors: async (root, args) => {
      if (!args.born) {
        return Author.find({}).populate("books");
      }

      return Author.find({ born: { $exists: args.born === "YES" } }).populate("books");
    },

    findAuthor: async (root, args) => Author.findOne({ name: args.name }),

    me: (root, args, context) => {
      return context.currentUser;
    },

    recommendedBooks: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const books = await Book.find({
        genres: { $in: [currentUser.favoriteGenre] },
      }).populate("author");
      return books;
    },
  },

  Author: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
    bookCount: async (root) => {
      return root.books.length;
    },
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      let existedAuthor = await Author.findOne({ name: args.author });
      if (!existedAuthor) {
        existedAuthor = await resolvers.Mutation.addAuthor(
          root,
          { name: args.author },
          context
        );
      }

      const book = new Book({ ...args, author: existedAuthor._id });

      try {
        const savedBook = await book.save();
        existedAuthor.books = existedAuthor.books.concat(savedBook._id);
        await existedAuthor.save();
      } catch (error) {
        throw new GraphQLError("Saving book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args,
            error,
          },
        });
      }

      const populatedBook = await book.populate("author");
      pubsub.publish("BOOK_ADDED", { bookAdded: populatedBook });
      return populatedBook;
    },

    addAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const author = new Author({ ...args });

      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError("Saving author failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }

      pubsub.publish("AUTHOR_ADDED", { authorAdded: author });
      return author;
    },

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser;
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "UNAUTHENTICATED",
          },
        });
      }

      const author = await Author.findOne({ name: args.name });
      author.born = args.setBirthYearTo;

      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError("Saving birth year failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.setBirthYearTo,
            error,
          },
        });
      }

      return author;
    },

    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, config.JWT_SECRET) };
    },
  },
  
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
    authorAdded: {
      subscribe: () => pubsub.asyncIterator(["AUTHOR_ADDED"]),
    },
  },
};

module.exports = resolvers;
