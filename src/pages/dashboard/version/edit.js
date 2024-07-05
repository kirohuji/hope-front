import { Helmet } from 'react-helmet-async';
// sections
import { VersionEditView } from 'src/sections/version/view';

// ----------------------------------------------------------------------

export default function VersionEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Dashboard: Version Edit</title>
      </Helmet>

      <VersionEditView />
    </>
  );
}
