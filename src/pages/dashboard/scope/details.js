import { Helmet } from 'react-helmet-async';
// sections
import { ScopeDetailsView } from 'src/sections/scope/view';

// ----------------------------------------------------------------------

export default function ScopeDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Scope Details</title>
      </Helmet>

      <ScopeDetailsView />
    </>
  );
}
