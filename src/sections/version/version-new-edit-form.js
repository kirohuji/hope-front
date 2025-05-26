import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useEffect, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { useParams, useRouter } from 'src/routes/hook';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// redux
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFUpload,
  RHFEditor,
  RHFTextField,
} from 'src/components/hook-form';
import { versionService, fileService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

export default function ScopeNewEditForm({ current }) {
  const router = useRouter();
  const mdUp = useResponsive('up', 'md');
  const params = useParams();
  const loading = useBoolean(false);
  const { id } = params;
  const { enqueueSnackbar } = useSnackbar();

  const NewScopeSchema = Yup.object().shape({
    value: Yup.string(),
    majorVersion: Yup.string().required('主版本号'),
    minorVersion: Yup.string().required('辅版本号'),
    patchVersion: Yup.string().required('修订版本号'),
    releaseDate: Yup.string(),
    description: Yup.string(),
    file: Yup.string(),
    isActive: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      label: current?.label || '',
      value: current?.value || '',
      description: current?.description || '',
      file: current?.file || '',
      majorVersion: current?.majorVersion || id,
      // published: current?.published || false,
    }),
    [current, id]
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
    if (current) {
      reset(defaultValues);
    }
  }, [current, defaultValues, reset]);

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);
        loading.onTrue();
        const { link } = await fileService.upload(formData);
        if (file) {
          setValue('file', link, { shouldValidate: true });
          loading.onFalse();
          enqueueSnackbar('上传成功!');
        }
      } catch (e) {
        loading.onFalse();
      }
    },
    [setValue, enqueueSnackbar, loading]
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (current && current._id) {
        await versionService.patch({
          _id: current._id,
          ...data,
          isMain: false,
          label: `${data.majorVersion}.${data.minorVersion}.${data.patchVersion}`,
        });
      } else {
        await versionService.post({
          ...data,
          isMain: false,
          label: `${data.majorVersion}.${data.minorVersion}.${data.patchVersion}`,
        });
      }
      reset();
      enqueueSnackbar(current ? '更新成功!' : '创建成功!');
      router.back();
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
            <Stack spacing={3} direction="row" justifyContent="space-between">
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">主版本号</Typography>
                <RHFTextField name="majorVersion" disabled />
              </Stack>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">辅版本号</Typography>
                <RHFTextField name="minorVersion" />
              </Stack>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">修订版本号</Typography>
                <RHFTextField name="patchVersion" />
              </Stack>
            </Stack>
            {/* <Stack spacing={1.5}>
              <Typography variant="subtitle2">编码</Typography>
              <RHFTextField name="value" />
            </Stack> */}

            {/* <Stack spacing={1.5}>
              <Typography variant="subtitle2">平台</Typography>
              <RHFRadioGroup
                row
                name="platform"
                options={[
                  { label: 'Android', value: 'Android' },
                  { label: 'Apple', value: 'Apple' },
                ]}
              />
            </Stack> */}

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">描述</Typography>
              <RHFEditor simple name="description" />
            </Stack>
            <Stack spacing={1.5} sx={{ position: 'relative' }}>
              <Typography variant="subtitle2">文件</Typography>
              {loading.value && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 10,
                    backgroundColor: '#ffffffc4',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              <RHFUpload
                thumbnail
                accept={{ '*': [] }}
                name="file"
                // maxSize={314572800}
                onDrop={handleDrop}
                // onRemove={handleRemoveFile}
                // onRemoveAll={handleRemoveAllFiles}
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
        {/* <FormControlLabel
          control={<RHFSwitch name="isActive" defaultChecked label="是否激活" />}
          sx={{ flexGrow: 1, pl: 3 }}
        /> */}
        <Button color="error" variant="contained" onClick={() => router.back()} sx={{ mr: 1 }}>
          返回
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {!current ? '创建' : '保存修改'}
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
  current: PropTypes.object,
};
