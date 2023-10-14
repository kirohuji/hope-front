import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
// sections
import { TrainingDashboardView } from 'src/sections/training/view';

// ----------------------------------------------------------------------

export default function TrainingDashboardPage () {

  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <TrainingDashboardView />
    </>
  );
}
