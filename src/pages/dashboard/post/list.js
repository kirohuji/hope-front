import { Helmet } from 'react-helmet-async';
// sections
import { PostListView } from 'src/sections/post/view';

// ----------------------------------------------------------------------

export default function PostListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Post List</title>
      </Helmet>

      <PostListView />
    </>
  );
}
