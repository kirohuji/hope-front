import { Helmet } from 'react-helmet-async';
// sections
import { TrainingProcessView } from 'src/sections/training/view';

// ----------------------------------------------------------------------

export default function TrainingProcessPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <TrainingProcessView />
    </>
  );
}
