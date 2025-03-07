import { Helmet } from 'react-helmet-async';
// sections
import { PostDetailsView } from 'src/sections/post/view';

// ----------------------------------------------------------------------

export default function PostDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Post Details</title>
      </Helmet>

      <PostDetailsView />
    </>
  );
}
