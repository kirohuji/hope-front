import { Helmet } from 'react-helmet-async';
// sections
import { AuditCreateView } from 'src/sections/audit/view';

// ----------------------------------------------------------------------

export default function AuditCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new invoice</title>
      </Helmet>

      <AuditCreateView />
    </>
  );
}
