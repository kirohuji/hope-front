import { Helmet } from 'react-helmet-async';
// sections
import { NotificationCreateView } from 'src/sections/notification/view';

// ----------------------------------------------------------------------

export default function NotificationCreatePage() {
  return (
    <>
      <Helmet>
        <title> 创建一条消息通知</title>
      </Helmet>

      <NotificationCreateView />
    </>
  );
}
