import { Helmet } from 'react-helmet-async';
// sections
import UserEditView from 'src/sections/user/view/user-edit-view';

// ----------------------------------------------------------------------

export default function UserEditPage() {
  return (
    <>
      <Helmet>
        <title> 编辑用户</title>
      </Helmet>

      <UserEditView />
    </>
  );
}
