import { Helmet } from 'react-helmet-async';
// sections
import { PostListView } from 'src/sections/post/view';

// ----------------------------------------------------------------------

export default function PostListPage() {
  return (
    <>
      <Helmet>
        <title> 文章列表</title>
      </Helmet>

      <PostListView />
    </>
  );
}
