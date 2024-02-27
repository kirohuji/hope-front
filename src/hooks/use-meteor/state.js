/* eslint-disable import/no-extraneous-dependencies */
import { create } from 'zustand';

const useStore = create((set) => ({
  connected: false,
  setConnected: (connected) => set((state) => ({ connected })),

  // userId: null,
  // userToken: null,
  // setUserId: (userId, userToken) => set((state) => ({ userId, userToken })),

  // user: null,
  // setUser: (user) => set((state) => ({ user })),

  loggingIn: true,
  setLoggingIn: (loggingIn) => set((state) => ({ loggingIn })),
}));

export default useStore;
