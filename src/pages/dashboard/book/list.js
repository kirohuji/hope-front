import { Helmet } from 'react-helmet-async';
// sections
import { BookListView } from 'src/sections/book/view';

// ----------------------------------------------------------------------

export default function BookListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Book List</title>
      </Helmet>

      <BookListView />
    </>
  );
}
