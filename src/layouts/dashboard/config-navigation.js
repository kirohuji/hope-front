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
      {
        subheader: t('management'),
        items: [
          {
            title: t('scope'),
            auth: ['Scope', 'ScopeList', 'ScopeListAdd', 'ScopeListEdit', 'ScopeListDelete'],
            path: paths.dashboard.scope.root,
            icon: ICONS.job,
            children: [
              { title: t('list'), path: paths.dashboard.scope.root, auth: ['ScopeList'] },
            ],
          },
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
            ],
          },
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
              { title: t('list'), path: paths.dashboard.user.list, auth: ['UserList'] },
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
          {
            title: t('dictionary'),
            path: paths.dashboard.dictionary.root,
            icon: ICONS.mail,
          },
          {
            title: t('order'),
            path: paths.dashboard.order.root,
            icon: ICONS.order,
          },
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
            title: t('book'),
            auth: ['Book', 'BookList', 'BookListAdd', 'BookListEdit', 'BookListDelete'],
            path: paths.dashboard.book.root,
            icon: ICONS.menuItem,
            children: [
              { title: t('list'), path: paths.dashboard.book.root, auth: ['BookList'] },
            ],
          },
          {
            title: t('audit'),
            auth: ['Audit', 'AuditList', 'AuditListAdd', 'AuditListEdit', 'AuditListDelete'],
            path: paths.dashboard.audit.root,
            icon: ICONS.ecommerce,
            children: [
              { title: t('list'), path: paths.dashboard.audit.root, auth: ['AuditList'] },
            ],
          },
        ],
      },
    ],
    [t]
  );

  return data;
}
