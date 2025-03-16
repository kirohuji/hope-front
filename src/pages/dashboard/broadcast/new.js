import { Helmet } from 'react-helmet-async';
// sections
import { BroadcastCreateView } from 'src/sections/broadcast/view';

// ----------------------------------------------------------------------

export default function BroadcastCreatePage() {
  return (
    <>
      <Helmet>
        <title> 创建一个活动通知</title>
      </Helmet>

      <BroadcastCreateView />
    </>
  );
}
