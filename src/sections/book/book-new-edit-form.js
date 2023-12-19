import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useEffect, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFUpload,
  RHFEditor,
  RHFSwitch,
  RHFTextField,
} from 'src/components/hook-form';

import { bookService, fileService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

export default function BookNewEditForm ({ currentBook }) {
  const router = useRouter();

  const isEdit = !!currentBook;

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const NewBookSchema = Yup.object().shape({
    label: Yup.string().required('请输入书名'),
    description: Yup.string().required('请输入描述'),
    published: Yup.boolean(),
    title: Yup.string(),
    cover: Yup.string(),
    content: Yup.string(),
    // employmentTypes: Yup.array(),
    // role: Yup.string(),
    // skills: Yup.array(),
    // workingSchedule: Yup.array(),
    // benefits: Yup.array(),
    // locations: Yup.array(),
    // expiredDate: Yup.mixed().nullable(),
    // salary: Yup.object().shape({
    //   type: Yup.string(),
    //   price: Yup.number(),
    //   negotiable: Yup.boolean(),
    // }),
    // experience: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      label: currentBook?.label || '',
      description: currentBook?.description || '',
      cover: currentBook?.cover || '',
      title: currentBook?.title || '',
      published: currentBook?.published || false,
      content: currentBook?.content || '',
      // employmentTypes: currentBook?.employmentTypes || [],
      // experience: currentBook?.experience || '1 year exp',
      // role: currentBook?.role || _roles[1],
      // skills: currentBook?.skills || [],
      // workingSchedule: currentBook?.workingSchedule || [],
      // locations: currentBook?.locations || [],
      // benefits: currentBook?.benefits || [],
      // expiredDate: moment(currentBook?.expiredDate).format("YYYYMMDD") || null,
      // salary: currentBook?.salary || {
      //   type: 'Hourly',
      //   price: 0,
      //   negotiable: false,
      // },
    }),
    [currentBook]
  );

  const methods = useForm({
    resolver: yupResolver(NewBookSchema),
    defaultValues,
  });

  const {
    // watch,
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // const values = watch();

  useEffect(() => {
    if (currentBook) {
      reset(defaultValues);
    }
  }, [currentBook, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (!isEdit) {
        await bookService.post(data);
      } else {
        await bookService.patch({
          _id: currentBook._id,
          ...data
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
      const { link } = await fileService.upload(formData)
      if (file) {
        setValue('cover', link, { shouldValidate: true });
      }
    },
    [setValue]
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
              <RHFTextField name="label"/>
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

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

BookNewEditForm.propTypes = {
  currentBook: PropTypes.object,
};
