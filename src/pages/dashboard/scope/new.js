import { Helmet } from 'react-helmet-async';
// sections
import { ScopeCreateView } from 'src/sections/scope/view';

// ----------------------------------------------------------------------

export default function ScopeCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new job</title>
      </Helmet>

      <ScopeCreateView />
    </>
  );
}
