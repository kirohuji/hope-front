import { Helmet } from 'react-helmet-async';
// sections
import { BroadcastListView } from 'src/sections/broadcast/view';

// ----------------------------------------------------------------------

export default function BroadcastListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Broadcast List</title>
      </Helmet>

      <BroadcastListView />
    </>
  );
}
