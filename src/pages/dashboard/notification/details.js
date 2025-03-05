import { Helmet } from 'react-helmet-async';
// sections
import { NotificationDetailsView } from 'src/sections/notification/view';

// ----------------------------------------------------------------------

export default function NotificationDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Analytics</title>
      </Helmet>

      <NotificationDetailsView />
    </>
  );
}
