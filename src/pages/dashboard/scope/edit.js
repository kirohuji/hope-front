import { Helmet } from 'react-helmet-async';
// sections
import { ScopeEditView } from 'src/sections/scope/view';

// ----------------------------------------------------------------------

export default function ScopeEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Dashboard: Scope Edit</title>
      </Helmet>

      <ScopeEditView />
    </>
  );
}
