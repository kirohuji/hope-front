import PropTypes from 'prop-types';
import { LazyMotion, m } from 'framer-motion';

// ----------------------------------------------------------------------

// eslint-disable-next-line import/extensions
const loadFeatures = () => import('./features.js').then((res) => res.default);

function MotionLazy({ children }) {
  return (
    <LazyMotion strict features={loadFeatures}>
      <m.div style={{ height: '100%' }}> {children} </m.div>
    </LazyMotion>
  );
}

MotionLazy.propTypes = {
  children: PropTypes.node,
};

export default MotionLazy;
