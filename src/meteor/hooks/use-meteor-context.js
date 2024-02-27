import { useContext } from 'react';
//
import { MeteorContext } from '../context';
// import { AuthContext } from '../context/auth0/auth-context';
// import { AuthContext } from '../context/amplify/auth-context';
// import { AuthContext } from '../context/firebase/auth-context';

// ----------------------------------------------------------------------

export const useMeteorContext = () => {
  const context = useContext(MeteorContext);

  if (!context) throw new Error('useMeteorContext context must be use inside MeteorProvider');

  return context;
};
