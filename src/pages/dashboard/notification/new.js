import { Helmet } from 'react-helmet-async';
// sections
import { NotificationCreateView } from 'src/sections/notification/view';

// ----------------------------------------------------------------------

export default function NotificationCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new tour</title>
      </Helmet>

      <NotificationCreateView />
    </>
  );
}
