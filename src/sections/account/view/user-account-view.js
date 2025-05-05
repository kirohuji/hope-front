import { useState, useCallback, useEffect } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// _mock
import { _userAbout, _userPlans, _userPayment, _userInvoices, _userAddressBook } from 'src/_mock';
// components
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useResponsive } from 'src/hooks/use-responsive';
import { membershipTypeService, orderService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter, useSearchParams } from 'src/routes/hook';
//
import AccountGeneral from '../account-general';
import AccountBilling from '../account-billing';
import AccountSocialLinks from '../account-social-links';
import AccountNotifications from '../account-notifications';
import AccountChangePassword from '../account-change-password';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: '基本信息',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: 'billing',
    label: '会员管理',
    icon: <Iconify icon="solar:bill-list-bold" width={24} />,
  },
  // {
  //   value: 'notifications',
  //   label: 'Notifications',
  //   icon: <Iconify icon="solar:bell-bing-bold" width={24} />,
  // },
  // {
  //   value: 'social',
  //   label: 'Social links',
  //   icon: <Iconify icon="solar:share-bold" width={24} />,
  // },
  {
    value: 'security',
    label: '更新密码',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
  },
];

// ----------------------------------------------------------------------

export default function AccountView() {
  const settings = useSettingsContext();
  
  const router = useRouter();

  const searchParams = useSearchParams();

  const { enqueueSnackbar } = useSnackbar();

  const [plans, setPlans] = useState([]);

  const [orders, setOrders] = useState([]);

  const isDesktop = useResponsive('up', 'sm');

  const [loading, setLoading] = useState(true);
  
  const [currentTab, setCurrentTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    return tabFromUrl && TABS.some(tab => tab.value === tabFromUrl) ? tabFromUrl : 'general';
  });

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
    router.replace({
      pathname: router.pathname,
      search: `?tab=${newValue}`,
    });
  }, [router]);

  const getPlans = useCallback(async () => {
    try {
      const response = await membershipTypeService.getAll();
      setPlans(response);
    } catch (error) {
      enqueueSnackbar(error.message);
    }
  }, [enqueueSnackbar]);

  const getOrders = useCallback(async () => {
    try {
      const response = await orderService.getInfo();
      setOrders(response);
    } catch (error) {
      enqueueSnackbar(error.message);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (currentTab === 'billing') {
      setLoading(true);
      getPlans();
      getOrders();
      setLoading(false);
    }
  }, [getPlans, getOrders, currentTab]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {isDesktop && (
        <CustomBreadcrumbs
          heading="个人设置 "
          links={[{ name: '个人设置' }]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
      )}

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>
      <Scrollbar sx={{ p: 0, pb: 0, height: 'calc(100% - 70px)' }}>
        {currentTab === 'general' && <AccountGeneral />}

        {currentTab === 'billing' && loading === false && (
          <AccountBilling
            plans={plans}
            cards={_userPayment}
            invoices={orders}
            addressBook={_userAddressBook}
          />
        )}

        {currentTab === 'notifications' && <AccountNotifications />}

        {currentTab === 'social' && <AccountSocialLinks socialLinks={_userAbout.socialLinks} />}

        {currentTab === 'security' && <AccountChangePassword />}
      </Scrollbar>
    </Container>
  );
}
