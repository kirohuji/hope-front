import { Helmet } from 'react-helmet-async';
// sections
import { VersionMajorEditView } from 'src/sections/version/view';

// ----------------------------------------------------------------------

export default function VersionEditPage() {
  return (
    <>
      <Helmet>
        <title> 编辑 主版本号</title>
      </Helmet>

      <VersionMajorEditView />
    </>
  );
}
