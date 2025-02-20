import { Helmet } from 'react-helmet-async';
// sections
import { AuditListView } from 'src/sections/audit/view';

// ----------------------------------------------------------------------

export default function AuditListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Audit List</title>
      </Helmet>

      <AuditListView />
    </>
  );
}
