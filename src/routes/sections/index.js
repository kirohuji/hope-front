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

const FaqsPage = lazy(() => import('src/pages/faqs'));

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
        { path: 'faqs', element: <FaqsPage /> },
        { path: 'chat', element: <ChatPage /> },
        { path: 'discovery', children: [{ path: ':id', element: <DiscoveryDetailPage /> }] },
        { path: 'openai', element: <AiPage /> },
        {
          path: 'training',
          element: <TrainingPage />,
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
      ],
    },
    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
