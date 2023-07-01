import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// utils
import { dictionaryService, roleService } from 'src/composables/context-provider';
import _ from 'lodash';

// redux 
import { useSelector } from 'src/redux/store';

// ----------------------------------------------------------------------

export default function EditForm ({ current, parent, open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const scope = useSelector((state) => state.scope);
  const [typeOptions, setTypeOptions] = useState([])
  const NewUserSchema = Yup.object().shape({
    value: Yup.string().required('Name is required'),
    label: Yup.string().required('Email is required'),
    type: Yup.string().required('Email is required'),
    description: Yup.string().required('Phone number is required'),
  });
  const getTypeOptions = useCallback(async () => {
    const response = await dictionaryService.getOptions({ value: 'permission-type'})
    setTypeOptions(response);
  }, [setTypeOptions]);

  useEffect(() => {
    getTypeOptions();
  }, [getTypeOptions]);
  const defaultValues = useMemo(
    () => ({
      label: current?.label || '',
      value: current?.value || '',
      description: current?.description || '',
    }),
    [current]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      let response = null
      if (current._id) {
        response = await roleService.patch({
          ...current,
          ...data,
          value: _.toUpper(data.value),
          type: 'permission'
        })
      } else {
        response = await roleService.post({
          ...current,
          ...data,
          value: _.toUpper(data.value),
          type: 'permission'
        })
      }
      if (parent) {
        await roleService.addRolesToParent({
          rolesNames: [response._id],
          parentName: parent._id
        })
      }
      await roleService.addCurrentUserToRolesAndRoleParents({
        roles: response._id,
        options: {
          scope: scope.active._id
        }
      })
      reset();
      onClose();
      enqueueSnackbar('Update success!');
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { maxWidth: 720 },
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{current._id ? '编辑' : '新增'}</DialogTitle>

        <DialogContent>
          <Box
            rowGap={3}
            columnGap={1}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }} />

            <RHFTextField name="label" label="名称" />
            <RHFTextField name="type" label=" 类型" />
            <RHFTextField name="value" label="编码">
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </RHFTextField>
            <RHFTextField name="description" label="描述" multiline rows={4} />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            取消
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            更新
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

EditForm.propTypes = {
  parent: PropTypes.object,
  current: PropTypes.object,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
