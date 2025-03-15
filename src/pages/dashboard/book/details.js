import { Helmet } from 'react-helmet-async';
// sections
import { BookDetailsView } from 'src/sections/book/view';

// ----------------------------------------------------------------------

export default function BookDetailsPage() {
  return (
    <>
      <Helmet>
        <title> 阅读本详情</title>
      </Helmet>

      <BookDetailsView />
    </>
  );
}
