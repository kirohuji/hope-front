import PropTypes from 'prop-types';
import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

const RevenueCatContext = createContext(null);

export const RevenueCatProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const initRevenueCat = useCallback(async (userId) => {
    if (Capacitor.getPlatform() === 'ios' && !isInitialized) {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      await Purchases.configure({
        apiKey: process.env.REACT_APP_REVENUECAT_API_KEY,
        appUserID: userId
      });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const value = useMemo(() => ({
    initRevenueCat,
    isInitialized
  }), [initRevenueCat, isInitialized]);

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};

RevenueCatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
}; 