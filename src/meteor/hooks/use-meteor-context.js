import { useEffect, useContext, useState } from 'react';
//
import _ from 'lodash';
import { MeteorContext } from '../context';
// ----------------------------------------------------------------------
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

const collectionMap = {};

const getCollection = (server, collectionName, args) => {
  let collection = collectionMap[collectionName];
  if (collection) {
    return collection;
  }

  collection = server.collection(collectionName);
  collectionMap[collectionName] = collection;
  return collection;
};

const collectionCallbackMap = {};

const getCollectionCallbck = (name, callback) => {
  const collectionCallback = collectionCallbackMap[name];
  if (collectionCallback) {
    return true;
  }
  collectionCallbackMap[name] = callback;
  return false;
};

export const useMeteorContext = () => {
  const context = useContext(MeteorContext);

  if (!context) throw new Error('useMeteorContext context must be use inside MeteorProvider');

  return context;
};

export const useCollection = (name, condition, callback) => {
  const { server } = useContext(MeteorContext);

  useEffect(() => {
    if (!server) {
      return () => {};
    }
    if (condition && !condition()) {
      return () => {};
    }
    if (!getCollectionCallbck(name, callback)) {
      const collection = getCollection(server, name);
      collection.onChange(callback);
    }
    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, callback]);
};

export const useSubscription = (subName, condition, args = []) => {
  const [ready, setReady] = useState(false);
  const { server } = useContext(MeteorContext);
  useEffect(() => {
    if (!server) {
      return () => {};
    }
    if (condition && !condition() && ready) {
      return () => {};
    }
    const sub = getSub(server, subName, args);
    const fn = async () => {
      const isOn = await sub.isOn()
      if (isOn) {
        await sub.restart(args);
        await sub.ready();
      } else {
        await sub.ready();
      }
      setReady(true);
    };

    fn();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition]);

  return ready;
};

const noFilter = () => true;

export const useCollectionReactive = (name, filter = noFilter) => {
  const [data, setData] = useState([]);
  const { server } = useContext(MeteorContext);

  useEffect(() => {
    if (!server) {
      return () => {};
    }

    const reactiveCursor = server.collection(name).filter(filter).reactive();
    reactiveCursor.onChange((newData) => setData(_.cloneDeep(newData)));
    setData(_.cloneDeep(reactiveCursor.data()));
    return () => reactiveCursor.stop();
  }, [server, name, filter]);

  return data;
};

export const useCollectionReactiveOne = (name, filter = noFilter) => {
  const [data, setData] = useState(null);
  const { server } = useContext(MeteorContext);

  useEffect(() => {
    if (!server) {
      return () => {};
    }

    const reactiveList = server.collection(name).filter(filter).reactive();
    const reactiveCursor = reactiveList.one();
    reactiveCursor.onChange((newData) => {
      if (reactiveList.count().result > 0) {
        setData(_.cloneDeep(newData));
      }
    });

    if (reactiveList.count().result > 0) {
      setData(_.cloneDeep(reactiveCursor.data()));
    }

    return () => reactiveCursor.stop();
  }, [server, name, filter]);

  return data;
};
