import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
// PRODUCT
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// ORDER
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// INVOICE
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// USER
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// BLOG
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// JOB
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));

// SCOPE
const ScopeDetailsPage = lazy(() => import('src/pages/dashboard/scope/details'));
const ScopeListPage = lazy(() => import('src/pages/dashboard/scope/list'));
const ScopeCreatePage = lazy(() => import('src/pages/dashboard/scope/new'));
const ScopeEditPage = lazy(() => import('src/pages/dashboard/scope/edit'));

// VERSION
const VersionDetailsPage = lazy(() => import('src/pages/dashboard/version/details'));
const VersionListPage = lazy(() => import('src/pages/dashboard/version/list'));
const VersionCreatePage = lazy(() => import('src/pages/dashboard/version/new'));
const VersionMajorCreatePage = lazy(() => import('src/pages/dashboard/version/major-new'));
const VersionEditPage = lazy(() => import('src/pages/dashboard/version/edit'));
const VersionMajorEditPage = lazy(() => import('src/pages/dashboard/version/major-edit'));

// BOOK
const BookDetailsPage = lazy(() => import('src/pages/dashboard/book/details'));
const BookListPage = lazy(() => import('src/pages/dashboard/book/list'));
const BookCreatePage = lazy(() => import('src/pages/dashboard/book/new'));
const BookEditPage = lazy(() => import('src/pages/dashboard/book/edit'));

// ARTICLE
const ArticleListPage = lazy(() => import('src/pages/dashboard/article/list'));
const ArticleDetailPage = lazy(() => import('src/pages/dashboard/article/details'));
const ArticleCreatePage = lazy(() => import('src/pages/dashboard/article/new'));
const ArticleEditPage = lazy(() => import('src/pages/dashboard/article/edit'));

// Access
const AccessPage = lazy(() => import('src/pages/dashboard/access'));
// Dictionary
const DictionaryPage = lazy(() => import('src/pages/dashboard/dictionary'));
// TOUR
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));

// BROADCAST
const BroadcastDetailsPage = lazy(() => import('src/pages/dashboard/broadcast/details'));
const BroadcastListPage = lazy(() => import('src/pages/dashboard/broadcast/list'));
const BroadcastCreatePage = lazy(() => import('src/pages/dashboard/broadcast/new'));
const BroadcastEditPage = lazy(() => import('src/pages/dashboard/broadcast/edit'));
// FILE MANAGER
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// APP
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const AiPage = lazy(() => import('src/pages/dashboard/openai'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// BLANK PAGE
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));
// ORGANIZATION PAGE
const UserOrganizationPage = lazy(() => import('src/pages/dashboard/user/organization'));

const UserPermissionPage = lazy(() => import('src/pages/dashboard/user/permission'));

const TrainingDashboardPage = lazy(() => import('src/pages/dashboard/training/dashboard'));

const TrainingPage = lazy(() => import('src/pages/dashboard/training/process'));

// Audit
const AuditListPage = lazy(() => import('src/pages/dashboard/audit/list'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      // { element: <IndexPage />, index: true },
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      {
        path: 'training/dashboard',
        element: <TrainingPage />,
      },
      {
        path: 'user',
        children: [
          { element: <UserProfilePage />, index: true },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          { path: 'account', element: <UserAccountPage /> },
          { path: 'organization', element: <UserOrganizationPage /> },
          { path: 'permission', element: <UserPermissionPage /> },
        ],
      },
      {
        path: 'product',
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> },
        ],
      },
      {
        path: 'order',
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },
      {
        path: 'post',
        children: [
          { element: <BlogPostsPage />, index: true },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> },
        ],
      },
      {
        path: 'job',
        children: [
          { element: <JobListPage />, index: true },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> },
        ],
      },
      {
        path: 'scope',
        children: [
          { element: <ScopeListPage />, index: true },
          { path: 'list', element: <ScopeListPage /> },
          { path: ':id', element: <ScopeDetailsPage /> },
          { path: 'new', element: <ScopeCreatePage /> },
          { path: ':id/edit', element: <ScopeEditPage /> },
        ],
      },
      {
        path: 'version',
        children: [
          { element: <VersionListPage />, index: true },
          { path: 'list', element: <VersionListPage /> },
          { path: ':id', element: <VersionDetailsPage /> },
          { path: ':id/tab/:tabId', element: <VersionDetailsPage /> },
          { path: ':id/new', element: <VersionCreatePage /> },
          { path: 'major/new', element: <VersionMajorCreatePage /> },
          { path: ':id/edit', element: <VersionEditPage /> },
          { path: 'major/:id/edit', element: <VersionMajorEditPage /> },
        ],
      },
      {
        path: 'book',
        children: [
          { element: <BookListPage />, index: true },
          { path: 'list', element: <BookListPage /> },
          { path: ':id', element: <BookDetailsPage /> },
          { path: ':id/tab/:tabId', element: <BookDetailsPage /> },
          { path: 'new', element: <BookCreatePage /> },
          { path: ':id/edit', element: <BookEditPage /> },
          { path: ':id/article/new', element: <ArticleCreatePage /> },
          { path: ':id/article/:articleId/edit', element: <ArticleEditPage /> },
        ],
      },
      {
        path: 'article',
        children: [
          { element: <ArticleListPage />, index: true },
          { path: 'list', element: <ArticleListPage /> },
          { path: ':id', element: <ArticleDetailPage /> },
          { path: ':id/edit', element: <ArticleEditPage /> },
          { path: 'new', element: <ArticleCreatePage /> },
        ],
      },
      {
        path: 'access',
        children: [{ element: <AccessPage />, index: true }],
      },
      {
        path: 'dictionary',
        children: [{ element: <DictionaryPage />, index: true }],
      },
      {
        path: 'tour',
        children: [
          { element: <TourListPage />, index: true },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> },
        ],
      },
      {
        path: 'broadcast',
        children: [
          { element: <BroadcastListPage />, index: true },
          { path: 'list', element: <BroadcastListPage /> },
          { path: ':id', element: <BroadcastDetailsPage /> },
          { path: 'new', element: <BroadcastCreatePage /> },
          { path: ':id/edit', element: <BroadcastEditPage /> },
        ],
      },
      {
        path: 'audit',
        children: [
          { element: <AuditListPage />, index: true },
          { path: 'list', element: <AuditListPage /> },
          { path: ':id', element: <BroadcastDetailsPage /> },
          { path: 'new', element: <BroadcastCreatePage /> },
          { path: ':id/edit', element: <BroadcastEditPage /> },
        ],
      },
      { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'openai', element: <AiPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'blank', element: <BlankPage /> },
    ],
  },
];
