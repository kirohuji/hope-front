import { Helmet } from 'react-helmet-async';
// sections
import { DiscoveryDetailView } from 'src/sections/discovery/view';

// ----------------------------------------------------------------------

export default function DiscoveryDetailPage() {
  return (
    <>
      <Helmet>
        <title> 发现</title>
      </Helmet>

      <DiscoveryDetailView />
    </>
  );
}
