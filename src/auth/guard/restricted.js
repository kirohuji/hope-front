import PropTypes from 'prop-types';
import _ from 'lodash'
// auth
import { useAuthContext } from 'src/auth/hooks';

export default function Restricted ({ to, children }) {
  const { permissions, isAdmin } = useAuthContext();
  if (_.intersection(permissions, to).length > 0 || isAdmin) {
    return <>{children}</>;
  }
}

Restricted.propTypes = {
  to: PropTypes.array,
  children: PropTypes.node,
};