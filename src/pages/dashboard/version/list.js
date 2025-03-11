import { Helmet } from 'react-helmet-async';
// sections
import { VersionListView } from 'src/sections/version/view';

// ----------------------------------------------------------------------

export default function VersionListPage() {
  return (
    <>
      <Helmet>
        <title> 版本列表 </title>
      </Helmet>

      <VersionListView />
    </>
  );
}
