import _ from 'lodash';
import { useRef, useCallback, useEffect, useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// _mock
import { _userList, _roles } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import Restricted from 'src/auth/guard/restricted';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  // getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// service
import { fileService, userService } from 'src/composables/context-provider';
//
import UserTableRow from '../user-table-row';
import UserTableToolbar from '../user-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';

// ----------------------------------------------------------------------


const USER_STATUS_OPTIONS = [
  { value: 'active', label: '激活' },
  { value: 'banned', label: '禁用' },
];


const STATUS_OPTIONS = [{ value: 'all', label: '全部' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'username', label: '账户', width: 180 },
  { id: 'displayName', label: '用户', width: 100 },
  { id: 'phoneNumber', label: '手机号', width: 150 },
  { id: 'baptized', label: ' 受洗情况', width: 90 },
  { id: 'address', label: '地址', width: 250 },
  // { id: 'role', label: 'Role', width: 180 },
  { id: 'available', label: '状态', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  username: '',
  role: [],
  available: 'all',
};

// ----------------------------------------------------------------------

export default function UserListView () {

  const fileRef = useRef(null);

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable({
    defaultCurrentPage: 0,
  });

  const settings = useSettingsContext();


  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [tableDataCount, setTableDataCount] = useState(0);

  const [filters, setFilters] = useState(defaultFilters);

  // applyFilter({
  //   inputData: tableData,
  //   comparator: getComparator(table.order, table.orderBy),
  //   filters,
  // });

  // const dataInPage = dataFiltered.slice(
  //   table.page * table.rowsPerPage,
  //   table.page * table.rowsPerPage + table.rowsPerPage
  // );

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !_.isEqual(defaultFilters, filters);

  const notFound = (!tableDataCount && canReset) || !tableDataCount;

  const getTableData = useCallback(async (selector = {}, options = {}) => {
    try {
      const response = await userService.pagination(
        {
          ...selector,
          ..._.pickBy(_.omit(filters, ["role"]))
        },
        options
      )
      setTableData(response.data);
      setTableDataCount(response.total);
    } catch (error) {
      enqueueSnackbar(error.message)
    }
  }, [filters, setTableData, setTableDataCount, enqueueSnackbar]);

  useEffect(() => {
    getTableData()
  }, [getTableData]);

  const handleFilters = useCallback(
    (username, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [username]: value,
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    async (id) => {
      // const deleteRow = tableData.filter((row) => row.id !== id);
      // setTableData(deleteRow);

      // table.onUpdatePageDeleteRow(dataInPage.length);
      await userService.delete({
        _id: id
      })
      enqueueSnackbar("删除成功")
      getTableData();
    },
    [getTableData,enqueueSnackbar]
  );

  // const handleDeleteRows = useCallback(() => {
  //   const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
  //   setTableData(deleteRows);

  //   table.onUpdatePageDeleteRows({
  //     totalRows: tableData.length,
  //     totalRowsInPage: dataInPage.length,
  //     totalRowsFiltered: dataFiltered.length,
  //   });
  // }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('available', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const uploadImage = async () => {
    if (fileRef.current) {
      const file = fileRef.current.files[0]
      const formData = new FormData();
      formData.append('file', file);
      await fileService.excel(formData)
      enqueueSnackbar("导入成功")
      getTableData()
    }
  }
  const handleUploadExcel = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  return (
    <>
      <input onChange={uploadImage} accept='application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' type="file" ref={fileRef} style={{ display: 'none' }} />
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="列表"
          links={[
            // { name: 'Dashboard', href: paths.dashboard.root },
            { name: '用户', href: paths.dashboard.user.root },
            { name: '列表' },
          ]}
          action={
            <Restricted to={["UserListAddButton"]}>
              <Button
                component={RouterLink}
                href={paths.dashboard.user.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                新用户
              </Button>
            </Restricted>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.available}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
              />
            ))}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onUploadExcel={handleUploadExcel}
            //
            roleOptions={_roles}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
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
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                  {tableData
                    .map((row) => (
                      <UserTableRow
                        key={row._id}
                        row={row}
                        onClose={() => getTableData()}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
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
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="删除"
        content={
          <>
            你确定要删除 <strong> {table.selected.length} </strong> 项目?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // handleDeleteRows();
              confirm.onFalse();
            }}
          >
            删除
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

// function applyFilter ({ inputData, comparator, filters }) {
//   const { name, status, role } = filters;

//   const stabilizedThis = inputData.map((el, index) => [el, index]);

//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });

//   inputData = stabilizedThis.map((el) => el[0]);

//   if (name) {
//     inputData = inputData.filter(
//       (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
//     );
//   }

//   if (status !== 'all') {
//     inputData = inputData.filter((user) => user.status === status);
//   }

//   if (role.length) {
//     inputData = inputData.filter((user) => role.includes(user.role));
//   }

//   return inputData;
// }
