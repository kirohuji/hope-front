import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress from '@mui/material/CircularProgress';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// assets
import { PlanFreeIcon, PlanStarterIcon, PlanPremiumIcon } from 'src/assets/icons';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'notistack';
import { useAuthContext } from 'src/auth/hooks';
import { Capacitor } from '@capacitor/core';
import { orderService } from 'src/composables/context-provider';
import { useRevenueCat } from 'src/composables/use-revenue-cat';
//
import { AddressListDialog } from '../address';
import PaymentCardListDialog from '../payment/payment-card-list-dialog';

// ----------------------------------------------------------------------

export default function AccountBillingPlan({ cardList, addressBook, plans }) {
  const { refresh, user } = useAuthContext();
  const { getCurrentUserPlan } = useRevenueCat();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const openAddress = useBoolean();
  const openCards = useBoolean();
  const [currentUserPlan, setCurrentUserPlan] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const primaryAddress = addressBook.filter((address) => address.primary)[0];

  const primaryCard = cardList.filter((card) => card.primary)[0];

  const [selectedPlan, setSelectedPlan] = useState('');

  const [selectedAddress, setSelectedAddress] = useState(primaryAddress);

  const [selectedCard, setSelectedCard] = useState(primaryCard);

  const handleSelectPlan = useCallback(
    (newValue) => {
      if (selectedPlan) {
        const currentPlan = plans.find((plan) => plan.label === selectedPlan);
        if (currentPlan && currentPlan.label !== newValue) {
          setSelectedPlan(newValue);
        }
      } else {
        setSelectedPlan(newValue);
      }
    },
    [plans, selectedPlan]
  );

  const handleSelectAddress = useCallback((newValue) => {
    setSelectedAddress(newValue);
  }, []);

  const handleSelectCard = useCallback((newValue) => {
    setSelectedCard(newValue);
  }, []);

  const handleChangePlan = useCallback(() => {
    const currentPlan = plans.find((plan) => plan.label === selectedPlan);
    router.push(`${paths.payment}?plan=${currentPlan._id}`);
  }, [router, selectedPlan, plans]);

  const renderPlans = plans.map((plan) => (
    <Grid xs={12} md={4} key={plan.label}>
      <Stack
        component={Paper}
        variant="outlined"
        onClick={() => handleSelectPlan(plan.label)}
        sx={{
          p: 1.5,
          position: 'relative',
          cursor: 'pointer',
          ...(plan.primary && {
            opacity: 0.48,
            cursor: 'default',
          }),
          ...(plan.label === selectedPlan && {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.text.primary}`,
          }),
        }}
      >
        {plan.primary && (
          <Label
            color="info"
            startIcon={<Iconify icon="eva:star-fill" />}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            当前
          </Label>
        )}

        <Box sx={{ width: 24, height: 24 }}>
          {plan.label === '种子会员' && <PlanFreeIcon />}
          {plan.label === '成长会员' && <PlanStarterIcon />}
          {plan.label === '赋能会员' && <PlanPremiumIcon />}
        </Box>

        <Box sx={{ typography: 'subtitle2', mt: 2, mb: 0.5, textTransform: 'capitalize' }}>
          {plan.label}
        </Box>

        <Stack direction="row" alignItems="center" sx={{ typography: 'h4' }}>
          {plan.price || '免费'}

          {!!plan.price && (
            <Box component="span" sx={{ typography: 'body2', color: 'text.disabled', ml: 0.5 }}>
              /月
            </Box>
          )}
        </Stack>
      </Stack>
    </Grid>
  ));

  const handleCancelMembership = useCallback(async () => {
    try {
      await orderService.cancelSubscription({
        _id: currentUserPlan._id,
      });
      enqueueSnackbar('取消会员成功');
      refresh();
    } catch (error) {
      console.error('Error canceling membership:', error);
    }
  }, [currentUserPlan, enqueueSnackbar, refresh]);

  const initEntitlements = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (Capacitor.getPlatform() === 'ios') {
        const plan = await getCurrentUserPlan({
          providedPlans: plans,
          userId: user._id,
        });
        if (plan) {
          setCurrentUserPlan(plan);
          setSelectedPlan(plan.label);
        } else {
          enqueueSnackbar('未找到有效的会员订阅', { variant: 'warning' });
        }
      } else if (plans.length > 0) {
        const currentPlan = plans.find((plan) => plan._id === user.membership.membershipTypeId) || {};
        setCurrentUserPlan(currentPlan);
        setSelectedPlan(currentPlan.label);
      }
    } catch (error) {
      console.error('Error initializing entitlements:', error);
      enqueueSnackbar('获取会员信息失败', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [plans, user._id, user.membership.membershipTypeId, getCurrentUserPlan, enqueueSnackbar]);

  useEffect(() => {
    initEntitlements();
  }, [initEntitlements]);

  return (
    <>
      <Card>
        <CardHeader title="会员" />

        <Grid container spacing={2} sx={{ p: 2 }}>
          {renderPlans}
        </Grid>

        {isLoading && (
          <Box
            sx={{
              zIndex: 10,
              backgroundColor: '#ffffffc4',
              paddingTop: '92px',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Stack spacing={2} sx={{ p: 2, pt: 0, typography: 'body2' }}>
          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={2} sx={{ color: 'text.secondary' }}>
              会员
            </Grid>
            <Grid xs={12} md={6} sx={{ typography: 'subtitle2', textTransform: 'capitalize' }}>
              {selectedPlan || '-'}
            </Grid>
          </Grid>

          {/* <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Billing name
            </Grid>
            <Grid xs={12} md={8}>
              <Button
                onClick={openAddress.onTrue}
                endIcon={<Iconify width={16} icon="eva:arrow-ios-downward-fill" />}
                sx={{ typography: 'subtitle2', p: 0, borderRadius: 0 }}
              >
                {selectedAddress?.name}
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Billing address
            </Grid>
            <Grid xs={12} md={8} sx={{ color: 'text.secondary' }}>
              {selectedAddress?.fullAddress}
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Billing phone number
            </Grid>
            <Grid xs={12} md={8} sx={{ color: 'text.secondary' }}>
              {selectedAddress?.phoneNumber}
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Payment method
            </Grid>
            <Grid xs={12} md={8}>
              <Button
                onClick={openCards.onTrue}
                endIcon={<Iconify width={16} icon="eva:arrow-ios-downward-fill" />}
                sx={{ typography: 'subtitle2', p: 0, borderRadius: 0 }}
              >
                {selectedCard?.cardNumber}
              </Button>
            </Grid>
          </Grid> */}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack spacing={1.5} direction="row" justifyContent="flex-end" sx={{ p: 3 }}>
          <Button variant="outlined" color="error" disabled={currentUserPlan.label !== selectedPlan} onClick={() => handleCancelMembership()}>取消 会员</Button>
          <Button
            variant="contained"
            onClick={() => handleChangePlan()}
            disabled={currentUserPlan.label === selectedPlan}
          >
            切换 会员
          </Button>
        </Stack>
      </Card>

      <PaymentCardListDialog
        list={cardList}
        open={openCards.value}
        onClose={openCards.onFalse}
        selected={(selectedId) => selectedCard?.id === selectedId}
        onSelect={handleSelectCard}
      />

      <AddressListDialog
        list={addressBook}
        open={openAddress.value}
        onClose={openAddress.onFalse}
        selected={(selectedId) => selectedAddress?.id === selectedId}
        onSelect={handleSelectAddress}
        action={
          <Button
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ alignSelf: 'flex-end' }}
          >
            New
          </Button>
        }
      />
    </>
  );
}

AccountBillingPlan.propTypes = {
  addressBook: PropTypes.array,
  cardList: PropTypes.array,
  plans: PropTypes.array,
};
