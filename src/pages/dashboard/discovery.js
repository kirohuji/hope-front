import { Helmet } from 'react-helmet-async';
// sections
import { DiscoveryView } from 'src/sections/discovery/view';

// ----------------------------------------------------------------------

export default function DictionaryPage() {
  return (
    <>
      <Helmet>
        <title> 发现</title>
      </Helmet>

      <DiscoveryView />
    </>
  );
}
