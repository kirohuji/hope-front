import { Helmet } from 'react-helmet-async';
// sections
import { PostEditView } from 'src/sections/post/view';

// ----------------------------------------------------------------------

export default function PostEditPage() {
  return (
    <>
      <Helmet>
        <title> 文章编辑</title>
      </Helmet>

      <PostEditView />
    </>
  );
}
