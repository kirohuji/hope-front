import { Helmet } from 'react-helmet-async';
// sections
import { AuditDetailsView } from 'src/sections/audit/view';

// ----------------------------------------------------------------------

export default function AuditDetailsPage() {
  return (
    <>
      <Helmet>
        <title> 审核详情</title>
      </Helmet>

      <AuditDetailsView />
    </>
  );
}
