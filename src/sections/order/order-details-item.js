import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export default function OrderDetailsItems({
  items,
  shipping,
  discount,
  taxes,
  subTotal,
  totalAmount,
}) {
  const renderTotal = (
    <Stack
      spacing={2}
      alignItems="flex-end"
      sx={{ my: 3, textAlign: 'right', typography: 'body2' }}
    >
      {/* <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>小计</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(subTotal) || '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>运费</Box>
        <Box
          sx={{
            width: 160,
            ...(shipping && { color: 'error.main' }),
          }}
        >
          {shipping ? `- ${fCurrency(shipping)}` : '-'}
        </Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>优惠</Box>
        <Box
          sx={{
            width: 160,
            ...(discount && { color: 'error.main' }),
          }}
        >
          {discount ? `- ${fCurrency(discount)}` : '-'}
        </Box>
      </Stack> */}

      {/* <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>税率</Box>
        <Box sx={{ width: 160 }}>{taxes ? fCurrency(taxes) : '-'}</Box>
      </Stack> */}

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>总计</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totalAmount) || '-'}</Box>
      </Stack>
    </Stack>
  );

  return (
    <Card>
      <CardHeader title="详情" />

      <Stack
        sx={{
          px: 3,
        }}
      >
        <Scrollbar>
          {items.map((item) => (
            <Stack
              key={item._id}
              direction="row"
              alignItems="center"
              sx={{
                py: 3,
                minWidth: 640,
                borderBottom: (theme) => `dashed 2px ${theme.palette.background.neutral}`,
              }}
            >
              <Avatar src={item.coverUrl} variant="rounded" sx={{ width: 48, height: 48, mr: 2 }} />

              <ListItemText
                primary={item.linkedObject.label}
                secondary={item.objectType === 'memberships_types' && '会员功能'}
                primaryTypographyProps={{
                  typography: 'body2',
                }}
                secondaryTypographyProps={{
                  component: 'span',
                  color: 'text.disabled',
                  mt: 0.5,
                }}
              />

              <Box sx={{ typography: 'body2' }}>x{item.quantity}</Box>

              <Box sx={{ width: 110, textAlign: 'right', typography: 'subtitle2' }}>
                {fCurrency(item.price)}
              </Box>
            </Stack>
          ))}
        </Scrollbar>

        {renderTotal}
      </Stack>
    </Card>
  );
}

OrderDetailsItems.propTypes = {
  discount: PropTypes.number,
  items: PropTypes.array,
  shipping: PropTypes.number,
  subTotal: PropTypes.number,
  taxes: PropTypes.number,
  totalAmount: PropTypes.number,
};
