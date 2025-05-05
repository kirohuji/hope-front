import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function PaymentSummary({ sx, ...other }) {
  const renderPrice = (
    <Stack direction="row" justifyContent="flex-end">
      <Typography variant="h4">$</Typography>

      <Typography variant="h2">9.99</Typography>

      <Typography
        component="span"
        sx={{ alignSelf: 'center', color: 'text.disabled', ml: 1, typography: 'body2' }}
      >
        / mo
      </Typography>
    </Stack>
  );

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

          <Label color="error">高级版</Label>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            按月计费
          </Typography>
          <Switch defaultChecked />
        </Stack>

        {renderPrice}

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">总计</Typography>

          <Typography variant="subtitle1">$9.99</Typography>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />
      </Stack>

      {/* <Typography component="div" variant="caption" sx={{ color: 'text.secondary', mt: 1 }}>
        * 不含适用税费
      </Typography> */}

      <Button fullWidth size="large" variant="contained" sx={{ mt: 5, mb: 3 }}>
        升级我的计划
      </Button>

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
};
