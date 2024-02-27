import { createElement } from 'react';
import { MeteorContext } from './context';
import { useConnect } from './connect';

export const MeteorProvider = ({ endpoint, children }) => {
  const server = useConnect(endpoint);

  const provider = createElement(MeteorContext.Provider, { value: server }, children);

  return provider;
};
