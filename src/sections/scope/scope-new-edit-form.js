import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useEffect, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// redux
import { useDispatch } from 'src/redux/store';
import { getScopes } from 'src/redux/slices/scope';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFUpload, RHFEditor, RHFTextField } from 'src/components/hook-form';
// services
import { scopeService, fileService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

export default function ScopeNewEditForm({ currentScope }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const NewScopeSchema = Yup.object().shape({
    label: Yup.string().required('请输入标题'),
    value: Yup.string().required('请输入编码'),
    description: Yup.string().required('请输入描述'),
    cover: Yup.string(),
    published: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      label: currentScope?.label || '',
      value: currentScope?.value || '',
      description: currentScope?.description || '',
      cover: currentScope?.cover || '',
    }),
    [currentScope]
  );

  const methods = useForm({
    resolver: yupResolver(NewScopeSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentScope) {
      reset(defaultValues);
    }
  }, [currentScope, defaultValues, reset]);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      const { link } = await fileService.upload(formData);
      if (file) {
        setValue('cover', link, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentScope && currentScope._id) {
        await scopeService.patch({
          _id: currentScope._id,
          ...data,
        });
      } else {
        await scopeService.post(data);
      }
      dispatch(getScopes());
      reset();
      enqueueSnackbar(currentScope ? '更新成功!' : '创建成功!');
      router.push(paths.dashboard.scope.root);
    } catch (e) {
      enqueueSnackbar(e.response.data.message);
    }
  });

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            基本描述
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            标题, 基本描述, 图片...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader label="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">名称</Typography>
              <RHFTextField name="label" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">编码</Typography>
              <RHFTextField name="value" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">描述</Typography>
              <RHFEditor simple name="description" />
            </Stack>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">封面</Typography>
              <RHFUpload
                thumbnail
                name="cover"
                maxSize={3145728}
                onDrop={handleDrop}
                onUpload={() => console.info('ON UPLOAD')}
              />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', justifyContent: 'right' }}>
        <Button
          color="error"
          variant="contained"
          onClick={() => router.push(paths.dashboard.scope.root)}
          sx={{ mr: 1 }}
        >
          返回
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {!currentScope ? '创建' : '保存修改'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

ScopeNewEditForm.propTypes = {
  currentScope: PropTypes.object,
};
