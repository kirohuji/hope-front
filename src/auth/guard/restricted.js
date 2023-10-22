import PropTypes from 'prop-types';
import _ from 'lodash'
// auth
import { useAuthContext } from 'src/auth/hooks';

export default function Restricted ({ to, children, hidden = false }) {
  const { permissions, isAdmin } = useAuthContext();
  if (!hidden && (_.intersection(permissions, to).length > 0 || isAdmin)) {
    return <>{children}</>;
  }
}

Restricted.propTypes = {
  to: PropTypes.array,
  hidden: PropTypes.bool,
  children: PropTypes.node,
};