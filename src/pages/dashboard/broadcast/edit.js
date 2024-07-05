import { Helmet } from 'react-helmet-async';
// sections
import { BroadcastEditView } from 'src/sections/broadcast/view';

// ----------------------------------------------------------------------

export default function BroadcastEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Broadcast Edit</title>
      </Helmet>

      <BroadcastEditView />
    </>
  );
}
