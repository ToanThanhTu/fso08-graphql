import { useQuery } from "@apollo/client";
import { ME, RECOMMENDED_BOOKS } from "../queries";

const Recommendations = () => {
  const meResults = useQuery(ME);
  const recommededBooksResults = useQuery(RECOMMENDED_BOOKS);

  if (recommededBooksResults.loading || meResults.loading) {
    return <div>loading...</div>;
  }

  const me = meResults.data.me;
  const books = recommededBooksResults.data.recommendedBooks;

  return (
    <div>
      <h2>Recommendations</h2>

      <p>
        Books in your favorite genre <strong>{me.favoriteGenre}</strong>
      </p>

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
    </div>
  );
};

export default Recommendations;
