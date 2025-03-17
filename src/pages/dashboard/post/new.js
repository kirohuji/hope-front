import { Helmet } from 'react-helmet-async';
// sections
import { PostCreateView } from 'src/sections/post/view';

// ----------------------------------------------------------------------

export default function PostCreatePage() {
  return (
    <>
      <Helmet>
        <title> 新增一篇文章</title>
      </Helmet>

      <PostCreateView />
    </>
  );
}
