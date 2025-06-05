import PropTypes from 'prop-types';
import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { membershipTypeService } from 'src/composables/context-provider';

const RevenueCatContext = createContext(null);

export const RevenueCatProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUserPlan, setCurrentUserPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState([]);

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

  const getPlans = useCallback(async () => {
    try {
      const response = await membershipTypeService.getAll();
      setPlans(response);
      return response;
    } catch (error) {
      console.error('Error fetching plans:', error);
      return [];
    }
  }, []);

  const getCurrentUserPlan = useCallback(async ({
    providedPlans = [], userId = null
  }) => {
    try {
      setIsLoading(true);
      if (Capacitor.getPlatform() === 'ios') {
        // Initialize RevenueCat if not already initialized
        if (!isInitialized && userId) {
          await initRevenueCat(userId);
        }

        // Get plans if not provided
        let plansToUse = providedPlans;
        if (!providedPlans || plansToUse.length === 0) {
          plansToUse = await getPlans();
        }

        const { customerInfo } = await Purchases.getCustomerInfo();
        const activeSubscriptions = customerInfo.activeSubscriptions.filter(
          (subscription) => subscription.includes('lourd.jiamai.app.sub.member')
        )[0];

        if (activeSubscriptions) {
          const currentPlan = plansToUse.find((plan) => activeSubscriptions.includes(plan.value)) || null;
          setCurrentUserPlan(currentPlan);
          return currentPlan;
        }
        return null;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user plan:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, initRevenueCat, getPlans]);

  const value = useMemo(() => ({
    initRevenueCat,
    isInitialized,
    currentUserPlan,
    getCurrentUserPlan,
    isLoading,
    plans,
    getPlans
  }), [initRevenueCat, isInitialized, currentUserPlan, getCurrentUserPlan, isLoading, plans, getPlans]);

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