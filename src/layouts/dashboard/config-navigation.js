import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
// import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name, sx) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={sx || { width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

export const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  chat2: icon('ic_chat', { width: '56px', height: '38px' }),
  openai: icon('ic_mail'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  broadcast: icon('ic_tour'),
  notification: icon('ic_banking'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  version: icon('ic_lock'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      // {
      //   subheader: t('overview'),
      //   items: [
      //     // { title: t('app'), path: paths.dashboard.root, icon: ICONS.dashboard },
      //     { title: t('ecommerce'), path: paths.dashboard.general.ecommerce, icon: ICONS.ecommerce },
      //     { title: t('analytics'), path: paths.dashboard.general.analytics, icon: ICONS.analytics },
      //     { title: t('banking'), path: paths.dashboard.general.banking, icon: ICONS.banking },
      //     { title: t('booking'), path: paths.dashboard.general.booking, icon: ICONS.booking },
      //     { title: t('file'), path: paths.dashboard.general.file, icon: ICONS.file },
      //   ],
      // },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t('management'),
        items: [
          // SCOPE
          {
            title: t('scope'),
            auth: ['Scope', 'ScopeList', 'ScopeListAdd', 'ScopeListEdit', 'ScopeListDelete'],
            path: paths.dashboard.scope.root,
            icon: ICONS.job,
            children: [
              { title: t('list'), path: paths.dashboard.scope.root, auth: ['ScopeList'] },
              // { title: t('details'), path: paths.dashboard.scope.demo.details },
              // { title: t('create'), path: paths.dashboard.scope.new },
              // { title: t('edit'), path: paths.dashboard.scope.demo.edit },
            ],
          },
          // VERSION
          {
            title: t('version'),
            auth: [
              'Version',
              'VersionList',
              'VersionListAdd',
              'VersionListEdit',
              'VersionListDelete',
            ],
            path: paths.dashboard.version.root,
            icon: ICONS.version,
            children: [
              { title: t('list'), path: paths.dashboard.version.root, auth: ['VersionList'] },
              // { title: t('details'), path: paths.dashboard.scope.demo.details },
              // { title: t('create'), path: paths.dashboard.scope.new },
              // { title: t('edit'), path: paths.dashboard.scope.demo.edit },
            ],
          },
          // USER
          {
            title: t('user'),
            auth: [
              'User',
              'UserList',
              'UserPermission',
              'UserOrganization',
              'UserListAdd',
              'UserListImport',
              'UserListDelete',
              'UserListEdit',
            ],
            path: paths.dashboard.user.root,
            icon: ICONS.user,
            children: [
              // { title: t('profile'), path: paths.dashboard.user.root },
              // { title: t('cards'), path: paths.dashboard.user.cards },
              { title: t('list'), path: paths.dashboard.user.list, auth: ['UserList'] },
              // { title: t('create'), path: paths.dashboard.user.new },
              // { title: t('edit'), path: paths.dashboard.user.demo.edit },
              // { title: t('account'), path: paths.dashboard.user.account },
              {
                title: t('organization'),
                path: paths.dashboard.user.organization,
                auth: ['UserOrganization'],
              },
              {
                title: t('permission'),
                path: paths.dashboard.user.permission,
                auth: ['UserPermission'],
              },
            ],
          },

          // PRODUCT
          // {
          //   title: t('product'),
          //   path: paths.dashboard.product.root,
          //   icon: ICONS.product,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.product.root },
          //     { title: t('details'), path: paths.dashboard.product.demo.details },
          //     { title: t('create'), path: paths.dashboard.product.new },
          //     { title: t('edit'), path: paths.dashboard.product.demo.edit },
          //   ],
          // },

          // ORDER
          {
            title: t('order'),
            path: paths.dashboard.order.root,
            icon: ICONS.order,
            children: [
              { title: t('list'), path: paths.dashboard.order.root },
              { title: t('details'), path: paths.dashboard.order.demo.details },
            ],
          },

          // INVOICE
          // {
          //   title: t('invoice'),
          //   path: paths.dashboard.invoice.root,
          //   icon: ICONS.invoice,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.invoice.root },
          //     // { title: t('details'), path: paths.dashboard.invoice.demo.details },
          //     // { title: t('create'), path: paths.dashboard.invoice.new },
          //     // { title: t('edit'), path: paths.dashboard.invoice.demo.edit },
          //   ],
          // },

          // // BLOG
          // {
          //   title: t('blog'),
          //   path: paths.dashboard.post.root,
          //   icon: ICONS.blog,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.post.root },
          //     { title: t('details'), path: paths.dashboard.post.demo.details },
          //     { title: t('create'), path: paths.dashboard.post.new },
          //     { title: t('edit'), path: paths.dashboard.post.demo.edit },
          //   ],
          // },
          // POST
          {
            title: t('post'),
            path: paths.dashboard.post.root,
            icon: ICONS.blog,
            children: [
              { title: t('list'), path: paths.dashboard.post.root },
              // { title: t('details'), path: paths.dashboard.post.demo.details },
              // { title: t('create'), path: paths.dashboard.post.new },
              // { title: t('edit'), path: paths.dashboard.post.demo.edit },
            ],
          },

          // JOB
          // {
          //   title: t('job'),
          //   path: paths.dashboard.job.root,
          //   icon: ICONS.job,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.job.root },
          //     { title: t('details'), path: paths.dashboard.job.demo.details },
          //     { title: t('create'), path: paths.dashboard.job.new },
          //     { title: t('edit'), path: paths.dashboard.job.demo.edit },
          //   ],
          // },
          // BOOK
          {
            title: t('book'),
            auth: ['Book', 'BookList', 'BookListAdd', 'BookListEdit', 'BookListDelete'],
            path: paths.dashboard.book.root,
            icon: ICONS.menuItem,
            children: [
              { title: t('list'), path: paths.dashboard.book.root, auth: ['BookList'] },
              // { title: t('details'), path: paths.dashboard.book.demo.details },
              // { title: t('create'), path: paths.dashboard.book.new },
              // { title: t('edit'), path: paths.dashboard.book.demo.edit },
            ],
          },
          {
            title: t('audit'),
            auth: ['Audit', 'AuditList', 'AuditListAdd', 'AuditListEdit', 'AuditListDelete'],
            path: paths.dashboard.audit.root,
            icon: ICONS.ecommerce,
            children: [
              { title: t('list'), path: paths.dashboard.audit.root, auth: ['AuditList'] },
              // { title: t('details'), path: paths.dashboard.book.demo.details },
              // { title: t('create'), path: paths.dashboard.book.new },
              // { title: t('edit'), path: paths.dashboard.book.demo.edit },
            ],
          },
          // {
          //   title: t('bpmn'),
          //   auth: ['Bpmn', 'BpmnList', 'BpmnListAdd', 'BpmnListEdit', 'BpmnListDelete'],
          //   path: paths.dashboard.bpmn.root,
          //   icon: ICONS.product,
          //   children: [
          //     { title: t('bpmn_digram_list'), path: paths.dashboard.bpmn.root, auth: ['BpmnList'] },
          //     {
          //       title: t('bpmn_instance_list'),
          //       path: paths.dashboard.bpmn.instances,
          //       auth: ['BpmnList'],
          //     },
          //     // { title: t('details'), path: paths.dashboard.book.demo.details },
          //     // { title: t('create'), path: paths.dashboard.book.new },
          //     // { title: t('edit'), path: paths.dashboard.book.demo.edit },
          //   ],
          // },
          // ATRICLE
          // {
          //   title: t('article'),
          //   auth: ['Article'],
          //   path: paths.dashboard.article.root,
          //   icon: ICONS.blog,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.article.root },
          //     { title: t('details'), path: paths.dashboard.article.demo.details },
          //     { title: t('create'), path: paths.dashboard.article.new },
          //     { title: t('edit'), path: paths.dashboard.article.demo.edit },
          //   ],
          // },
          // ACCESS
          // {
          //   title: t('access'),
          //   path: paths.dashboard.access.root,
          //   icon: ICONS.mail,
          // },
          // DICTIONARY
          {
            title: t('dictionary'),
            path: paths.dashboard.dictionary.root,
            icon: ICONS.mail,
          },
          // { title: t('subscription'), path: paths.dashboard.general.booking, icon: ICONS.booking },
          // { title: t('membership'), path: paths.dashboard.membership, icon: ICONS.booking },
          // TOUR
          // {
          //   title: t('tour'),
          //   path: paths.dashboard.tour.root,
          //   icon: ICONS.tour,
          //   children: [
          //     { title: t('list'), path: paths.dashboard.tour.root },
          //     { title: t('details'), path: paths.dashboard.tour.demo.details },
          //     { title: t('create'), path: paths.dashboard.tour.new },
          //     { title: t('edit'), path: paths.dashboard.tour.demo.edit },
          //   ],
          // },

          {
            title: t('broadcast'),
            path: paths.dashboard.broadcast.root,
            auth: [
              'Broadcast',
              'BroadcastList',
              'BroadcastListAdd',
              'BroadcastListEdit',
              'BroadcastListDelete',
            ],
            icon: ICONS.broadcast,
            children: [
              { title: t('list'), path: paths.dashboard.broadcast.root, auth: ['BroadcastList'] },
              // { title: t('details'), path: paths.dashboard.broadcast.demo.details },
              // { title: t('create'), path: paths.dashboard.broadcast.new },
              // { title: t('edit'), path: paths.dashboard.broadcast.demo.edit },
            ],
          },
          {
            title: t('membership'),
            path: paths.dashboard.membership.root,
            icon: ICONS.booking,
            children: [
              {
                title: t('list'),
                path: paths.dashboard.membership.root,
              },
            ],
          },
          {
            title: t('notification'),
            path: paths.dashboard.notification.root,
            auth: [
              'Notification',
              'NotificationList',
              'NotificationListAdd',
              'NotificationListEdit',
              'NotificationListDelete',
            ],
            icon: ICONS.notification,
            children: [
              {
                title: t('list'),
                path: paths.dashboard.notification.root,
                auth: ['NotificationList'],
              },
            ],
          },

          // FILE MANAGER
          {
            title: t('file_manager'),
            path: paths.dashboard.fileManager,
            icon: ICONS.folder,
            auth: ['FileManager'],
          },
          // AI
          // {
          //   title: t('openai'),
          //   path: paths.dashboard.openai,
          //   icon: ICONS.openai,
          //   auth: [
          //     'Broadcast',
          //     'BroadcastList',
          //     'BroadcastListAdd',
          //     'BroadcastListEdit',
          //     'BroadcastListDelete',
          //   ],
          //   info: <Label color="error">+32</Label>,
          // },
          // MAIL
          // {
          //   title: t('mail'),
          //   path: paths.dashboard.mail,
          //   icon: ICONS.mail,
          //   auth: [
          //     'Broadcast',
          //     'BroadcastList',
          //     'BroadcastListAdd',
          //     'BroadcastListEdit',
          //     'BroadcastListDelete',
          //   ],
          //   info: <Label color="error">+32</Label>,
          // },

          // CHAT
          {
            title: t('chat'),
            path: paths.dashboard.chat,
            icon: ICONS.chat,
          },

          // CALENDAR
          {
            title: t('calendar'),
            auth: ['Calendar'],
            path: paths.dashboard.calendar,
            icon: ICONS.calendar,
          },

          // KANBAN
          // {
          //   title: t('kanban'),
          //   auth: ['Kanban'],
          //   path: paths.dashboard.kanban,
          //   icon: ICONS.kanban,
          // },
        ],
      },

      // DEMO MENU STATES
      // {
      //   subheader: t(t('other_cases')),
      //   items: [
      //     {
      //       // default roles : All roles can see this entry.
      //       // roles: ['user'] Only users can see this item.
      //       // roles: ['admin'] Only admin can see this item.
      //       // roles: ['admin', 'manager'] Only admin/manager can see this item.
      //       // Reference from 'src/guards/RoleBasedGuard'.
      //       title: t('item_by_roles'),
      //       path: paths.dashboard.permission,
      //       icon: ICONS.lock,
      //       roles: ['admin', 'manager'],
      //       caption: t('only_admin_can_see_this_item'),
      //     },
      //     {
      //       title: t('menu_level'),
      //       path: '#/dashboard/menu_level',
      //       icon: ICONS.menuItem,
      //       children: [
      //         {
      //           title: t('menu_level_1a'),
      //           path: '#/dashboard/menu_level/menu_level_1a',
      //         },
      //         {
      //           title: t('menu_level_1b'),
      //           path: '#/dashboard/menu_level/menu_level_1b',
      //           children: [
      //             {
      //               title: t('menu_level_2a'),
      //               path: '#/dashboard/menu_level/menu_level_1b/menu_level_2a',
      //             },
      //             {
      //               title: t('menu_level_2b'),
      //               path: '#/dashboard/menu_level/menu_level_1b/menu_level_2b',
      //               children: [
      //                 {
      //                   title: t('menu_level_3a'),
      //                   path: '#/dashboard/menu_level/menu_level_1b/menu_level_2b/menu_level_3a',
      //                 },
      //                 {
      //                   title: t('menu_level_3b'),
      //                   path: '#/dashboard/menu_level/menu_level_1b/menu_level_2b/menu_level_3b',
      //                 },
      //               ],
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //     {
      //       title: t('item_disabled'),
      //       path: '#disabled',
      //       icon: ICONS.disabled,
      //       disabled: true,
      //     },
      //     {
      //       title: t('item_label'),
      //       path: '#label',
      //       icon: ICONS.label,
      //       info: (
      //         <Label color="info" startIcon={<Iconify icon="solar:bell-bing-bold-duotone" />}>
      //           NEW
      //         </Label>
      //       ),
      //     },
      //     {
      //       title: t('item_caption'),
      //       path: '#caption',
      //       icon: ICONS.menuItem,
      //       caption:
      //         'Quisque malesuada placerat nisl. In hac habitasse platea dictumst. Cras id dui. Pellentesque commodo eros a enim. Morbi mollis tellus ac sapien.',
      //     },
      //     {
      //       title: t('item_external_link'),
      //       path: 'https://www.google.com/',
      //       icon: ICONS.external,
      //     },
      //     {
      //       title: t('blank'),
      //       path: paths.dashboard.blank,
      //       icon: ICONS.blank,
      //     },
      //   ],
      // },
    ],
    [t]
  );

  return data;
}
