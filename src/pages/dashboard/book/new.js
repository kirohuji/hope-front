import { Helmet } from 'react-helmet-async';
// sections
import { BookCreateView } from 'src/sections/book/view';

// ----------------------------------------------------------------------

export default function BookCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new job</title>
      </Helmet>

      <BookCreateView />
    </>
  );
}
