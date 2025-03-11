import { Helmet } from 'react-helmet-async';
// sections
import { ScopeEditView } from 'src/sections/scope/view';

// ----------------------------------------------------------------------

export default function ScopeEditPage() {
  return (
    <>
      <Helmet>
        <title> 作用域编辑</title>
      </Helmet>

      <ScopeEditView />
    </>
  );
}
