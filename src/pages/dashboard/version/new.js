import { Helmet } from 'react-helmet-async';
// sections
import { VersionCreateView } from 'src/sections/version/view';

// ----------------------------------------------------------------------

export default function VersionCreatePage() {
  return (
    <>
      <Helmet>
        <title> 新建 版本</title>
      </Helmet>

      <VersionCreateView />
    </>
  );
}
