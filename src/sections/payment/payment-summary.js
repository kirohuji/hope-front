import PropTypes from 'prop-types';
import { useCallback, useState, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useRouter } from 'src/routes/hook';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

import { orderService } from 'src/composables/context-provider';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export default function PaymentSummary({ sx, plan, ...other }) {
  const router = useRouter();

  const { refresh } = useAuthContext();

  const [isYearly, setIsYearly] = useState(false);

  // const [order, setOrder] = useState({});

  const [loading, setLoading] = useState(false);

  const [monthlyPrice, setMonthlyPrice] = useState(0);

  // const yearlyDiscount = 0.20; // 20% discount for yearly plan

  const yearlyPrice = monthlyPrice * 10;

  const { enqueueSnackbar } = useSnackbar();

  const initPurchases = useCallback(async () => {
    if (Capacitor.getPlatform() === 'ios') {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      await Purchases.configure({
        apiKey: process.env.REACT_APP_REVENUECAT_API_KEY,
      });
    }
  }, []);

  useEffect(() => {
    initPurchases();
  }, [initPurchases]);

  const handleUpgradeByBackend = useCallback(async () => {
    try {
      const result = await orderService.changeMembership({
        planId: plan.id || plan._id,
        isYearly,
      });
      return result;
    } catch (error) {
      console.error('Purchase failed:', error);
      setLoading(false);
      return null;
    }
  }, [isYearly, plan._id, plan.id]);

  const handleUpgradeByIos = useCallback(async (result) => {
    console.log('开始购买')
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.all[plan.value];
    if (!currentOffering) {
      enqueueSnackbar({
        message: '当前套餐不存在,请稍后再试',
        variant: 'error',
      });
      return;
    }
    console.log('获取套餐')
    const packageId = isYearly ? '$rc_annual' : '$rc_monthly';
    const selectedPackage = currentOffering.availablePackages.find(p => p.identifier === packageId);

    if (!selectedPackage) {
      console.error('Package not found');
      return;
    }

    await Purchases.purchasePackage({ aPackage: selectedPackage })
      .then(async ({ customerInfo }) => {
        console.log('购买套餐')
        console.log("_id", result.orderId)
        enqueueSnackbar('正在生成订单中...');

        // Handle successful purchase
        console.log('Purchase successful:', customerInfo);

        await orderService.completeMembershipChange({
          orderId: result.orderId,
        });
        console.log('订单完成')
        refresh();
        enqueueSnackbar('购买成功');
        router.back();
      })
      .catch(async (error) => {
        console.log('购买套餐失败')
        console.log("_id", result.orderId)
        await orderService.cancelOrder({
          _id: result.orderId,
        }); 
        console.error('Purchase failed:', error);
        enqueueSnackbar({
          message: '购买失败',
          variant: 'error',
        });
      });
  }, [plan.value, isYearly, enqueueSnackbar, refresh, router]);

  const handleUpgrade = useCallback(async () => {
    setLoading(true);
    const result = await handleUpgradeByBackend();
    if (!result) {
      setLoading(false);
      return;
    }
    if (Capacitor.getPlatform() === 'ios') {
      await handleUpgradeByIos(result);
    } else if (Capacitor.getPlatform() === 'web') {
      try {
        await orderService.completeMembershipChange({
          orderId: result.orderId,
        });
        enqueueSnackbar('购买成功');
        router.back();
      } catch (error) {
        console.error('Purchase failed:', error);
        enqueueSnackbar('购买失败');
      }
    }
    setLoading(false);
  }, [handleUpgradeByBackend, handleUpgradeByIos, enqueueSnackbar, router]);

  const renderPrice = (
    <Stack direction="row" justifyContent="flex-end">
      <Typography variant="h4" sx={{ lineHeight: 2 }}>¥</Typography>

      <Typography variant="h2">
        {isYearly ? yearlyPrice.toFixed(2) : monthlyPrice.toFixed(2)}
      </Typography>

      <Typography
        component="span"
        sx={{ alignSelf: 'center', color: 'text.disabled', ml: 1, typography: 'body2' }}
      >
        / {isYearly ? 'year' : 'mo'}
      </Typography>
    </Stack>
  );

  useEffect(() => {
    if (plan) {
      setMonthlyPrice(Number(plan.price));
    }
  }, [plan]);

  return (
    <Box
      sx={{
        p: 5,
        borderRadius: 2,
        bgcolor: 'background.neutral',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" sx={{ mb: 5 }}>
        订单摘要
      </Typography>

      <Stack spacing={2.5}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            订阅类型
          </Typography>

          <Label color="error">{plan.label}</Label>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            按年计费
          </Typography>
          <Switch
            checked={isYearly}
            onChange={(e) => setIsYearly(e.target.checked)}
          />
        </Stack>

        {renderPrice}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">总计</Typography>

          <Typography variant="subtitle1">
            ¥{isYearly ? yearlyPrice.toFixed(2) : monthlyPrice.toFixed(2)}
          </Typography>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />
      </Stack>

      {/* <Typography component="div" variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
        * 不含适用税费
      </Typography> */}

      <LoadingButton loading={loading} fullWidth size="large" variant="contained" sx={{ mt: 5, mb: 3 }} onClick={handleUpgrade}>
        更新我的计划
      </LoadingButton>

      <Stack alignItems="center" spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:shield-check-bold" sx={{ color: 'success.main' }} />
          <Typography variant="subtitle2">安全支付</Typography>
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
          这是128位SSL加密的安全支付
        </Typography>
      </Stack>
    </Box>
  );
}

PaymentSummary.propTypes = {
  sx: PropTypes.object,
  plan: PropTypes.object,
};
