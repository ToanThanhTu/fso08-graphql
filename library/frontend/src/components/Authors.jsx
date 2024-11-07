import { useQuery } from "@apollo/client";
import PropTypes from "prop-types";
import { useState } from "react";
import { ALL_AUTHORS, FIND_AUTHOR } from "../queries";
import SetBirthYear from "./SetBirthYear";

const Author = ({ author, onClose }) => {
  return (
    <div>
      <h2>{author.name}</h2>

      {author.address && (
        <div>
          {author.address.street} {author.address.city}
        </div>
      )}

      {author.born && <div>{author.born}</div>}
      <button onClick={onClose}>close</button>
    </div>
  );
};

const Authors = ({ setError }) => {
  const [nameToSearch, setNameToSearch] = useState(null);

  const authorsResult = useQuery(ALL_AUTHORS);

  const findAuthorResult = useQuery(FIND_AUTHOR, {
    variables: { nameToSearch },
    skip: !nameToSearch,
  });
  
  if (authorsResult.loading) {
    return <div>loading...</div>;
  }

  if (nameToSearch && findAuthorResult.data) {
    return (
      <Author
        author={findAuthorResult.data.findAuthor}
        onClose={() => setNameToSearch(null)}
      />
    );
  }

  const authors = authorsResult.data.allAuthors;

  return (
    <div className="w-full">
      <h2>Authors</h2>
      <table className="table-fixed w-full text-center">
        <thead>
          <tr>
            <th></th>
            <th>Born</th>
            <th>Books</th>
          </tr>
        </thead>
        <tbody>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
              <td>
                <button onClick={() => setNameToSearch(a.name)} className="p-2 border border-solid border-black rounded">
                  show address
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <SetBirthYear authors={authors} setError={setError} />
    </div>
  );
};

Author.propTypes = {
  author: PropTypes.shape({
    name: PropTypes.string.isRequired,
    born: PropTypes.number,
    bookCount: PropTypes.number.isRequired,
    address: PropTypes.shape({
      street: PropTypes.string,
      city: PropTypes.string,
    }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

Authors.propTypes = {
  setError: PropTypes.func.isRequired,
};

export default Authors;
