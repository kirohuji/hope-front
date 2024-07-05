import { Helmet } from 'react-helmet-async';
// sections
import { UserOranizationView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserOrganizationPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User Organization</title>
      </Helmet>

      <UserOranizationView />
    </>
  );
}
