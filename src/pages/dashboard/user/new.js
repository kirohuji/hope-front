import { Helmet } from 'react-helmet-async';
// sections
import { UserCreateView } from 'src/sections/user/view';
import { usePathname } from 'src/routes/hook';

// ----------------------------------------------------------------------

export default function UserCreatePage() {
  const pathname = usePathname();
  return (
    <>
      <Helmet>
        <title> 新建一个用户</title>
      </Helmet>

      <UserCreateView isPersona={pathname === '/dashboard/persona/new'} />
    </>
  );
}
