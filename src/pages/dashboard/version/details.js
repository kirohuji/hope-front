import { Helmet } from 'react-helmet-async';
// sections
import { VersionDetailsView } from 'src/sections/version/view';

// ----------------------------------------------------------------------

export default function VersionDetailsPage() {
  return (
    <>
      <Helmet>
        <title> 版本详情</title>
      </Helmet>

      <VersionDetailsView />
    </>
  );
}
