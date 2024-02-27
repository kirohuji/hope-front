import { useContext, useState, useEffect } from 'react';
import { MeteorContext } from './context';

const subMap = {};

const getSub = (server, subName, args) => {
  let sub = subMap[subName];
  if (sub) {
    return sub;
  }

  sub = server.subscribe(subName, ...args);
  subMap[subName] = sub;
  return sub;
};

export const useSubscription = (subName, args = []) => {
  const [ready, setReady] = useState(false);
  const server = useContext(MeteorContext);

  useEffect(() => {
    if (!server) {
      return () => {};
    }

    const sub = getSub(server, subName, args);

    const fn = async () => {
      const isOn = await sub.isOn();
      if (!isOn) {
        await sub.restart(args);
      }
      await sub.ready();
      setReady(true);
    };

    fn();
    return () => sub.stop();
  }, [args, server, subName]);

  return ready;
};
