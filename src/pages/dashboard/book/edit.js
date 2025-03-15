import { Helmet } from 'react-helmet-async';
// sections
import { BookEditView } from 'src/sections/book/view';

// ----------------------------------------------------------------------

export default function BookEditPage() {
  return (
    <>
      <Helmet>
        <title> 阅读本编辑</title>
      </Helmet>

      <BookEditView />
    </>
  );
}
