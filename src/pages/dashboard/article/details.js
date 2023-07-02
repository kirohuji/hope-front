import { Helmet } from 'react-helmet-async';
// sections
import { ArticleDetailsView } from 'src/sections/article/view';

// ----------------------------------------------------------------------

export default function ArticleDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Article Details</title>
      </Helmet>

      <ArticleDetailsView />
    </>
  );
}
