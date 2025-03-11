import PropTypes from 'prop-types';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
// @mui
import { useSnackbar } from 'src/components/snackbar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
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
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TableSelectedAction,
} from 'src/components/table';
// service
import { versionService } from 'src/composables/context-provider';
//
import VersionTableRow from './version-table-row';
import VersionTableToolbar from './version-table-toolbar';
import VersionTableFiltersResult from './version-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'versionNumber', label: '版本号', width: 100 },
  { id: 'description', label: '描述', width: 200 },
  { id: 'isMandatory', label: '是否自动发布', width: 200 },
  { id: 'releaseDate', label: '发布时间', width: 200 },
  { id: 'status', label: '发布状态', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  minorVersion: '',
};

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

  const debouncedFilters = useDebounce(filters);

  const notFound = (!tableDataCount && canReset) || !tableDataCount;

  const refresh = useCallback(
    async (selector = {}, options = {}) => {
      try {
        setLoading(true);
        const response = await versionService.pagination(
          {
            ...selector,
            ..._.pickBy(debouncedFilters),
            majorVersion: content.majorVersion,
            isMain: false,
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
    (minorVersion, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [minorVersion]: value,
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
      refresh();
    },
    [enqueueSnackbar, refresh]
  );

  const handleDeleteRow = useCallback(
    async (id) => {
      await versionService.delete({
        _id: id,
      });
      enqueueSnackbar('删除成功');
      refresh();
    },
    [refresh, enqueueSnackbar]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <CustomBreadcrumbs
        heading={`主版本号: ${content.majorVersion}`}
        links={[{}]}
        action={
          <Restricted to={['VersionListAdd']}>
            <Button
              component={RouterLink}
              href={paths.dashboard.version.new(content.majorVersion)}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              创建一个新的子版本
            </Button>
          </Restricted>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Card>
        <VersionTableToolbar filters={filters} onFilters={handleFilters} />
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
              <Tooltip title="删除">
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
                        onClose={() => refresh()}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                        onActiveRow={() => handleActiveRow(row._id)}
                      />
                    ))}
                    {notFound && <TableNoData notFound={notFound} />}
                  </>
                )}
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
