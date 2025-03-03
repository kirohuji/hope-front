import sumBy from 'lodash/sumBy';
import _ from 'lodash';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
// utils
import { fTimestamp } from 'src/utils/format-time';
// _mock
import { _audits, INVOICE_SERVICE_OPTIONS } from 'src/_mock';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import BpmnServiceForm, { categories } from 'src/sections/bpmn/bpmn-service-form';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
//
// service
import { sensitiveWordService } from 'src/composables/context-provider';

// redux
import { useSelector } from 'src/redux/store';
import BpmnServiceTableRow from '../bpmn-service-table-row';
import BpmnServiceTableToolbar from '../bpmn-service-table-toolbar';
import BpmnServiceTableFiltersResult from '../bpmn-service-table-filters-result';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'word', label: '敏感词' },
  { id: 'level', label: '敏感词等级' },
  { id: 'category', label: '分类' },
  { id: 'description', label: '描述' },
  { id: 'createdBy', label: '创建人' },
  { id: 'createdAt', label: '创建时间' },
  { id: 'status', label: '状态' },
  { id: '' },
];

const defaultFilters = {
  label: '',
  category: [],
  level: 'all',
};

// ----------------------------------------------------------------------

export default function BpmnServiceListView() {
  const theme = useTheme();

  const settings = useSettingsContext();

  const router = useRouter();

  const table = useTable({ defaultCurrentPage: 0 });

  const [loading, setLoading] = useState(true);

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const [importLoading, setImportLoading] = useState(false);

  const [tableDataCount, setTableDataCount] = useState(0);

  const [filters, setFilters] = useState(defaultFilters);

  const [openForm, setOpenForm] = useState(false);

  const debouncedFilters = useDebounce(filters);

  const scope = useSelector((state) => state.scope);

  const getTableData = useCallback(
    async (selector = {}, options = {}) => {
      try {
        setLoading(true);
        const response = await sensitiveWordService.pagination(
          {
            ...selector,
            scope: scope.active._id,
            ..._.pickBy(debouncedFilters),
          },
          {
            ...options,
            skip: table.page * table.rowsPerPage,
            limit: table.rowsPerPage,
          }
        );
        setTableData(response.data);
        setTableDataCount(response.total);
        setLoading(false);
      } catch (error) {
        enqueueSnackbar(error.message);
      }
    },
    [scope.active._id, debouncedFilters, table.page, table.rowsPerPage, enqueueSnackbar]
  );

  useEffect(() => {
    getTableData();
  }, [getTableData]);

  const handleCloseFormModal = () => {
    setOpenForm(false);
  };

  const handleOpenFormModal = () => {
    setOpenForm(true);
  };

  const onSave = async () => {
    handleCloseFormModal();
    getTableData();
  };
  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const denseHeight = table.dense ? 56 : 76;

  const canReset = !_.isEqual(defaultFilters, filters);

  const notFound = (!tableDataCount && canReset) || !tableDataCount;

  const getAuditLength = (status) => tableData.filter((item) => item.status === status).length;

  const TABS = [
    { value: 'all', label: '全部', color: 'default', count: tableData.length },
    { value: '5', label: '五级(极高敏感)', color: 'error', count: getAuditLength('paid') },
    {
      value: '4',
      label: '四级(高度敏感)',
      color: 'warning',
      count: getAuditLength('pending'),
    },
    {
      value: '3',
      label: '三级(中度敏感)',
      color: 'default',
      count: getAuditLength('overdue'),
    },
    { value: '2', label: '二级(轻度敏感)', color: 'info', count: getAuditLength('draft') },
  ];

  const handleFilters = useCallback(
    (label, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [label]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    async (id) => {
      await sensitiveWordService.delete({
        _id: id,
      });
      enqueueSnackbar('删除成功');
      getTableData();
    },
    [enqueueSnackbar, getTableData]
  );

  const handleDeleteRows = useCallback(async () => {
    confirm.onFalse();
    setImportLoading(true);
    try {
      await sensitiveWordService.deleteMany({
        _ids: table.selected,
      });
      table.onUpdatePageDeleteRowsByAsync();
      enqueueSnackbar('删除成功');
      getTableData();
      setImportLoading(false);
    } catch (e) {
      enqueueSnackbar('删除失败,请联系管理员!');
      setImportLoading(false);
    }
  }, [confirm, enqueueSnackbar, getTableData, table]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.audit.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.audit.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('level', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading=""
          links={[
            // {
            //   name: 'Dashboard',
            //   href: paths.dashboard.root,
            // },
            // {
            //   name: '审核管理',
            //   href: paths.dashboard.audit.root,
            // },
            {
              name: '',
            },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.audit.new}
              variant="contained"
              onClick={() => handleOpenFormModal()}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              新增敏感词
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <Tabs
            value={filters.level}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.level) && 'filled') || 'soft'
                    }
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <BpmnServiceTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
            serviceOptions={categories}
          />

          {canReset && (
            <BpmnServiceTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={tableDataCount}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Stack direction="row">
                  <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="iconamoon:send-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="solar:printer-minimalistic-bold" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {loading ? (
                    [...Array(table.rowsPerPage)].map((i, index) => (
                      <TableSkeleton key={index} sx={{ height: denseHeight }} />
                    ))
                  ) : (
                    <>
                      {tableData.map((row) => (
                        <BpmnServiceTableRow
                          key={row._id}
                          row={row}
                          onClose={() => getTableData()}
                          selected={table.selected.includes(row._id)}
                          onSelectRow={() => table.onSelectRow(row._id)}
                          onDeleteRow={() => handleDeleteRow(row._id)}
                          onEditRow={() => handleEditRow(row._id)}
                        />
                      ))}
                      {notFound && <TableNoData notFound={notFound} />}
                    </>
                  )}
                  {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} /> */}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={tableDataCount}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
        <Backdrop sx={{ color: '#000', zIndex: (t) => t.zIndex.drawer + 1 }} open={importLoading}>
          <CircularProgress color="info" />
        </Backdrop>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
      <Dialog fullWidth maxWidth="md" open={openForm} onClose={handleCloseFormModal}>
        <DialogTitle>新增</DialogTitle>
        <BpmnServiceForm onSubmitData={onSave} onCancel={handleCloseFormModal} />
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, service, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (audit) =>
        audit.auditNumber.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        audit.auditTo.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((audit) => audit.status === status);
  }

  if (service.length) {
    inputData = inputData.filter((audit) =>
      audit.items.some((filterItem) => service.includes(filterItem.service))
    );
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (audit) =>
          fTimestamp(audit.createDate) >= fTimestamp(startDate) &&
          fTimestamp(audit.createDate) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}
