import { Helmet } from 'react-helmet-async';
// sections
import { VersionCreateView } from 'src/sections/version/view';

// ----------------------------------------------------------------------

export default function VersionCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new job</title>
      </Helmet>

      <VersionCreateView />
    </>
  );
}
