import { useEffect, useCallback, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// router
import { useSearchParams } from 'src/routes/hook';
// 
import { membershipTypeService } from 'src/composables/context-provider';
import PaymentSummary from '../payment-summary';
import PaymentMethods from '../payment-methods';
import PaymentBillingAddress from '../payment-billing-address';
// ----------------------------------------------------------------------

export default function PaymentView() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  const [plan, setPlan] = useState({});
  const getPlan = useCallback(async () => {
    const response = await membershipTypeService.get({
      _id: planId,
    });
    setPlan(response);
  }, [planId]);

  useEffect(() => {
    if (planId) {
      getPlan();
    }
  }, [getPlan, planId]);

  return (
    <Container
      sx={{
        pt: 0,
        pb: 10,
        minHeight: 1,
      }}
    >
      <Typography variant="h3" align="center" paragraph>
        让我们完成您的升级！
      </Typography>

      {/* <Typography align="center" sx={{ color: 'text.secondary', mb: 5 }}>
        专业版计划最适合您。
      </Typography> */}

      <Grid container rowSpacing={{ xs: 5, md: 0 }} columnSpacing={{ xs: 0, md: 5 }}>
        {/* <Grid xs={12} md={8}>
          <Box
            gap={5}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
            sx={{
              p: { md: 5 },
              borderRadius: 2,
              border: (theme) => ({
                md: `dashed 1px ${theme.palette.divider}`,
              }),
            }}
          >
            <PaymentBillingAddress />

            <PaymentMethods />
          </Box>
        </Grid> */}

        <Grid xs={12} md={4}>
          <PaymentSummary plan={plan} />
        </Grid>
      </Grid>
    </Container>
  );
}
