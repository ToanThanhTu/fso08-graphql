import { useQuery, useSubscription } from "@apollo/client";
import PropTypes from 'prop-types';
import { ALL_BOOKS, ALL_GENRES, BOOK_ADDED } from "../queries";
import { useState } from "react";

const Books = ({ books }) => {
  const [genre, setGenre] = useState("");

  const genresResult = useQuery(ALL_GENRES);
  const booksResult = useQuery(ALL_BOOKS, {
    variables: { genre },
  });

  // Use `useSubscription` to listen for new books added in real-time
  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.bookAdded;

      console.log("addedBook", addedBook);

      // Update the cache by adding the new book to the `allBooks` query
      booksResult.updateQuery((prev) => {
        if (!prev) return;

        // Avoid duplicating books if it's already present
        if (prev.allBooks.find((book) => book.title === addedBook.title)) {
          return prev;
        }

        return {
          ...prev,
          allBooks: [...prev.allBooks, addedBook],
        };
      });
    },
  });

  if (!books || booksResult.loading || genresResult.loading) {
    return <div>loading...</div>;
  }

  const genres = genresResult.data.allGenres;
  const filleredBooks = booksResult.data.allBooks;

  return (
    <div>
      <h2>books</h2>

      <select
        name="genre"
        id="genre"
        value={genre}
        onChange={({ target }) => setGenre(target.value)}
      >
        <option value="">all genres</option>
        {genres.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <table className="table-fixed w-full text-center">
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {genre !== "" && (
        <table className="table-fixed w-full text-center">
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {filleredBooks.map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

Books.propTypes = {
  books: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      author: PropTypes.shape({
        name: PropTypes.string.isRequired,
      }).isRequired,
      published: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default Books;
