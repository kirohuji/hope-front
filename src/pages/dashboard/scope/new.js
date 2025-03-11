import { Helmet } from 'react-helmet-async';
// sections
import { ScopeCreateView } from 'src/sections/scope/view';

// ----------------------------------------------------------------------

export default function ScopeCreatePage() {
  return (
    <>
      <Helmet>
        <title> 新增一个作用域</title>
      </Helmet>

      <ScopeCreateView />
    </>
  );
}
