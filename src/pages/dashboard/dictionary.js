import { Helmet } from 'react-helmet-async';
// sections
import { DictionaryView } from 'src/sections/dictionary/view';

// ----------------------------------------------------------------------

export default function DictionaryPage() {
  return (
    <>
      <Helmet>
        <title> 字典管理</title>
      </Helmet>

      <DictionaryView />
    </>
  );
}
