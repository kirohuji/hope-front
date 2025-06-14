import { Helmet } from 'react-helmet-async';
// sections
import { UserListView } from 'src/sections/user/view';
import { usePathname } from 'src/routes/hook';

// ----------------------------------------------------------------------

export default function UserListPage() {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <>
      <Helmet>
        <title>{pathname === '/dashboard/persona/list' ? '人设列表' : '用户列表'}</title>
      </Helmet>

      <UserListView isPersona={pathname === '/dashboard/persona/list'} />
    </>
  );
}
