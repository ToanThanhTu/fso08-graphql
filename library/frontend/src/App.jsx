import PropTypes from "prop-types";
import { useState } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { useApolloClient, useQuery, useSubscription } from "@apollo/client";

import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import Recommendations from "./components/Recommendations";
import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED } from "./queries";

export const updateCache = (cache, query, addedBook) => {
  const uniqByName = (a) => {
    let seen = new Set();

    return a.filter((item) => {
      let k = item.name;
      return seen.has(k) ? false : seen.add(k);
    });
  };

  cache.updateQuery(query, ({ allBooks }) => {
    const newBooks = uniqByName(allBooks.concat(addedBook));
    return { allBooks: newBooks };
  });
};

const App = () => {
  const booksResult = useQuery(ALL_BOOKS);
  const authorsResult = useQuery(ALL_AUTHORS);
  const [token, setToken] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const client = useApolloClient();

  const notify = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage(null);
    }, 10000);
  };

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    navigate("/");
  };

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      console.log("subscription data:", data);
      const addedBook = data.data.bookAdded;

      notify(`New book added: ${addedBook.title}`);

      updateCache(client.cache, { query: ALL_BOOKS }, addedBook);
    },
  });

  if (booksResult.loading || authorsResult.loading) {
    return <div>loading...</div>;
  }

  return (
    <main className="max-w-screen-sm lg:max-w-screen-md m-auto">
      <nav className="flex items-center justify-center w-full gap-4">
        <Link to="/" className="p-4">
          home
        </Link>
        <Link to="/authors" className="p-4">
          authors
        </Link>
        <Link to="/books" className="p-4">
          books
        </Link>

        {token ? (
          <>
            <Link to="/recommendations" className="p-4">
              Recommendations
            </Link>
            <Link to="/add" className="p-4">
              add book
            </Link>
            <button onClick={logout} className="p-4">
              logout
            </button>
          </>
        ) : (
          <Link to="/login" className="p-4">
            login
          </Link>
        )}
      </nav>

      <Notify errorMessage={errorMessage} />

      <Routes>
        <Route path="/" element={<Authors setError={notify} />} />
        <Route path="/authors" element={<Authors setError={notify} />} />
        <Route path="/books" element={<Books books={booksResult.data.allBooks} />} />
        <Route path="/add" element={<NewBook setError={notify} />} />
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to={"/"} />
            ) : (
              <Login setToken={setToken} setError={notify} />
            )
          }
        />
        <Route
          path="/recommendations"
          element={token ? <Recommendations /> : <Navigate to={"/login"} />}
        />
      </Routes>
    </main>
  );
};

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null;
  }

  return (
    <div className="border border-solid border-red-600 rounded text-red-600 p-4">
      {errorMessage}
    </div>
  );
};

Notify.propTypes = {
  errorMessage: PropTypes.string,
};

export default App;
