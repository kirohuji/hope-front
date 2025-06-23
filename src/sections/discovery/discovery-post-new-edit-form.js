import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
import { useBoolean } from 'src/hooks/use-boolean';
import { useAuthContext } from 'src/auth/hooks';
import { useDebounce } from 'src/hooks/use-debounce';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFRadioGroup,
  RHFEditor,
  RHFUpload,
  RHFTextField,
  RHFAutocomplete,
  RHFSwitch,
} from 'src/components/hook-form';

// utils
import { fData } from 'src/utils/format-number';

import { postService, userService, fileService } from 'src/composables/context-provider';
import { useSelector } from 'src/redux/store';
import moment from 'moment';

// ----------------------------------------------------------------------
export default function DiscoveryPostNewEditForm({ currentPost }) {
  const loading = useBoolean(false);

  const router = useRouter();

  const isEdit = !!currentPost;

  const mdUp = useResponsive('up', 'md');

  const [users, setUsers] = useState([]);

  const { user } = useAuthContext();

  const scope = useSelector((state) => state.scope);

  const [searchLeaders, setSearchLeaders] = useState('');

  const debouncedFilters = useDebounce(searchLeaders);

  const handleSearchLeaders = useCallback(async () => {
    if (debouncedFilters) {
      const response = await userService.paginationByProfile(
        {
          username: debouncedFilters,
          scope: scope.active._id,
        },
        {
          fields: {
            photoURL: 1,
            username: 1,
          },
        }
      );
      setUsers(response.data);
    }
  }, [debouncedFilters, scope.active]);

  useEffect(() => {
    handleSearchLeaders();
  }, [debouncedFilters, handleSearchLeaders]);

  const { enqueueSnackbar } = useSnackbar();

  const NewPostSchema = Yup.object().shape({
    body: Yup.string().required('请输入内容'),
    images: Yup.array(),
    location: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      body: currentPost?.body || '',
      images: currentPost?.images || [],
      location: currentPost?.location || '',
    }),
    [currentPost]
  );

  const methods = useForm({
    resolver: yupResolver(NewPostSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentPost) {
      reset(defaultValues);
    }
  }, [currentPost, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    if (values.images.filter((file) => file.isLoacl).length > 0) {
      enqueueSnackbar('资源集有资源未上传,请先上传');
      return;
    }
    try {
      if (!isEdit) {
        await postService.post({
          ...data,
          scope: scope.active._id,
          leaders: data.leaders && data.leaders.length > 0 ? data.leaders.map((l) => l._id) : [],
          modifiedDate: moment(new Date()).format('YYYY/MM/DD'),
        });
      } else {
        await postService.patch({
          _id: currentPost._id,
          ...data,
          leaders: data.leaders && data.leaders.length > 0 ? data.leaders.map((l) => l._id) : [],
          modifiedDate: moment(new Date()).format('YYYY/MM/DD'),
        });
      }
      reset();
      enqueueSnackbar(currentPost ? '更新成功!' : '创建成功,正在审核中!');
      router.push(paths.dashboard.post.root);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const files = values.images || [];
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          isLoacl: true,
        })
      );

      setValue('images', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.images]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      console.log('inputFile', inputFile);
      console.log('values.images', values.images);
      const filtered =
        values.images &&
        values.images?.filter((file) => {
          if (file.preview) {
            return file.preview !== inputFile.preview;
          }
          return file !== inputFile;
        });
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
  }, [setValue]);

  const onUpload = () => {
    loading.onTrue();
    try {
      values.images.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const { link } = await fileService.upload(formData);
        Object.assign(file, {
          preview: link,
          isLoacl: false,
        });
      });
      enqueueSnackbar('资源上传成功');
      loading.onFalse();
    } catch (e) {
      enqueueSnackbar('资源上传失败');
      loading.onFalse();
    }
  };

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
        <RHFEditor simple name="body" isPost style={{ maxHeight: '350px', borderRadius: 0 }} />
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
        <Stack spacing={3} sx={{ p: 3, mb: 1 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">图集</Typography>
            <RHFUpload
              multiple
              thumbnail
              name="images"
              maxSize={3145728}
              onDrop={handleDrop}
              onRemove={handleRemoveFile}
              onRemoveAll={handleRemoveAllFiles}
              // onUpload={() => console.info('ON UPLOAD')}
            />
          </Stack>
          {/* <Stack spacing={1.5}>
            <Typography variant="subtitle2">地址</Typography>
            <RHFTextField name="location" placeholder="发布地址" />
          </Stack> */}
          {/* <Stack spacing={1.5}>
            <Typography variant="subtitle2">标签</Typography>
            <RHFAutocomplete
              name="tags"
              placeholder="+ 标签"
              multiple
              freeSolo
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({
                    behavior: 'smooth', // 滚动效果
                    block: 'center', // 居中显示
                  });
                }, 1000);
              }}
              options={[].map((option) => option)}
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
          </Stack> */}
        </Stack>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', justifyContent: 'right' }}>
        {false && (
          <FormControlLabel
            control={<RHFSwitch name="published" label="是否发布" />}
            sx={{ flexGrow: 1, pl: 3 }}
          />
        )}

        <Button
          color="error"
          variant="contained"
          onClick={() => router.push(paths.dashboard.post.root)}
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
          {!currentPost ? '创建' : '保存变更'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderDetails}

      {renderProperties}

      {/* {renderActions} */}
    </FormProvider>
  );
}

DiscoveryPostNewEditForm.propTypes = {
  currentPost: PropTypes.object,
};
