import { Helmet } from 'react-helmet-async';
// sections
import { VersionEditView } from 'src/sections/version/view';

// ----------------------------------------------------------------------

export default function VersionEditPage() {
  return (
    <>
      <Helmet>
        <title> 编辑 版本</title>
      </Helmet>

      <VersionEditView />
    </>
  );
}
