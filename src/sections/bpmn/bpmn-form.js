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
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

BpmnForm.propTypes = {
  item: PropTypes.object,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  onSubmitData: PropTypes.func,
};
export default function BpmnForm({ item, onDelete, onCancel, onSubmitData }) {
  const hasData = !!item;
  const { enqueueSnackbar } = useSnackbar();

  const Schema = Yup.object().shape({
    label: Yup.string().required('请输入 名称'),
    value: Yup.string().required('请输入 编码'),
    description: Yup.string().max(5000),
  });
  const defaultValues = useMemo(
    () => ({
      label: item?.label || '',
      value: item?.value || '',
      description: item?.description || '',
    }),
    [item]
  );
  const methods = useForm({
    resolver: yupResolver(Schema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      onSubmitData({
        ...item,
        ...data,
      });
      enqueueSnackbar(!hasData ? '创建成功!' : '更新成功!');
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ px: 3 }}>
        <RHFTextField name="label" label="名称" />
        <RHFTextField name="value" label="编码" />
        <RHFTextField name="description" label="描述" multiline rows={3} />
      </Stack>
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
