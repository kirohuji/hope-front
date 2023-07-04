import PropTypes from 'prop-types';
import * as Yup from 'yup';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  Stack,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// assets
import FormProvider, {
  RHFCheckbox,
  RHFEditor,
  RHFTextField,
} from 'src/components/hook-form';

// ----------------------------------------------------------------------

CardForm.propTypes = {
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
  item: PropTypes.object
};

export default function CardForm ({ onCreate, item, onClose }) {
  const NewSchema = Yup.object().shape({
    label: Yup.string().required('请输入问题标题'),
    content: Yup.string().required('请输入问题内容'),
    necessary: Yup.string().required('City is required'),
  });

  const defaultValues = {
    label: item?.label || '',
    content: item?.content || '',
    necessary: item?.necessary || true,
  };
  const methods = useForm({
    resolver: yupResolver(NewSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      onCreate({
        label: data.label,
        necessary: data.necessary,
        content: data.content,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Stack spacing={3}>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>添加一个新的问题</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <RHFTextField label="标题" simple name="label" />
            <RHFEditor label="内容" simple name="content" />

            <RHFCheckbox name="necessary" label="是否必答" sx={{ mt: 3 }} />
          </Stack>
        </DialogContent>

        <DialogActions>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            添加到问题列表
          </LoadingButton>

          <Button color="inherit" variant="outlined" onClick={onClose}>
            取消
          </Button>
        </DialogActions>
      </FormProvider>
    </Stack>
  );
}
