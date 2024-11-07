import { useMutation } from "@apollo/client";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const SetBirthYear = ({ authors, setError }) => {
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const [editAuthor, result] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const submit = (event) => {
    event.preventDefault();

    editAuthor({ variables: { name, setBirthYearTo: parseInt(birthYear) } });

    setName("");
    setBirthYear("");
  };

  useEffect(() => {
    if (result.data && result.data.editAuthor === null) {
      setError("author not found");
    }
  }, [result.data, setError]);

  return (
    <div>
      <h2>Set Birth Year</h2>
      <form onSubmit={submit} className="flex flex-col">
        <select value={name} onChange={({ target }) => setName(target.value)}>
          <option value="">Select author</option>
          {authors.map((a) => (
            <option key={a.id} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>

        <div>
          <label htmlFor="born">Born</label>
          <input
            type="number"
            id="born"
            value={birthYear}
            onChange={({ target }) => setBirthYear(target.value)}
          />
        </div>

        <button type="submit">update author</button>
      </form>
    </div>
  );
};

SetBirthYear.propTypes = {
  authors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  setError: PropTypes.func.isRequired,
};

export default SetBirthYear;
