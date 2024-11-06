import { Helmet } from 'react-helmet-async';
// sections
import { VersionMajorEditView } from 'src/sections/version/view';

// ----------------------------------------------------------------------

export default function VersionEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Dashboard: Version Edit</title>
      </Helmet>

      <VersionMajorEditView />
    </>
  );
}
