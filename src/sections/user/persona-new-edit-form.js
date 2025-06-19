import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// redux
import { useSelector } from 'src/redux/store';
// components
import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import { profileService, userService, fileService } from 'src/composables/context-provider';
// ----------------------------------------------------------------------

function generateRandomUser() {
  const randomString = () => Math.random().toString(36).substring(2, 8);
  const randomDigits = () => Math.floor(100000000 + Math.random() * 900000000).toString();

  const username = `ai_${randomString()}`;
  const email = `${randomString()}_ai@${randomString()}.com`;
  const phoneNumber = `1${randomDigits()}`; // 确保11位，第一位为1（像中国手机号）

  return {
    username,
    email,
    phoneNumber
  };
}

export default function PersonaNewEditForm({ currentUser }) {
  const router = useRouter();

  const isEdit = !!currentUser;

  const scope = useSelector((state) => state.scope);

  const loading = useBoolean(false);

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    username: Yup.string().required('请输入名字'),
    displayName: Yup.string().required('请输入展示名'),
    email: Yup.string().required('请输入电子邮件').email('电子邮件必须是有效的'),
    phoneNumber: Yup.string().required('请输入手机号'),
    realName: Yup.string().required('请输入真实名'),
    address: Yup.string().required('请选择地址'),
    age: Yup.string().required('请选择年龄'),
    gender: Yup.string().required('请选择性别'),
    llm: Yup.string().required('请选择AI模型类型'),
    capabilities: Yup.string().required('请输入AI能力描述'),
    personality: Yup.string().required('请输入性格特征'),
    knowledgeBase: Yup.string().required('请输入知识库范围'),
    about: Yup.string().required('请输入关于我'),
    introduction: Yup.string().required('请输入自我介绍'),
    topics: Yup.array().of(Yup.string()).required('请选择话题范围'),
    tts: Yup.string().when('llm', {
      is: (val) => val !== 'gemini-live' && val !== 'openai-live',
      then: () => Yup.string().required('请选择TTS模型'),
    }),
    stt: Yup.string().when('llm', {
      is: (val) => val !== 'gemini-live' && val !== 'openai-live',
      then: () => Yup.string().required('请选择STT模型'),
    }),
    available: Yup.string(),
    scope: Yup.string().required('请选择组织'),
    photoURL: Yup.mixed().required('请选择头像'),
  });

  const defaultValues = useMemo(
    () => ({
      username: currentUser?.username || 'AI助手',
      displayName: currentUser?.displayName || '智能助手',
      email: currentUser?.email || 'ai@example.com',
      phoneNumber: currentUser?.phoneNumber || '13800138000',
      realName: currentUser?.realName || 'AI智能助手',
      address: currentUser?.address || '云端服务器',
      age: currentUser?.age || '1',
      gender: currentUser?.gender || 'neutral',
      llm: currentUser?.persona?.llm || 'gpt-4',
      capabilities: currentUser?.persona?.capabilities || '通用AI助手，擅长回答各类问题',
      personality: currentUser?.persona?.personality || '友好、专业、耐心',
      knowledgeBase: currentUser?.persona?.knowledgeBase || '通用知识库',
      about: currentUser?.persona?.about || '我是一个智能AI助手，致力于为用户提供专业、准确的信息和服务。',
      introduction: currentUser?.persona?.introduction || '你好！我是你的AI助手。我可以帮助你解答问题、提供建议、进行对话交流。我会用专业、友好的态度为你服务。',
      topics: currentUser?.persona?.topics || [],
      tts: currentUser?.persona?.tts || 'azure',
      stt: currentUser?.persona?.stt || 'azure',
      available: currentUser?.available || '',
      scope: currentUser?.scope || '',
      photoURL: currentUser?.photoURL || null,
    }),
    [currentUser]
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
  const showTTSSTT = values.llm && values.llm !== 'gemini-live' && values.llm !== 'openai-live';

  const onSubmit = handleSubmit(async (data) => {
    try {
      const personaData = {
        llm: data.llm,
        tts: data.tts,
        stt: data.stt,
        capabilities: data.capabilities,
        personality: data.personality,
        knowledgeBase: data.knowledgeBase,
        about: data.about,
        introduction: data.introduction,
        topics: data.topics,
      };


      if (!isEdit) {
        const generatedUser = generateRandomUser()
        const registeredUser = await userService.register({
          username: generatedUser.username,
          displayName: data.displayName,
          email: generatedUser.email,
          phoneNumber: generatedUser.phoneNumber,
          realName: generatedUser.username,
          address: data.address,
          age: data.age,
          gender: data.gender,
        });
        await profileService.patch({
          _id: registeredUser._id || registeredUser.id || registeredUser,
          username: generatedUser.username,
          displayName: data.displayName,
          email: generatedUser.email,
          phoneNumber: generatedUser.phoneNumber,
          realName: data.realName,
          address: data.address,
          age: data.age,
          gender: data.gender,
          scope: data.scope || scope.active._id,
          persona: personaData,
          photoURL: data.photoURL instanceof Object ? data.photoURL.preview : data.photoURL,
        });
      } else {
        await profileService.patch({
          _id: currentUser._id,
          username: data.username,
          displayName: data.displayName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          realName: data.realName,
          address: data.address,
          age: data.age,
          gender: data.gender,
          persona: personaData,
          photoURL: data.photoURL instanceof Object ? data.photoURL.preview : data.photoURL,
        });
      }
      reset();
      enqueueSnackbar(currentUser ? '更新成功!' : '创建成功!');
      router.push(paths.dashboard.persona.list);
      console.info('DATA', data);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message);
      console.error(e);
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append('file', file);
        loading.onTrue();
        const { link } = await fileService.avatar(formData);
        if (file) {
          setValue('photoURL', link, { shouldValidate: true });
          loading.onFalse();
          enqueueSnackbar('头像上传成功!');
        }
      } catch (e) {
        enqueueSnackbar(e?.response?.data?.message);
        loading.onFalse();
      }
    },
    [setValue, enqueueSnackbar, loading]
  );

  const defaultTopics = [];

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentUser && (
              <Label
                color={values.available === 'active' ? 'success' : 'error'}
                sx={{ textTransform: 'uppercase', position: 'absolute', top: 24, right: 24 }}
              >
                {values.available === 'active' ? '激活' : '禁用'}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
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
              <RHFUploadAvatar
                name="photoURL"
                maxSize={3145728}
                onDrop={handleDrop}
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
            </Box>

            {currentUser && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="available"
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
            {currentUser && (
              <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Button variant="soft" color="error">
                  删除用户
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
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
              {/* <RHFTextField name="username" label="AI名称" /> */}
              <RHFTextField name="displayName" label="展示名" />
              {/* <RHFTextField name="realName" label="真实名" /> */}
              <RHFTextField name="age" label="年龄" />
              <RHFSelect name="gender" label="性别" placeholder="性别">
                <MenuItem value="male">男</MenuItem>
                <MenuItem value="female">女</MenuItem>
                <MenuItem value="neutral">中性</MenuItem>
              </RHFSelect>
              {/* <RHFTextField name="email" label="电子邮件" disabled={!!currentUser} /> */}
              {/* <RHFTextField name="phoneNumber" label="手机号" disabled={!!currentUser} /> */}
              <RHFTextField name="address" label="地址" />
              <RHFSelect name="llm" label="AI模型类型" placeholder="选择模型类型">
                <MenuItem value="gpt-4">GPT-4</MenuItem>
                <MenuItem value="gpt-3.5">GPT-3.5</MenuItem>
                <MenuItem value="claude">Claude</MenuItem>
                <MenuItem value="gemini-live">Gemini Live</MenuItem>
                <MenuItem value="openai-live">OpenAI Live</MenuItem>
                <MenuItem value="custom">自定义模型</MenuItem>
              </RHFSelect>
              {showTTSSTT && (
                <>
                  <RHFSelect name="tts" label="TTS模型" placeholder="选择TTS模型">
                    <MenuItem value="azure">Azure TTS</MenuItem>
                    <MenuItem value="google">Google TTS</MenuItem>
                    <MenuItem value="custom">自定义TTS</MenuItem>
                  </RHFSelect>
                  <RHFSelect name="stt" label="STT模型" placeholder="选择STT模型">
                    <MenuItem value="azure">Azure STT</MenuItem>
                    <MenuItem value="google">Google STT</MenuItem>
                    <MenuItem value="custom">自定义STT</MenuItem>
                  </RHFSelect>
                </>
              )}
              <RHFTextField
                name="capabilities"
                label="AI能力描述"
                multiline
                rows={3}
                placeholder="描述AI的主要能力和专长"
              />
              <RHFTextField
                name="personality"
                label="性格特征"
                multiline
                rows={3}
                placeholder="描述AI的性格特征和行为方式"
              />
              <RHFTextField
                name="knowledgeBase"
                label="知识库范围"
                multiline
                rows={3}
                placeholder="描述AI的知识领域和专长范围"
              />
              <RHFTextField
                name="about"
                label="关于我"
                multiline
                rows={3}
                placeholder="描述AI的基本信息和特点"
              />
              <RHFTextField
                name="introduction"
                label="自我介绍"
                multiline
                rows={3}
                placeholder="AI的自我介绍，用于首次对话"
              />
              <Controller
                name="topics"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    freeSolo
                    options={defaultTopics}
                    value={field.value || []}
                    onChange={(event, newValue) => {
                      field.onChange(newValue);
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option}
                          {...getTagProps({ index })}
                          key={option}
                          onDelete={() => {
                            const newValue = [...value];
                            newValue.splice(index, 1);
                            field.onChange(newValue);
                          }}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="话题范围"
                        placeholder="选择或输入新话题"
                        error={!!methods.formState.errors.topics}
                        helperText={methods.formState.errors.topics?.message}
                      />
                    )}
                  />
                )}
              />
              <RHFSelect name="scope" label="所属组织" placeholder="请选择组织架构">
                {scope.scopes.map((option) => (
                  <MenuItem key={option._id} value={option._id}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <div>
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => router.push(paths.dashboard.persona.list)}
                  sx={{ mr: 1 }}
                >
                  返回
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentUser ? '创建AI角色' : '保存修改'}
                </LoadingButton>
              </div>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

PersonaNewEditForm.propTypes = {
  currentUser: PropTypes.object
};
