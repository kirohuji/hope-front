import { Helmet } from 'react-helmet-async';
// sections
import UserEditView from 'src/sections/user/view/user-edit-view';
import { usePathname } from 'src/routes/hook';

// ----------------------------------------------------------------------

export default function UserEditPage() {
  const pathname = usePathname();
  return (
    <>
      <Helmet>
        <title> 编辑用户</title>
      </Helmet>

      <UserEditView isPersona={pathname.includes('/dashboard/persona')} />
    </>
  );
}
