import { Helmet } from 'react-helmet-async';
// sections
import { AuditDetailsView } from 'src/sections/audit/view';

// ----------------------------------------------------------------------

export default function AuditDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Audit Details</title>
      </Helmet>

      <AuditDetailsView />
    </>
  );
}
