import { Helmet } from 'react-helmet-async';
// sections
import { ArticleEditView } from 'src/sections/article/view';

// ----------------------------------------------------------------------

export default function ArticleEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Article Edit</title>
      </Helmet>

      <ArticleEditView />
    </>
  );
}
