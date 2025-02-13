import PropTypes from 'prop-types';
import _ from 'lodash';
import { useRef, useCallback, useEffect, useState } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import Tab from '@mui/material/Tab';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
// _mock
import { _roles } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Restricted from 'src/auth/guard/restricted';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
// service
import { versionService } from 'src/composables/context-provider';
import VersionTableRow from './version-table-row';
import VersionTableToolbar from './version-table-toolbar';
import VersionTableFiltersResult from './version-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  // { id: 'selected', label: '', width: 80 },
  { id: 'versionNumber', label: '版本号', width: 100 },
  { id: 'description', label: '描述', width: 200 },
  { id: 'isMandatory', label: '是否自动发布', width: 200 },
  { id: 'releaseDate', label: '发布时间', width: 200 },
  { id: ' status', label: '发布状态', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  username: '',
  role: [],
  available: '',
};

const STATUS_OPTIONS = [{ value: '', label: '全部' }];

export default function VersionDetailsContent({ content }) {
  const { enqueueSnackbar } = useSnackbar();

  const table = useTable({ defaultCurrentPage: 0 });

  const router = useRouter();

  const confirm = useBoolean();

  const [loading, setLoading] = useState(true);

  const [tableData, setTableData] = useState([]);

  const [tableDataCount, setTableDataCount] = useState(0);

  const [filters, setFilters] = useState(defaultFilters);

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !_.isEqual(defaultFilters, filters);

  const settings = useSettingsContext();

  const debouncedFilters = useDebounce(filters);

  const notFound = (!tableDataCount && canReset) || !tableDataCount;

  const getTableData = useCallback(
    async (selector = {}, options = {}) => {
      try {
        setLoading(true);
        const response = await versionService.pagination(
          {
            ...selector,
            ..._.pickBy(_.omit(debouncedFilters, ['role'])),
            majorVersion: content.majorVersion,
            isMain: false
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
    [debouncedFilters, content.majorVersion, table.page, table.rowsPerPage, enqueueSnackbar]
  );

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

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.version.edit(id));
    },
    [router]
  );

  const handleActiveRow = useCallback(
    async (id) => {
      await versionService.active({
        _id: id,
      });
      enqueueSnackbar('激活成功');
      getTableData();
    },
    [enqueueSnackbar, getTableData]
  );


  const handleDeleteRow = useCallback(
    async (id) => {
      await versionService.delete({
        _id: id,
      });
      enqueueSnackbar('删除成功');
      getTableData();
    },
    [getTableData, enqueueSnackbar]
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

  const activation = useCallback(async () => {}, []);

  useEffect(() => {
    getTableData();
  }, [getTableData]);
  
  return (
    <>
      <CustomBreadcrumbs
        heading={`主版本号: ${content.majorVersion}`}
        links={[{ }]}
        action={
          <Restricted to={['VersionListAdd']}>
            <Button
              component={RouterLink}
              href={paths.dashboard.version.new(content.majorVersion)}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              新版本
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
            <Tab key={tab.value} iconPosition="end" value={tab.value} label={tab.label} />
          ))}
        </Tabs>
        <VersionTableToolbar filters={filters} onFilters={handleFilters} roleOptions={_roles} />
        {canReset && (
          <VersionTableFiltersResult
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
              <>
                <Tooltip title="删除">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="激活">
                  <IconButton color="primary" onClick={() => activation()}>
                    <Iconify icon="mdi:account-reactivate-outline" />
                  </IconButton>
                </Tooltip>
              </>
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
                    _.compact(
                      tableData.map((row) => {
                        if (row.username !== 'admin') {
                          return row._id;
                        }
                        return null;
                      })
                    )
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
                      <VersionTableRow
                        key={row._id}
                        row={row}
                        onClose={() => getTableData()}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => {
                          if (row.username !== 'admin') {
                            table.onSelectRow(row._id);
                          }
                        }}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onActiveRow={() => handleActiveRow(row._id)}
                      />
                    ))}
                    {notFound && <TableNoData notFound={notFound} />}
                  </>
                )}
                {/* <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  /> */}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Card>
    </>
  );
}

VersionDetailsContent.propTypes = {
  content: PropTypes.object,
};
