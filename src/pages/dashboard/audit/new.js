import { Helmet } from 'react-helmet-async';
// sections
import { AuditCreateView } from 'src/sections/audit/view';

// ----------------------------------------------------------------------

export default function AuditCreatePage() {
  return (
    <>
      <Helmet>
        <title> 新增审核</title>
      </Helmet>

      <AuditCreateView />
    </>
  );
}
