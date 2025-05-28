import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { orderService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import ConfirmDialog from 'src/components/confirm-dialog';
import { useRouter } from 'src/routes/hook';

// ----------------------------------------------------------------------

export default function AccountBillingHistory({ invoices }) {
  const router = useRouter();
  const showMore = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleOpenConfirm = (invoice) => {
    setCurrentInvoice(invoice);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setCurrentInvoice(null);
  };

  const handleCancelPayment = async () => {
    try {
      setButtonLoading(true);
      await orderService.cancelOrder({
        _id: currentInvoice._id,
      });
      enqueueSnackbar('撤销成功');
      handleCloseConfirm();
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      enqueueSnackbar('撤销失败');
    } finally {
      setButtonLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'pending':
        return '处理中';
      default:
        return '已取消';
    }
  };

  const renderStatusAction = (invoice) => {
    if (invoice.status === 'completed') {
      return (
        <Link 
          color="inherit" 
          underline="always" 
          variant="body2" 
          sx={{ cursor: 'pointer' }} 
          onClick={(e) => {
            e.stopPropagation();
            orderService.getPDF(invoice._id);
          }}
        >
          PDF
        </Link>
      );
    }
    
    if (invoice.status === 'pending') {
      return (
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenConfirm(invoice);
          }}
          sx={{ minWidth: '80px' }}
        >
          撤销支付
        </Button>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader title="账单记录" />

      <Stack spacing={1.5} sx={{ px: 3, pt: 3 }}>
        {(showMore.value ? invoices : invoices.slice(0, 8)).map((invoice) => (
          <Stack key={invoice._id} direction="row" alignItems="center">
            <ListItemText
              primary={invoice.invoiceNumber || invoice.orderNumber}
              secondary={fDate(invoice.createdAt)}
              onClick={() => {
                router.push(`/order/${invoice._id}`);
              }}
              sx={{
                cursor: 'pointer',
              }}
              primaryTypographyProps={{
                typography: 'body2',
              }}
              secondaryTypographyProps={{
                mt: 0.5,
                component: 'span',
                typography: 'caption',
                color: 'text.disabled',
              }}
            />

            <Typography variant="body2" sx={{ textAlign: 'right', mr: 5 }}>
              {fCurrency(invoice.items?.reduce((total, item) => total + (Number(item.unitPrice) * item.quantity), 0) || 0)}
            </Typography>

            <Typography 
              variant="body2" 
              sx={{ 
                color: invoice.status === 'completed' ? 'success.main' : 'error.main',
                mr: 2,
                fontWeight: 'medium'
              }}
            >
              {getStatusText(invoice.status)}
            </Typography>

            {renderStatusAction(invoice)}
          </Stack>
        ))}

        <Divider sx={{ borderStyle: 'dashed' }} />
      </Stack>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="撤销支付"
        content="确定要撤销这笔支付吗？"
        action={
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleCancelPayment}
            disabled={buttonLoading}
          >
            确定撤销
          </Button>
        }
      />
    </Card>
  );
}

AccountBillingHistory.propTypes = {
  invoices: PropTypes.array,
};
