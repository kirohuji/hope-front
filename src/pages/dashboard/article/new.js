import { Helmet } from 'react-helmet-async';
// sections
import { ArticleCreateView } from 'src/sections/article/view';

// ----------------------------------------------------------------------

export default function ArticleCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new post</title>
      </Helmet>

      <ArticleCreateView />
    </>
  );
}
