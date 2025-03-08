import { Helmet } from 'react-helmet-async';
// sections
import { MembershipDetailsView } from 'src/sections/membership/view';

// ----------------------------------------------------------------------

export default function MembershipDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Analytics</title>
      </Helmet>

      <MembershipDetailsView />
    </>
  );
}
