import { Helmet } from 'react-helmet-async';
// sections
import { ScopeListView } from 'src/sections/scope/view';

// ----------------------------------------------------------------------

export default function ScopeListPage() {
  return (
    <>
      <Helmet>
        <title> 作用域列表</title>
      </Helmet>

      <ScopeListView />
    </>
  );
}
