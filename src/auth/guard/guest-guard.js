import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
//
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

export default function GuestGuard({ children }) {
  const router = useRouter();

  const { isAuthenticated } = useAuthContext();

  const check = useCallback(() => {
    if (isAuthenticated) {
      router.replace(paths.dashboard.root);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

GuestGuard.propTypes = {
  children: PropTypes.node,
};
