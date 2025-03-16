import { Helmet } from 'react-helmet-async';
// sections
import { NotificationEditView } from 'src/sections/notification/view';

// ----------------------------------------------------------------------

export default function NotificationEditPage() {
  return (
    <>
      <Helmet>
        <title> 消息通知编辑</title>
      </Helmet>

      <NotificationEditView />
    </>
  );
}
