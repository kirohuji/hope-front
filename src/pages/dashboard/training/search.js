import { Helmet } from 'react-helmet-async';
// sections
import { TrainingSearchView } from 'src/sections/training/view';

// ----------------------------------------------------------------------

export default function TrainingSearchPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <TrainingSearchView />
    </>
  );
}
