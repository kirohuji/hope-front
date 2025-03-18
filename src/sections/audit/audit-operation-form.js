/* eslint-disable no-bitwise */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Stack, Button, DialogActions } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';

import { useSnackbar } from 'src/components/snackbar';
// service
import { auditService } from 'src/composables/context-provider';
// ----------------------------------------------------------------------

export const levels = [
  { value: '2', label: '等级二(轻度敏感)' },
  { value: '3', label: '等级三(中度敏感)' },
  { value: '4', label: '等级四(高度敏感)' },
  { value: '5', label: '等级五(极高敏感)' },
];

export const categories = [
  { value: '政治', label: '政治' },
  { value: '宗教', label: '宗教' },
  { value: '暴力', label: '暴力' },
  { value: '色情', label: '色情' },
  { value: '种族歧视', label: '种族歧视' },
  { value: '恶心', label: '恶心' },
  { value: '其他', label: '其他' },
];

AuditOperationForm.propTypes = {
  item: PropTypes.object,
  onCancel: PropTypes.func,
  onClose: PropTypes.func,
  onSubmitData: PropTypes.func,
};
export default function AuditOperationForm({ item, onClose, onCancel, onSubmitData }) {

  const hasData = !!item;

  const { enqueueSnackbar } = useSnackbar();

  const { user } = useAuthContext();

  const Schema = Yup.object().shape({
    status: Yup.string().required('请选择 类别'),
    reason: Yup.string().max(5000),
    reviewerName: Yup.string().required('请输入 审核人'),
  });

  const defaultValues = useMemo(
    () => ({
      status: item?.status || '',
      reviewerName: item.reviewerName || user.displayName,
      reason: item?.reason || '',
    }),
    [item?.reason, item.reviewerName, item?.status, user.displayName]
  );

  const methods = useForm({
    resolver: yupResolver(Schema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      if (data.status==='1') {
        await auditService.moderation({
          _id: item._id,
          status: 'approved',
          reviewerId: user._id,
          sourceId: item.sourceId,
          category: item.category
        });
      } else {
        await auditService.moderation({
          _id: item._id,
          status: 'rejected',
          reason: data.reason,
          reviewerId: user._id,
          sourceId: item.sourceId,
          category: item.category
        });
      }
      reset();
      onClose()
      enqueueSnackbar('更新成功');
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message);
      console.error(e);
    }
  };
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Box sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="reviewerName" label="审核人" disabled />
              <RHFSelect name="status" label="结果" placeholder="请选择状态">
                <MenuItem value="1">通过</MenuItem>
                <MenuItem value="2">反驳</MenuItem>
              </RHFSelect>
            </Box>
            <Stack sx={{ pt: 3, pb: 3 }}>
              <RHFTextField name="reason" label="原因" fullWidth multiline rows={3} />
            </Stack>
          </Box>
        </Grid>
      </Grid>
      <DialogActions>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" color="inherit" onClick={onCancel}>
          取消
        </Button>
        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          {hasData ? '更新' : '添加'}
        </LoadingButton>
      </DialogActions>
    </FormProvider>
  );
}
