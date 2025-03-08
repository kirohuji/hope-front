import { Helmet } from 'react-helmet-async';
// sections
import { MembershipEditView } from 'src/sections/membership/view';

// ----------------------------------------------------------------------

export default function MembershipEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Membership Edit</title>
      </Helmet>

      <MembershipEditView />
    </>
  );
}
