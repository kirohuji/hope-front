import { Helmet } from 'react-helmet-async';
// sections
import { BookListView } from 'src/sections/book/view';

// ----------------------------------------------------------------------

export default function BookListPage() {
  return (
    <>
      <Helmet>
        <title> 阅读本列表</title>
      </Helmet>

      <BookListView />
    </>
  );
}
