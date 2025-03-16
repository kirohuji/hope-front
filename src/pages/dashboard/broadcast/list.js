import { Helmet } from 'react-helmet-async';
// sections
import { BroadcastListView } from 'src/sections/broadcast/view';

// ----------------------------------------------------------------------

export default function BroadcastListPage() {
  return (
    <>
      <Helmet>
        <title> 活动通知列表</title>
      </Helmet>

      <BroadcastListView />
    </>
  );
}
