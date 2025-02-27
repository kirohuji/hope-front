import { Helmet } from 'react-helmet-async';
// sections
import { BpmnDetailsView } from 'src/sections/bpmn/view';

// ----------------------------------------------------------------------

export default function BpmnDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Bpmn Details</title>
      </Helmet>

      <BpmnDetailsView />
    </>
  );
}
