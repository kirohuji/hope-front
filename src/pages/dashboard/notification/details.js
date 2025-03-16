import { Helmet } from 'react-helmet-async';
// sections
import { NotificationDetailsView } from 'src/sections/notification/view';

// ----------------------------------------------------------------------

export default function NotificationDetailsPage() {
  return (
    <>
      <Helmet>
        <title> 消息通知详情</title>
      </Helmet>

      <NotificationDetailsView />
    </>
  );
}
