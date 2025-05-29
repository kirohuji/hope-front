import { useState, useEffect, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';

// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
//
import { orderService } from 'src/composables/context-provider';
import OrderDetailsInfo from '../order-details-info';
import OrderDetailsItems from '../order-details-item';
import OrderDetailsToolbar from '../order-details-toolbar';
import OrderDetailsHistory from '../order-details-history';

// ----------------------------------------------------------------------

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
  { value: 'refunded', label: '已退款' },
];

export default function OrderDetailsView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const [order, setOrder] = useState({});

  const [status, setStatus] = useState(order.status);

  const handleChangeStatus = useCallback((newValue) => {
    setStatus(newValue);
  }, []);

  const getData = useCallback(async () => {
    try {
      const response = await orderService.get({
        _id: id,
      });
      setOrder(response);
      setStatus(response.status);
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      getData(id);
    }
  }, [getData, id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {order._id && (
        <>
          <OrderDetailsToolbar
            backLink={paths.dashboard.order.root}
            orderNumber={order.orderNumber}
            createdAt={order.createdAt}
            status={status}
            onChangeStatus={handleChangeStatus}
            statusOptions={ORDER_STATUS_OPTIONS}
          />

          <Grid container spacing={3}>
            <Grid xs={12} md={8}>
              <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
                <OrderDetailsItems
                  items={order.items}
                  taxes={order.taxes}
                  shipping={order.shipping}
                  discount={order.discount}
                  subTotal={order.subTotal}
                  totalAmount={order.totalAmount}
                />

                <OrderDetailsHistory history={order.history} />
              </Stack>
            </Grid>

            <Grid xs={12} md={4}>
              <OrderDetailsInfo
                customer={order.customer}
                delivery={order.delivery}
                payment={order.payment}
                shippingAddress={order.shippingAddress}
              />
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
