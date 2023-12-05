/* eslint-disable no-bitwise */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Switch, Typography, FormControlLabel } from '@mui/material';
// utils
import { fData } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
// redux
import { useSelector } from 'src/redux/store';
import { roleService } from 'src/composables/context-provider';
// ----------------------------------------------------------------------


OrganNewEditForm.propTypes = {
  isEdit: PropTypes.bool,
  current: PropTypes.object,
  onClose: PropTypes.any,
  parent: PropTypes.object,
  type: PropTypes.any,
};

function UUID () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


export default function OrganNewEditForm ({ type, isEdit = false, current, onClose, parent }) {
  const { active } = useSelector((state) => state.scope);
  const { enqueueSnackbar } = useSnackbar();
  const NewUserSchema = Yup.object().shape({
    value: Yup.string().required('请输入名字'),
    label: Yup.string().required('请输入展示名'),
    description: Yup.string()
  });
  const defaultValues = useMemo(
    () => ({
      value: current?.value || '',
      label: current?.label || '',
      description: current?.description || ''
    }),
    [current]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && current) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
  }, [isEdit, current, reset, defaultValues]);

  const onSubmit = async (data) => {
    try {
      let roleData;
      if (!isEdit) {
        const uuid = UUID();
        roleData = await roleService.post({
          ...data,
          _id: uuid,
          key: uuid,
          type,
          root: parent.isScope,
          scope: active._id,
        });
        if (parent && !parent.isScope) {
          await roleService.addRolesToParent({
            rolesNames: uuid,
            parentName: parent._id,
          });
        }
        onClose({
          type: 'new',
          data: roleData
        })
      } else {
         await roleService.patch({
          _id: current._id,
          ...data,
        });
        onClose({
          type: 'alter',
          data: {
            _id: current._id,
            ...data,
          }
        })
      }
      enqueueSnackbar(!isEdit ? '创建成功' : '更新成功!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });
      if (file) {
        setValue('avatarUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="label" label="名称" />
              <RHFTextField name="value" label="编码" />
            </Box>
            <Stack sx={{ pt: 3 }}>
              <RHFTextField
                name="description"
                label="描述"
                fullWidth
                multiline
                rows={3}
              />
            </Stack>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? '创建' : '保存'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
