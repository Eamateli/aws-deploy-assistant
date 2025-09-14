// Export all contexts and providers
export { default as AppContext, AppProvider, useApp, useCurrentStep, useAnalysis, useSelectedArchitecture, usePreferences, useUI } from './AppContext';
export { default as AnalysisContext, AnalysisProvider, useAnalysisContext } from './AnalysisContext';
export { default as RecommendationContext, RecommendationProvider, useRecommendationContext } from './RecommendationContext';
// export { default as DeploymentContext, DeploymentProvider, useDeploymentContext } from './DeploymentContext';
export { default as NotificationContext, NotificationProvider, useNotifications, NotificationContainer, NotificationTypes } from './NotificationContext';

// Combined provider component for easy setup
import React from 'react';
import { AppProvider } from './AppContext';
import { AnalysisProvider } from './AnalysisContext';
import { RecommendationProvider } from './RecommendationContext';
// import { DeploymentProvider } from './DeploymentContext';
import { NotificationProvider } from './NotificationContext';

export const CombinedProvider = ({ children }) => {
  return (
    <AppProvider>
      <NotificationProvider>
        <AnalysisProvider>
          <RecommendationProvider>
            {children}
          </RecommendationProvider>
        </AnalysisProvider>
      </NotificationProvider>
    </AppProvider>
  );
};