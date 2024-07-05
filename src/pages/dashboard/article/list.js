import { Helmet } from 'react-helmet-async';
// sections
import { ArticleListView } from 'src/sections/article/view';

// ----------------------------------------------------------------------

export default function ArticleListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Article List</title>
      </Helmet>

      <ArticleListView />
    </>
  );
}
