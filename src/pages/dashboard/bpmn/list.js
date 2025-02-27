import { Helmet } from 'react-helmet-async';
// sections
import { BpmnListView } from 'src/sections/bpmn/view';

// ----------------------------------------------------------------------

export default function BpmnListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Bpmn List</title>
      </Helmet>

      <BpmnListView />
    </>
  );
}
