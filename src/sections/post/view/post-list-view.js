import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
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

// redux
import { useSelector } from 'src/redux/store';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
//
import { postService } from 'src/composables/context-provider';
import PostTableRow from '../post-table-row';
import PostTableToolbar from '../post-table-toolbar';
import PostTableFiltersResult from '../post-table-filters-result';
import { categories } from '../post-new-edit-form';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'poster', label: '创建人' },
  // { id: 'title', label: '标题' },
  { id: 'metaTitle', label: '元标题' },
  { id: 'sourceUrl', label: '内容', width: '50' },
  { id: 'category', label: '分类' },
  // { id: 'published', label: '是否发布' },
  { id: 'commented', label: '允许评论' },
  { id: 'createdAt', label: '创建时间' },
  { id: 'publishedAt', label: '发布时间' },
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

export default function PostListView() {
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

  const getPostLength = (status) => tableData.filter((item) => item.status === status).length;

  const TABS = [
    { value: 'all', label: '全部', color: 'default', count: tableData.length },
    // { value: 'system', label: '系统通知', color: 'success' },
    // {
    //   value: 'message',
    //   label: '消息通知',
    //   color: 'warning',
    // },
    // { value: 'broadcast', label: '活动通知', color: 'error' },
    // {
    //   value: 'withdrawn',
    //   label: '已撤回',
    //   color: 'default',
    //   count: getPostLength('draft'),
    // },
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
        const response = await postService.pagination(
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

  const handleDeleteRow = useCallback(
    async (id) => {
      await postService.delete({
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
      await postService.deleteMany({
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
      router.push(paths.dashboard.post.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.post.details(id));
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
              name: '文章管理',
              href: paths.dashboard.post.root,
            },
            {
              name: '列表',
            },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.post.new}
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
          <Tabs
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
          </Tabs>

          <PostTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
            serviceOptions={categories}
          />

          {canReset && (
            <PostTableFiltersResult
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
                        <PostTableRow
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
