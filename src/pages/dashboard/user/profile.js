import { Helmet } from 'react-helmet-async';
// sections
import { UserProfileView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserProfilePage() {
  return (
    <>
      <Helmet>
        <title> 用户信息</title>
      </Helmet>

      <UserProfileView />
    </>
  );
}
