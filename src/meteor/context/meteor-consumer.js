import PropTypes from 'prop-types';
// components
import { SplashScreen } from 'src/components/loading-screen';
import { NetworkErrorView } from 'src/sections/error';
//
import { MeteorContext } from './meteor-context';

// ----------------------------------------------------------------------

export function MeteorConsumer({ children }) {
  return (
    <MeteorContext.Consumer>
      {(server) => (server.isConnected ? children : <NetworkErrorView />)}
    </MeteorContext.Consumer>
  );
}

MeteorConsumer.propTypes = {
  children: PropTypes.node,
};
