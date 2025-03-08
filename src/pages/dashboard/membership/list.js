import { Helmet } from 'react-helmet-async';
// sections
import { MembershipListView } from 'src/sections/membership/view';

// ----------------------------------------------------------------------

export default function MembershipListPage() {
  return (
    <>
      <Helmet>
        <title>消息通知列表</title>
      </Helmet>

      <MembershipListView />
    </>
  );
}
