import { Helmet } from 'react-helmet-async';
// sections
import { UserPermissionView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserPermissionPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User Organization</title>
      </Helmet>

      <UserPermissionView />
    </>
  );
}
