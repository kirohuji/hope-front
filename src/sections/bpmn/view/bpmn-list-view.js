import _ from 'lodash';
import sumBy from 'lodash/sumBy';
import { useRef, useCallback, useEffect, useState } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
// utils
import { fTimestamp } from 'src/utils/format-time';

// redux
import { useSelector } from 'src/redux/store';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
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
import { bpmnService } from 'src/composables/context-provider';
import BpmnAnalytic from '../bpmn-analytic';
import BpmnTableRow from '../bpmn-table-row';
import BpmnTableToolbar from '../bpmn-table-toolbar';
import BpmnTableFiltersResult from '../bpmn-table-filters-result';
import { categories } from '../bpmn-new-edit-form';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'label', label: '标题' },
  { id: 'createdBy', label: '创建人' },
  { id: 'description', label: '大致内容' },
  { id: 'category', label: '分类' },
  { id: 'createdAt', label: '创建时间' },
  { id: 'status', label: '状态' },
  { id: '' },
];

const defaultFilters = {
  label: '',
  category: [],
  status: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function BpmnListView() {
  const theme = useTheme();

  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();

  const router = useRouter();

  const table = useTable({ defaultCurrentPage: 0 });

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [importLoading, setImportLoading] = useState(false);
  const [tableDataCount, setTableDataCount] = useState(0);

  const [filters, setFilters] = useState(defaultFilters);

  const denseHeight = table.dense ? 52 : 72;

  const [openForm, setOpenForm] = useState(false);

  const handleCloseFormModal = () => {
    setOpenForm(false);
  };

  const handleOpenFormModal = () => {
    setOpenForm(true);
  };

  const onSave = async (form) => {
    handleCloseFormModal();
  };
  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const canReset = !_.isEqual(defaultFilters, filters);

  const scope = useSelector((state) => state.scope);

  const debouncedFilters = useDebounce(filters);

  const notFound = (!tableDataCount && canReset) || !tableDataCount;

  const TABS = [
    { value: 'all', label: '全部', color: 'default', count: tableData.length },
    // { value: 'approved', label: '已审核', color: 'success', count: getBpmnLength('paid') },
    // { value: 'in_review', label: '正在审核', color: 'warning', count: getBpmnLength('pending') },
    // { value: 'rejected', label: '未通过', color: 'error', count: getBpmnLength('overdue') },
    // { value: 'withdrawn', label: '已撤回', color: 'default', count: getBpmnLength('draft') },
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

  const getTableData = useCallback(
    async (selector = {}, options = {}) => {
      try {
        setLoading(true);
        const response = await bpmnService.pagination(
          {
            ...selector,
            scope: scope.active._id,
            ..._.pickBy(_.omit(debouncedFilters, ['role'])),
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

  const handleDeleteRow = useCallback(
    async (id) => {
      await bpmnService.delete({
        _id: id,
      });
      enqueueSnackbar('删除成功');
      getTableData();
    },
    [getTableData, enqueueSnackbar]
  );

  const handleDeleteRows = useCallback(async () => {
    confirm.onFalse();
    setImportLoading(true);
    try {
      await bpmnService.deleteMany({
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
  }, [table, confirm, enqueueSnackbar, getTableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.bpmn.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.bpmn.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
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
          heading="列表"
          links={[
            // {
            //   name: 'Dashboard',
            //   href: paths.dashboard.root,
            // },
            {
              name: '审核管理',
              href: paths.dashboard.bpmn.root,
            },
            {
              name: '列表',
            },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.bpmn.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              新增
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          {/* <Tabs
            value={filters.status}
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
                // icon={
                //   <Label
                //     variant={
                //       ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                //     }
                //     color={tab.color}
                //   >
                //     {tab.count}
                //   </Label>
                // }
              />
            ))}
          </Tabs> */}

          <BpmnTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
            serviceOptions={categories}
          />

          {canReset && (
            <BpmnTableFiltersResult
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
                      tableData.map((row) => row._id)
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
                        <BpmnTableRow
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
      (bpmn) =>
        bpmn.bpmnNumber.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        bpmn.bpmnTo.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((bpmn) => bpmn.status === status);
  }

  if (service.length) {
    inputData = inputData.filter((bpmn) =>
      bpmn.items.some((filterItem) => service.includes(filterItem.service))
    );
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (bpmn) =>
          fTimestamp(bpmn.createDate) >= fTimestamp(startDate) &&
          fTimestamp(bpmn.createDate) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}
