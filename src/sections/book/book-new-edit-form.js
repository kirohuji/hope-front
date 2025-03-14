import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useEffect, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
import { useBoolean } from 'src/hooks/use-boolean';
import { useAuthContext } from 'src/auth/hooks';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// utils
import { fData } from 'src/utils/format-number';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFMultiCheckbox,
  RHFUpload,
  RHFEditor,
  RHFTextField,
} from 'src/components/hook-form';

import { bookService, fileService } from 'src/composables/context-provider';
import { useSelector } from 'src/redux/store';

// ----------------------------------------------------------------------

export const TYPE_OPTIONS = [
  { value: 'children', label: '儿童' },
  { value: 'adolescent', label: '青少年' },
  { value: 'adult', label: '成人' },
  { value: 'newBelievers', label: '新人' },
];

export default function BookNewEditForm({ currentBook }) {
  const loading = useBoolean(false);

  const router = useRouter();

  const isEdit = !!currentBook;

  const scope = useSelector((state) => state.scope);

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const NewBookSchema = Yup.object().shape({
    label: Yup.string().required('请输入书名'),
    description: Yup.string().required('请输入描述'),
    published: Yup.boolean(),
    title: Yup.string(),
    cover: Yup.string(),
    content: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      label: currentBook?.label || '',
      description: currentBook?.description || '',
      cover: currentBook?.cover || '',
      title: currentBook?.title || '',
      published: currentBook?.published || false,
      publishedDate: currentBook?.publishedDate || '',
      type: currentBook?.type || '',
      content: currentBook?.content || '',
    }),
    [currentBook]
  );

  const methods = useForm({
    resolver: yupResolver(NewBookSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentBook) {
      reset(defaultValues);
    }
  }, [currentBook, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!isEdit) {
        await bookService.post({
          ...data,
          scope: scope.active._id,
        });
      } else {
        await bookService.patch({
          _id: currentBook._id,
          ...data,
        });
      }
      reset();
      enqueueSnackbar(currentBook ? '更新成功!' : '创建成功!');
      router.push(paths.dashboard.book.root);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      loading.onTrue();
      try {
        const { link } = await fileService.upload(formData);
        if (file) {
          setValue('cover', link, { shouldValidate: true });
          loading.onFalse();
          enqueueSnackbar('封面上传成功!');
        }
      } catch (e) {
        loading.onFalse();
        enqueueSnackbar('封面上传!');
      }
    },
    [setValue, enqueueSnackbar, loading]
  );

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            基本描述
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            标题, 基本描述, 背景...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">书名</Typography>
              <RHFTextField name="label" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">描述</Typography>
              <RHFEditor simple name="description" />
            </Stack>

            <Stack spacing={1.5} sx={{ position: 'relative' }}>
              <Typography variant="subtitle2">封面</Typography>
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
                name="cover"
                // maxSize={3145728}
                onDropRejected={() => {
                  loading.onFalse();
                }}
                onDrop={handleDrop}
                onUpload={() => console.info('ON UPLOAD')}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    允许 *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderProperties = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            属性
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            额外的功能和属性
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">类型</Typography>
              {/* <RHFRadioGroup row spacing={4} name="type" options={TYPE_OPTIONS} /> */}
              <RHFMultiCheckbox
                name="type"
                row
                spacing={4}
                options={TYPE_OPTIONS}
                // sx={{
                //   display: 'grid',
                //   gridTemplateColumns: 'repeat(2, 1fr)',
                // }}
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
          onClick={() => router.push(paths.dashboard.book.root)}
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
          {!currentBook ? '创建' : '保存变更'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

BookNewEditForm.propTypes = {
  currentBook: PropTypes.object,
};
