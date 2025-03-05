import { Helmet } from 'react-helmet-async';
// sections
import { NotificationListView } from 'src/sections/notification/view';

// ----------------------------------------------------------------------

export default function NotificationListPage() {
  return (
    <>
      <Helmet>
        <title>消息通知列表</title>
      </Helmet>

      <NotificationListView />
    </>
  );
}
