import { Navigate, useRoutes } from 'react-router-dom';
import { lazy } from 'react';
// layouts
import MainLayout from 'src/layouts/main';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';
//
import ReturnLayout from 'src/layouts/return';
import { mainRoutes, HomePage } from './main';
import { authRoutes } from './auth';
import { authDemoRoutes } from './auth-demo';
import { dashboardRoutes } from './dashboard';
import { componentsRoutes } from './components';

const AiPage = lazy(() => import('src/pages/dashboard/openai'));
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
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
    ...authDemoRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // Main routes
    ...mainRoutes,

    // Components routes
    ...componentsRoutes,
    {
      element: <ReturnLayout />,
      children: [
        { path: 'faqs', element: <FaqsPage /> },
        { path: 'chat', element: <ChatPage /> },
        { path: 'openai', element: <AiPage /> },
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
