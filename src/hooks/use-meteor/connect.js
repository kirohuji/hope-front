import { useState, useEffect } from 'react';
import { createServer } from './server';
import { getBindUser } from './user';
import useStore from './state';

export const bindConnect = async (server, setConnection) => {
  server.on('connected', () => setConnection(true));
  server.on('disconnected', () => setConnection(false));

  await server.connect();
};

export const useConnect = (endpoint) => {
  const [server, setServer] = useState(null);
  const setConnected = useStore((state) => state.setConnected);

  const bindUser = getBindUser();

  useEffect(() => {
    const currentCurrent = createServer(endpoint);

    const connect = async () => {
      await bindConnect(currentCurrent, setConnected);
      await bindUser(currentCurrent);
    };

    setServer(currentCurrent);
    connect();
  }, [bindUser, endpoint, setConnected]);

  return server;
};

export const useConnectionState = () => {
  const connectionState = useStore((state) => state.connected);
  return connectionState;
};
