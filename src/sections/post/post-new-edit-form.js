import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// _mock
import { _tags } from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import { fData } from 'src/utils/format-number';
import FormProvider, {
  RHFEditor,
  RHFUpload,
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';

import { postService, fileService } from 'src/composables/context-provider';

//
import PostDetailsPreview from './post-details-preview';

// ----------------------------------------------------------------------

export const status = [
  { value: 'system', label: '系统通知' },
  { value: 'message', label: '消息通知' },
  { value: 'broadcast', label: '活动通知' },
  { value: 'book', label: '阅读通知' },
];

export const categories = [
  { value: 'announcement', label: '运营公告' },
  { value: 'system', label: '系统应用' },
  { value: 'feedback', label: '问题反馈' },
];

export default function PostNewEditForm({ currentPost }) {
  const loading = useBoolean(false);

  const router = useRouter();

  const isEdit = !!currentPost;

  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const preview = useBoolean();

  const NewPostSchema = Yup.object().shape({
    title: Yup.string().required('请输入标题'),
    body: Yup.string().required('请输入描述'),
    content: Yup.string().required('请输入内容'),
    coverUrl: Yup.mixed().nullable(),
    category: Yup.array(),
    published: Yup.boolean(),
    commented: Yup.boolean(),
    // not required
    metaTitle: Yup.string(),
    metaDescription: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentPost?.title || '',
      body: currentPost?.body || '',
      content: currentPost?.content || '',
      coverUrl: currentPost?.coverUrl || null,
      category: currentPost?.category || [],
      // metaKeywords: currentPost?.metaKeywords || [],
      metaTitle: currentPost?.metaTitle || '',
      published: currentPost?.published || '',
      commented: currentPost?.commented || '',
      metaDescription: currentPost?.metaDescription || '',
    }),
    [currentPost]
  );

  const methods = useForm({
    resolver: yupResolver(NewPostSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentPost) {
      reset(defaultValues);
    }
  }, [currentPost, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      preview.onFalse();
      if (!isEdit) {
        await postService.post({
          ...values,
          ...data,
        });
      } else {
        await postService.patch({
          _id: currentPost._id,
          ...values,
          ...data,
        });
      }
      enqueueSnackbar(currentPost ? '更新成功!' : '创建成功!');
      router.push(paths.dashboard.post.root);
    } catch (e) {
      enqueueSnackbar(e.response.data.message);
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      loading.onTrue();
      try {
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);
        const { link } = await fileService.uploadToBook(formData);
        if (file) {
          setValue('coverUrl', link, { shouldValidate: true });
        }
        loading.onFalse();
      } catch (e) {
        enqueueSnackbar('封面上传失败');
        loading.onFalse();
      }
    },
    [enqueueSnackbar, loading, setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('coverUrl', null);
  }, [setValue]);

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            基本信息
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            标题, 内容, 图片...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="基本信息" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="title" label="标题" />

            <RHFTextField name="body" label="描述" multiline rows={3} />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">内容</Typography>
              <RHFEditor simple name="content" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">图片</Typography>
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
                name="coverUrl"
                onDrop={handleDrop}
                // maxSize={3145728}
                onDelete={handleRemoveFile}
                onDropRejected={() => {
                  loading.onFalse();
                }}
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
            额外信息...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="属性" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFAutocomplete
              name="category"
              label="标签"
              placeholder="+ 标签"
              multiple
              freeSolo
              options={_tags.map((option) => option)}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {option}
                </li>
              )}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                    color="info"
                    variant="soft"
                  />
                ))
              }
            />

            <RHFTextField name="metaTitle" label="元标题" />

            <RHFTextField name="metaDescription" label="元描述" fullWidth multiline rows={3} />

            <FormControlLabel
              control={<Switch defaultChecked name="commented" />}
              label="允许评论"
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          control={<Switch defaultChecked name="published" />}
          label="发布"
          sx={{ flexGrow: 1, pl: 3 }}
        />

        <Button color="inherit" variant="outlined" size="large" onClick={preview.onTrue}>
          预览
        </Button>

        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {!currentPost ? '创建' : '保存更改'}
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

      <PostDetailsPreview
        title={values.title}
        content={values.content}
        body={values.body}
        coverUrl={
          typeof values.coverUrl === 'string' ? values.coverUrl : `${values.coverUrl?.preview}`
        }
        //
        open={preview.value}
        isValid={isValid}
        isSubmitting={isSubmitting}
        onClose={preview.onFalse}
        onSubmit={onSubmit}
      />
    </FormProvider>
  );
}

PostNewEditForm.propTypes = {
  currentPost: PropTypes.object,
};
