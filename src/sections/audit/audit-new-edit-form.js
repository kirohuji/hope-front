import PropTypes from 'prop-types';
import { useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// _mock
import { _addressBooks } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import FormProvider from 'src/components/hook-form';
//
import AuditNewEditDetails from './audit-new-edit-details';
import AuditNewEditAddress from './audit-new-edit-address';
import AuditNewEditStatusDate from './audit-new-edit-status-date';

// ----------------------------------------------------------------------
export const status = [
  { value: 'all', label: '全部' },
  { value: 'approved', label: '已审核' },
  { value: 'in_review', label: '正在审核' },
  { value: 'rejected', label: '未通过' },
  { value: 'withdrawn', label: '已撤回' },
];

export const categories = [
  { value: '活动通知', label: '活动通知' },
  { value: '消息公告', label: '消息公告' },
  { value: '社交聚会', label: '社交聚会' },
  { value: '内容分享', label: '内容分享' },
];

export default function AuditNewEditForm({ currentAudit }) {
  const router = useRouter();

  const loadingSave = useBoolean();

  const loadingSend = useBoolean();

  const NewAuditSchema = Yup.object().shape({
    auditTo: Yup.mixed().nullable().required('Audit to is required'),
    createDate: Yup.mixed().nullable().required('Create date is required'),
    dueDate: Yup.mixed()
      .required('Due date is required')
      .test(
        'date-min',
        'Due date must be later than create date',
        (value, { parent }) => value.getTime() > parent.createDate.getTime()
      ),
    // not required
    taxes: Yup.number(),
    status: Yup.string(),
    discount: Yup.number(),
    shipping: Yup.number(),
    auditFrom: Yup.mixed(),
    totalAmount: Yup.number(),
    auditNumber: Yup.string(),
  });

  const defaultValues = useMemo(
    () => ({
      auditNumber: currentAudit?.auditNumber || 'INV-1990',
      createDate: currentAudit?.createDate || new Date(),
      dueDate: currentAudit?.dueDate || null,
      taxes: currentAudit?.taxes || 0,
      shipping: currentAudit?.shipping || 0,
      status: currentAudit?.status || 'draft',
      discount: currentAudit?.discount || 0,
      auditFrom: currentAudit?.auditFrom || _addressBooks[0],
      auditTo: currentAudit?.auditTo || null,
      items: currentAudit?.items || [
        { title: '', description: '', service: '', quantity: 1, price: 0, total: 0 },
      ],
      totalAmount: currentAudit?.totalAmount || 0,
    }),
    [currentAudit]
  );

  const methods = useForm({
    resolver: yupResolver(NewAuditSchema),
    defaultValues,
  });

  const {
    reset,

    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleSaveAsDraft = handleSubmit(async (data) => {
    loadingSave.onTrue();

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      loadingSave.onFalse();
      router.push(paths.dashboard.audit.root);
      console.info('DATA', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      loadingSave.onFalse();
    }
  });

  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      loadingSend.onFalse();
      router.push(paths.dashboard.audit.root);
      console.info('DATA', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(error);
      loadingSend.onFalse();
    }
  });

  return (
    <FormProvider methods={methods}>
      <Card>
        <AuditNewEditAddress />

        <AuditNewEditStatusDate />

        <AuditNewEditDetails />
      </Card>

      <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
        <LoadingButton
          color="inherit"
          size="large"
          variant="outlined"
          loading={loadingSave.value && isSubmitting}
          onClick={handleSaveAsDraft}
        >
          Save as Draft
        </LoadingButton>

        <LoadingButton
          size="large"
          variant="contained"
          loading={loadingSend.value && isSubmitting}
          onClick={handleCreateAndSend}
        >
          {currentAudit ? 'Update' : 'Create'} & Send
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}

AuditNewEditForm.propTypes = {
  currentAudit: PropTypes.object,
};
