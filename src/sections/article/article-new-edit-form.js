import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
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
import {
  StaticDatePicker
} from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FormProvider, {
  RHFEditor,
  RHFUpload,
  RHFTextField,
  RHFSwitch,
  RHFAutocomplete,
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
  shouldForwardProp: (prop) =>
      prop !== 'isContain',
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


export default function ArticleNewEditForm ({ book, currentDates, currentArticle }) {

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
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    content: Yup.string().required('Content is required'),
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
      public: currentArticle?.public || null,
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
    setActiveStep(activeStep + 1)
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      preview.onFalse();
      onNextStep();
      if (activeStep === 0) {
        preview.onFalse();
        onNextStep();
      } else {
        if (!isEdit) {
          const id = await articleService.addWithCurrentUser(data);
          if (book) {
            await bookService.addBookArticle({
              book_id: book._id,
              article_id: id,
              date: data.date
            })
          }
        } else {
          if (book) {
            await bookService.updateBookArticle({
              book_id: book._id,
              article_id: currentArticle._id,
              date: data.date
            })
          }
          await articleService.patch({
            _id: currentArticle._id,
            ...data,
            questions
          });
        }
        reset();
        preview.onFalse();
        enqueueSnackbar(currentArticle ? '更新成功!' : '创建成功!');
        if (book) {
          router.push(paths.dashboard.book.details.tab(book._id, "chapter"));
        } else {
          router.push(paths.dashboard.article.root);
        }
      }
    } catch (error) {
      console.error(error);
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
    return (
        <CustomPickersDay
            isContain={false}
            {...pickersDayProps}
        />
    );
};
  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      const { link } = await fileService.avatar(formData)
      if (file) {
        setValue('coverUrl', link, { shouldValidate: true });
        // setValue('photoURL', Object.assign(file, {
        //   preview: link
        // }), { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleRemoveFile = useCallback(() => {
    setValue('coverUrl', null);
  }, [setValue]);

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Title, short description, image...
          </Typography>
          <div>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="zh-cn">
              <StaticDatePicker
                orientation="portrait"
                className="whiteBg"
                openTo="day"
                name="date"
                value={values.date}
                view="day"
                renderDay={(date, selectedDates, pickersDayProps) => renderPickerDay(date, selectedDates, pickersDayProps, currentDates.map(item=> new Date(item)))}
                displayStaticWrapperAs="desktop"
                onChange={(newValue) => {
                  setValue('date', newValue);
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
            <RHFTextField name="title" label="Article Title" />

            <RHFTextField name="description" label="Description" multiline rows={3} />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Content</Typography>
              <RHFEditor simple name="content" />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Cover</Typography>
              <RHFUpload
                name="coverUrl"
                maxSize={3145728}
                onDrop={handleDrop}
                onDelete={handleRemoveFile}
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
            Properties
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Additional functions and attributes...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFAutocomplete
              name="tags"
              label="Tags"
              placeholder="+ Tags"
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

            <RHFTextField name="metaTitle" label="Meta title" />

            <RHFTextField
              name="metaDescription"
              label="Meta description"
              fullWidth
              multiline
              rows={3}
            />

            <RHFAutocomplete
              name="metaKeywords"
              label="Meta keywords"
              placeholder="+ Keywords"
              multiple
              freeSolo
              disableCloseOnSelect
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

            {/**   <FormControlLabel control={<Switch defaultChecked />} label="Enable comments" /> * */}
            <RHFSwitch name="comments" label="可以评论" />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        {activeStep === 0 && <div style={{ flexGrow: 1, pl: 3 }}> <RHFSwitch name="public" label="是否发布" /></div>}
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
            Questionnaire
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Additional functions and attributes...
          </Typography>
        </Grid>
      )}
      <Grid xs={12} md={8}>
        {!mdUp && <CardHeader title="Questionnaire" />}
        <Stack spacing={3} sx={{ p: 3 }}>
          <QuestionnareCards
            questions={questions}
            onAdd={() => {
              setQuestion({})
              formDialog.onTrue();
            }}
            onEdit={(obj) => {
              setQuestion(obj)
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

          {activeStep === 0 && renderProperties}

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
        {formDialog.value && <QuestionnareCardForm
          item={question}
          onClose={formDialog.onFalse}
          onCreate={(data) => {
            questions.push({
              ...data,
              _id: Math.random() * 100
            });
            setQuestions(questions);
            formDialog.onFalse();
          }}
        />}
      </Dialog>
    </>
  );
}

ArticleNewEditForm.propTypes = {
  currentArticle: PropTypes.object,
  book: PropTypes.any,
  currentDates: PropTypes.array
};
