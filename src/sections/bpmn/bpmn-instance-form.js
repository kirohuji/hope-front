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
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';

// redux
import { useSelector } from 'src/redux/store';

import { useSnackbar } from 'src/components/snackbar';
// service
import { sensitiveWordService } from 'src/composables/context-provider';
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

BpmnInstanceForm.propTypes = {
  item: PropTypes.object,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  onSubmitData: PropTypes.func,
};
export default function BpmnInstanceForm({ item, onDelete, onCancel, onSubmitData }) {
  const scope = useSelector((state) => state.scope);
  const hasData = !!item;
  const { enqueueSnackbar } = useSnackbar();

  const Schema = Yup.object().shape({
    label: Yup.string().required('请输入 敏感词'),
    value: Yup.string().required('请输入 敏感值'),
    category: Yup.string().required('请选择 类别'),
    level: Yup.string().required('请选择 等级'),
    description: Yup.string().max(5000),
  });
  const defaultValues = useMemo(
    () => ({
      label: item?.label || '',
      value: item?.value || '',
      category: item?.category || '',
      level: item?.level || '',
      status: item?.status || '',
      replacement: item?.replacement || '',
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
    reset,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      if (!hasData) {
        await sensitiveWordService.post({
          ...data,
          scope: data.scope || scope.active._id,
        });
      } else {
        await sensitiveWordService.patch({
          _id: item._id,
          ...data,
        });
      }
      reset();
      onSubmitData();
      enqueueSnackbar(hasData ? '更新成功!' : '创建成功!');
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
              <RHFTextField name="label" label="敏感词" />
              <RHFTextField name="value" label="敏感值" />
              <RHFTextField name="replacement" label="替换词(通过||分割)" />
              <RHFSelect name="status" label="状态" placeholder="请选择状态">
                <MenuItem value="active">启动</MenuItem>
                <MenuItem value="inactive">关闭</MenuItem>
              </RHFSelect>
            </Box>
            <Stack sx={{ pt: 3, pb: 3 }}>
              <RHFTextField name="description" label="描述" fullWidth multiline rows={3} />
            </Stack>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFSelect name="category" label="类型" placeholder="请选择类型">
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect name="level" label="等级" placeholder="请选择等级">
                {levels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>
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
