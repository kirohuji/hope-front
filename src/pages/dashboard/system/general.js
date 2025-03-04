import { Helmet } from 'react-helmet-async';
// sections
import { SystemGeneralView } from 'src/sections/system/view';

// ----------------------------------------------------------------------

export default function SystemGeneralPage() {
  return (
    <>
      <Helmet>
        <title> 系统设置</title>
      </Helmet>

      <SystemGeneralView />
    </>
  );
}
