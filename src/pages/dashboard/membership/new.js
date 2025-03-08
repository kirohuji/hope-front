import { Helmet } from 'react-helmet-async';
// sections
import { MembershipCreateView } from 'src/sections/membership/view';

// ----------------------------------------------------------------------

export default function MembershipCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new tour</title>
      </Helmet>

      <MembershipCreateView />
    </>
  );
}
