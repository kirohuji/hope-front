import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import 'dayjs/locale/zh-cn';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
// import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
// import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import { useSnackbar } from 'src/components/snackbar';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fData } from 'src/utils/format-number';
import FormProvider, {
  RHFEditor,
  RHFUpload,
  RHFTextField,
  RHFSwitch,
  // RHFAutocomplete,
} from 'src/components/hook-form';
//
import { articleService, bookService, fileService } from 'src/composables/context-provider';
import ArticleDetailsPreview from './article-details-preview';
import CheckoutSteps from './article-checkout-steps';
import QuestionnareCards from './questionnaire/cards/index';
import QuestionnareCardForm from './questionnaire/cards/CardForm';

// ----------------------------------------------------------------------
const STEPS = ['阅读环节', '问答环节'];

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== 'isContain',
})(({ theme, isContain }) => ({
  backgroundColor: 'none',
  ...(isContain && {
    borderRadius: 0,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  borderTopLeftRadius: '50%',
  borderBottomLeftRadius: '50%',
  borderTopRightRadius: '50%',
  borderBottomRightRadius: '50%',
}));

export default function ArticleNewEditForm({ book, currentDates, currentArticle }) {
  const loading = useBoolean(false);

  const [activeStep, setActiveStep] = useState(0);

  const router = useRouter();

  const isEdit = !!currentArticle;
  const mdUp = useResponsive('up', 'md');

  const { enqueueSnackbar } = useSnackbar();

  const preview = useBoolean();

  const formDialog = useBoolean();

  const [question, setQuestion] = useState(null);
  const [questions, setQuestions] = useState(currentArticle?.questions || []);

  const NewBlogSchema = Yup.object().shape({
    title: Yup.string().required('请输入标题'),
    description: Yup.string().required('请输入描述'),
    content: Yup.string().required('请输入内容'),
    coverUrl: Yup.mixed().nullable(),
    tags: Yup.array(),
    metaKeywords: Yup.array(),
    // not required
    metaTitle: Yup.string(),
    metaDescription: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      title: currentArticle?.title || '',
      date: currentArticle?.date || '',
      description: currentArticle?.description || '',
      content: currentArticle?.content || '',
      coverUrl: currentArticle?.coverUrl || null,
      tags: currentArticle?.tags || [],
      published: currentArticle?.published || false,
      metaKeywords: currentArticle?.metaKeywords || [],
      metaTitle: currentArticle?.metaTitle || '',
      metaDescription: currentArticle?.metaDescription || '',
    }),
    [currentArticle]
  );

  const methods = useForm({
    resolver: yupResolver(NewBlogSchema),
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
    if (currentArticle) {
      reset(defaultValues);
    }
  }, [currentArticle, defaultValues, reset]);

  const onNextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      preview.onFalse();
      if (activeStep === 0) {
        preview.onFalse();
        onNextStep();
      } else {
        if (!isEdit) {
          const article = await articleService.post({
            ...data,
            questions,
          });
          if (book) {
            await bookService.addBookArticle({
              book_id: book._id,
              article_id: article._id,
              date: data.date,
            });
          }
        } else {
          if (book) {
            await bookService.updateBookArticle({
              book_id: book._id,
              article_id: currentArticle._id,
              date: data.date,
            });
          }
          await articleService.patch({
            _id: currentArticle._id,
            ...data,
            questions,
          });
        }
        reset();
        preview.onFalse();
        enqueueSnackbar(currentArticle ? '更新成功!' : '创建成功!');
        if (book) {
          router.push(paths.dashboard.book.details.tab(book._id, 'chapter'));
        } else {
          router.push(paths.dashboard.article.root);
        }
      }
    } catch (e) {
      enqueueSnackbar(e.response.data.message);
    }
  });

  const renderPickerDay = (date, selectedDates, pickersDayProps, dates) => {
    if (!values.date) {
      return <PickersDay {...pickersDayProps} />;
    }
    // eslint-disable-next-line no-plusplus
    // for (let i = 0; i < dates.length; i++) {
    //     if (date.isSame(dates[i], 'day')) {
    //         return <CustomPickersDay
    //             isContain
    //             {...pickersDayProps}
    //             disabled
    //         />
    //     }
    // }
    return <CustomPickersDay isContain={false} {...pickersDayProps} />;
  };
  const handleDrop = async (acceptedFiles) => {
    loading.onTrue();
    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      const { link } = await fileService.upload(formData);
      if (file) {
        setValue('coverUrl', link, { shouldValidate: true });
      }
      loading.onFalse();
    } catch (e) {
      enqueueSnackbar('封面上传失败');
      loading.onFalse();
    }
  };

  const handleRemoveFile = useCallback(() => {
    setValue('coverUrl', null);
  }, [setValue]);

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
          <div>
            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="zh-cn">
              <StaticDatePicker
                timezone="Asia/Shanghai"
                orientation="portrait"
                className="whiteBg"
                openTo="day"
                name="date"
                value={values.date}
                view="day"
                renderDay={(date, selectedDates, pickersDayProps) =>
                  renderPickerDay(
                    date,
                    selectedDates,
                    pickersDayProps,
                    currentDates.map((item) => new Date(item))
                  )
                }
                displayStaticWrapperAs="desktop"
                onChange={(newValue) => {
                  // console.log('newValue', newValue);
                  setValue('date', moment(newValue).utcOffset(8).format('YYYY-MM-DD HH:mm:ss'));
                }}
                renderInput={() => null}
              />
            </LocalizationProvider>
          </div>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="title" label="标题" />

            <RHFTextField name="description" label="描述" multiline rows={3} />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">内容</Typography>
              <RHFEditor simple name="content" />
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

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', justifyContent: 'right' }}>
        <Button color="inherit" variant="outlined" size="large" onClick={preview.onTrue}>
          预览
        </Button>
        {activeStep !== 0 && (
          <Button
            sx={{ ml: 2 }}
            color="inherit"
            variant="outlined"
            size="large"
            onClick={() => {
              setActiveStep(activeStep - 1);
            }}
          >
            上一步
          </Button>
        )}
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 2 }}
        >
          {isEdit && (activeStep === 0 ? '下一步' : '保存')}
          {!isEdit && (activeStep === 0 ? '下一步' : '新建')}
        </LoadingButton>
      </Grid>
    </>
  );

  const renderQuestionnaire = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            问答环节
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            提出一些阅读相关的问题...
          </Typography>
        </Grid>
      )}
      <Grid xs={12} md={8}>
        {!mdUp && <CardHeader title="Questionnaire" />}
        <Stack spacing={3} sx={{ p: 3 }}>
          <QuestionnareCards
            questions={questions}
            onAdd={() => {
              setQuestion({});
              formDialog.onTrue();
            }}
            onEdit={(obj) => {
              setQuestion(obj);
              formDialog.onTrue();
            }}
            onDelete={(obj) => {
              setQuestions(questions.filter((row) => row._id !== obj._id));
            }}
          />
        </Stack>
      </Grid>
    </>
  );

  return (
    <>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={2}>
          <Grid xs={12} md={12}>
            <CheckoutSteps activeStep={activeStep} steps={STEPS} />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {activeStep === 0 && renderDetails}

          {activeStep === 0 && renderActions}

          {activeStep === 1 && renderQuestionnaire}

          {activeStep === 1 && renderActions}
        </Grid>

        <ArticleDetailsPreview
          title={values.title}
          content={values.content}
          description={values.description}
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
      <Dialog fullWidth maxWidth="sm" open={formDialog.value} onClose={formDialog.onFalse}>
        {formDialog.value && (
          <QuestionnareCardForm
            item={question}
            onClose={formDialog.onFalse}
            onCreate={(data) => {
              questions.push({
                ...data,
                _id: Math.random() * 100,
              });
              setQuestions(questions);
              formDialog.onFalse();
            }}
          />
        )}
      </Dialog>
    </>
  );
}

ArticleNewEditForm.propTypes = {
  currentArticle: PropTypes.object,
  book: PropTypes.any,
  currentDates: PropTypes.array,
};
