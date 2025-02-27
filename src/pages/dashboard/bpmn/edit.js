import { Helmet } from 'react-helmet-async';
// sections
import { BpmnEditView } from 'src/sections/bpmn/view';

// ----------------------------------------------------------------------

export default function BpmnEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Bpmn</title>
      </Helmet>

      <BpmnEditView />
    </>
  );
}
