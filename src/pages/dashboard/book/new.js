import { Helmet } from 'react-helmet-async';
// sections
import { BookCreateView } from 'src/sections/book/view';

// ----------------------------------------------------------------------

export default function BookCreatePage() {
  return (
    <>
      <Helmet>
        <title> 创建新的阅读本</title>
      </Helmet>

      <BookCreateView />
    </>
  );
}
