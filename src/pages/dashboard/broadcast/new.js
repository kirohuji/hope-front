import { Helmet } from 'react-helmet-async';
// sections
import { BroadcastCreateView } from 'src/sections/broadcast/view';

// ----------------------------------------------------------------------

export default function BroadcastCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new tour</title>
      </Helmet>

      <BroadcastCreateView />
    </>
  );
}
