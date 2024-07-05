import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Typography from '@mui/material/Typography';
// ----------------------------------------------------------------------

ArticleQuestionForm.propTypes = {
  item: PropTypes.object,
  comment: PropTypes.string,
  onChangeComment:  PropTypes.func,
};


export default function ArticleQuestionForm ({
  item,
  comment,
  onChangeComment
}) {
  const CommentSchema = Yup.object().shape({
    label: Yup.string().required('请输入问题标题'),
    content: Yup.string().required('请输入问题内容'),
    necessary: Yup.string().required('必选'),
  });

  const defaultValues = {
    label: item?.label || '',
    content: item?.content || '',
    necessary: item?.necessary || true,
    comment,
  };

  const methods = useForm({
    resolver: yupResolver(CommentSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack>
        <Typography variant="h6">{item.label}</Typography>
        <Markdown children={item.content} />
      </Stack>
      <Stack spacing={3}>
        <RHFTextField
          name="comment"
          placeholder="写下你的想法..."
          multiline
          rows={4}
          onChange={(e)=>{
            onChangeComment(e);
            setValue('comment', e.target.value);
            console.log('comment')
          }}
        />

        {
          false && <Stack direction="row" alignItems="center">
            <Stack direction="row" alignItems="center" flexGrow={1}>
              <IconButton>
                <Iconify icon="solar:gallery-add-bold" />
              </IconButton>

              <IconButton>
                <Iconify icon="eva:attach-2-fill" />
              </IconButton>

              <IconButton>
                <Iconify icon="eva:smiling-face-fill" />
              </IconButton>
            </Stack>

            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              保存回答
            </LoadingButton>
          </Stack>
        }
      </Stack>
    </FormProvider>
  );
}
