import { Helmet } from 'react-helmet-async';
// sections
import { UserCreateView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserCreatePage() {
  return (
    <>
      <Helmet>
        <title> 新建一个用户</title>
      </Helmet>

      <UserCreateView />
    </>
  );
}
