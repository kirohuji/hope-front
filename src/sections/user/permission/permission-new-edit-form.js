/* eslint-disable no-bitwise */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Switch, Typography, FormControlLabel } from '@mui/material';
// utils
// import { find } from 'lodash'
import { fData } from 'src/utils/format-number';
// routes
// import { PATH_DASHBOARD } from 'src/routes/paths';

// assets
// import { countries } from 'src/assets/data';
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
  // const navigate = useNavigate();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, current]);

  const onSubmit = async (data) => {
    try {
      if (!isEdit) {
        const uuid = UUID();
        await roleService.post({
          ...data,
          _id: uuid,
          
          key: uuid,
          type,
          root: false,
          scope: active._id,
        });
        if (parent) {
          await roleService.addRolesToParent({
            rolesNames: uuid,
            parentName: parent._id,
          });
        }
      } else {
        await roleService.patch({
          _id: current._id,
          ...data,
        });
      }
      enqueueSnackbar(!isEdit ? '创建成功' : '更新成功!');
      onClose()
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
        <Grid item xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {isEdit && (
              <Label
                color={values.status === 'active' ? 'success' : 'error'}
                sx={{ textTransform: 'uppercase', position: 'absolute', top: 24, right: 24 }}
              >
                {values.status}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 2,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    允许 *.jpeg, *.jpg, *.png, *.gif
                    <br /> 最大 {fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {isEdit && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== 'active'}
                        onChange={(event) =>
                          field.onChange(event.target.checked ? 'banned' : 'active')
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      禁用
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      开启禁用
                    </Typography>
                  </>
                }
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
              />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
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
