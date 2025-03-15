import { Helmet } from 'react-helmet-async';
// sections
import { AuditListView } from 'src/sections/audit/view';

// ----------------------------------------------------------------------

export default function AuditListPage() {
  return (
    <>
      <Helmet>
        <title> 审核列表</title>
      </Helmet>

      <AuditListView />
    </>
  );
}
