import { Helmet } from 'react-helmet-async';
// sections
import { BroadcastEditView } from 'src/sections/broadcast/view';

// ----------------------------------------------------------------------

export default function BroadcastEditPage() {
  return (
    <>
      <Helmet>
        <title> 活动通知编辑</title>
      </Helmet>

      <BroadcastEditView />
    </>
  );
}
