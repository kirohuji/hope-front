import { Helmet } from 'react-helmet-async';
// sections
import { TrainingDetailView } from 'src/sections/training/view';

// ----------------------------------------------------------------------

export default function TrainingDetailPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <TrainingDetailView />
    </>
  );
}
