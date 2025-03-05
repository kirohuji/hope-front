import { Helmet } from 'react-helmet-async';
// sections
import { NotificationEditView } from 'src/sections/notification/view';

// ----------------------------------------------------------------------

export default function NotificationEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Notification Edit</title>
      </Helmet>

      <NotificationEditView />
    </>
  );
}
