import { Helmet } from 'react-helmet-async';
// sections
import { BpmnCreateView } from 'src/sections/bpmn/view';

// ----------------------------------------------------------------------

export default function BpmnCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new invoice</title>
      </Helmet>

      <BpmnCreateView />
    </>
  );
}
