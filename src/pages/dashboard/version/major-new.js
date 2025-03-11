import { Helmet } from 'react-helmet-async';
// sections
import { VersionMajorCreateView } from 'src/sections/version/view';

// ----------------------------------------------------------------------

export default function VersionCreatePage() {
  return (
    <>
      <Helmet>
        <title> 新建 一个主版本号 </title>
      </Helmet>

      <VersionMajorCreateView />
    </>
  );
}
