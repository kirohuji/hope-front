import { Helmet } from 'react-helmet-async';
// sections
import { VersionListView } from 'src/sections/version/view';

// ----------------------------------------------------------------------

export default function VersionListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Version List</title>
      </Helmet>

      <VersionListView />
    </>
  );
}
