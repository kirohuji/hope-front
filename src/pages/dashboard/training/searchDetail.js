import { Helmet } from 'react-helmet-async';
// sections
import { TrainingSearchDetailView } from 'src/sections/training/view';

// ----------------------------------------------------------------------

export default function TrainingSearchDetailPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <TrainingSearchDetailView />
    </>
  );
}
