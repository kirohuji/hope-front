import { Navigate, useRoutes } from 'react-router-dom';
import { lazy } from 'react';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';
//
import ReturnLayout from 'src/layouts/return';
import { mainRoutes } from './main';
import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';

const AiPage = lazy(() => import('src/pages/dashboard/openai'));
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const DiscoveryDetailPage = lazy(() => import('src/pages/dashboard/discovery-detail'));
const TrainingPage = lazy(() => import('src/pages/dashboard/training/process'));

const TrainingSearchPage = lazy(() => import('src/pages/dashboard/training/search'));

const TrainingSearchDetailPage = lazy(() => import('src/pages/dashboard/training/searchDetail'));

const TrainingDetailPage = lazy(() => import('src/pages/dashboard/training/detail'));

const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));

const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));

const ArticleDetailPage = lazy(() => import('src/pages/dashboard/article/details'));

// System
const SystemGeneralPage = lazy(() => import('src/pages/dashboard/system/general'));

// Privacy
const PrivacyPersonalPage = lazy(() => import('src/sections/system/view/privacy-personal'));
const PrivacyChildrenPage = lazy(() => import('src/sections/system/view/privacy-children'));
const PrivacyThirdPartyPage = lazy(() => import('src/sections/system/view/privacy-third-party'));
const PrivacyConcisePage = lazy(() => import('src/sections/system/view/privacy-concise'));

// Legal
const LegalTermsPage = lazy(() => import('src/sections/system/view/legal-terms'));
const LegalPermissionsPage = lazy(() => import('src/sections/system/view/legal-permissions'));
const LegalICPPage = lazy(() => import('src/sections/system/view/legal-icp'));

// System Info
const SDKListPage = lazy(() => import('src/sections/system/view/sdk-list'));
const CollectInfoListPage = lazy(() => import('src/sections/system/view/collect-info-list'));

const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));


const FaqsPage = lazy(() => import('src/pages/faqs'));

const PaymentPage = lazy(() => import('src/pages/payment'));

const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    // SET INDEX PAGE WITH SKIP HOME PAGE
    {
      path: '/',
      element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    },

    // ----------------------------------------------------------------------

    // SET INDEX PAGE WITH HOME PAGE
    // {
    //   path: '/',
    //   element: (
    //     <MainLayout>
    //       <HomePage />
    //     </MainLayout>
    //   ),
    // },
    {
      path: 'reading',
      element: <ReturnLayout />,
      children: [
        {
          path: ':id',
          element: <ArticleDetailPage />,
        },
      ],
    },
    // Auth routes
    ...authRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // Main routes
    ...mainRoutes,
    {
      element: <ReturnLayout />,
      children: [
        { path: 'payment', element: <PaymentPage /> },
        { path: 'faqs', element: <FaqsPage /> },
        { path: 'chat', element: <ChatPage /> },
        { path: 'discovery', children: [{ path: ':id', element: <DiscoveryDetailPage /> }] },
        { path: 'openai', element: <AiPage /> },
        {
          path: 'training',
          element: <TrainingPage />,
        },
        // Privacy routes
        {
          path: 'privacy/personal',
          element: <PrivacyPersonalPage />
        },
        {
          path: 'privacy/children',
          element: <PrivacyChildrenPage />
        },
        {
          path: 'privacy/third-party',
          element: <PrivacyThirdPartyPage />
        },
        {
          path: 'privacy/concise',
          element: <PrivacyConcisePage />
        },
        // Legal routes
        {
          path: 'legal/terms',
          element: <LegalTermsPage />
        },
        {
          path: 'legal/permissions',
          element: <LegalPermissionsPage />
        },
        {
          path: 'legal/icp',
          element: <LegalICPPage />
        },
        // System Info routes
        {
          path: 'system/sdk-list',
          element: <SDKListPage />
        },
        {
          path: 'system/collect-info-list',
          element: <CollectInfoListPage />
        },
        {
          path: 'training/detail',
          element: <TrainingDetailPage />,
        },
        {
          path: 'training/search',
          element: <TrainingSearchPage />,
        },
        {
          path: 'training/search/detail/:id',
          element: <TrainingSearchDetailPage />,
        },
        { path: 'account', element: <UserAccountPage /> },
        { path: 'profile', element: <UserProfilePage /> },
        { path: 'system', element: <SystemGeneralPage /> },
        { path: 'order/:id', element: <OrderDetailsPage /> },
        { path: 'calender', element: <CalendarPage /> }
      ],
    },
    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

