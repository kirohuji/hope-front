import { Helmet } from 'react-helmet-async';
// sections
import { BpmnView } from 'src/sections/bpmn/view';

// ----------------------------------------------------------------------

export default function BpmnPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Bpmn</title>
      </Helmet>

      <BpmnView />
    </>
  );
}
