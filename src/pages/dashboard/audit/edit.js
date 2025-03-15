import { Helmet } from 'react-helmet-async';
// sections
import { AuditEditView } from 'src/sections/audit/view';

// ----------------------------------------------------------------------

export default function AuditEditPage() {
  return (
    <>
      <Helmet>
        <title> 审核编辑</title>
      </Helmet>

      <AuditEditView />
    </>
  );
}
