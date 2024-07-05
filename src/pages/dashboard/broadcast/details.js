import { Helmet } from 'react-helmet-async';
// sections
import { BroadcastDetailsView } from 'src/sections/broadcast/view';

// ----------------------------------------------------------------------

export default function BroadcastDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Analytics</title>
      </Helmet>

      <BroadcastDetailsView />
    </>
  );
}
