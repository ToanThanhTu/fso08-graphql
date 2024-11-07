import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
      address {
        street
        city
      }
      id
    }
  }
`;

const AUTHOR_DETAILS = gql`
  fragment AuthorDetails on Author {
    id
    name
    born
    address {
      street
      city
    }
    bookCount
  }
`;

export const FIND_AUTHOR = gql`
  query findAuthor($nameToSearch: String!) {
    findAuthor(name: $nameToSearch) {
      ...AuthorDetails
    }
    ${AUTHOR_DETAILS}
  }
`;

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBirthYearTo: Int!) {
    editAuthor(name: $name, setBirthYearTo: $setBirthYearTo) {
      name
      born
      bookCount
    }
  }
`;

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    published
    genres
    author {
      name
    }
  }
`;

export const ALL_BOOKS = gql`
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      title
      published
      genres
      author {
        name
      }
    }
  }
`;

export const ALL_GENRES = gql`
  query {
    allGenres
  }
`;

export const CREATE_BOOK = gql`
  mutation createBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      author {
        name
      }
      published
      genres
    }
  }
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const ME = gql`
  query {
    me {
      username
      favoriteGenre
    }
  }
`;

export const RECOMMENDED_BOOKS = gql`
  query {
    recommendedBooks {
      title
      published
      genres
      author {
        name
      }
    }
  }
`;

export const AUTHOR_ADDED = gql`
  subscription {
    authorAdded {
      ...AuthorDetails
    }
  }
  ${AUTHOR_DETAILS}
`;

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`;
