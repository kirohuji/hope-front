import { Helmet } from 'react-helmet-async';
// sections
import { BookEditView } from 'src/sections/book/view';

// ----------------------------------------------------------------------

export default function BookEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Dashboard: Book Edit</title>
      </Helmet>

      <BookEditView />
    </>
  );
}
