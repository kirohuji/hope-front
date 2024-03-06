import { useState, useEffect, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// utils
import { fTimestamp } from 'src/utils/format-time';
import { fileManagerService } from 'src/composables/context-provider';
// _mock
import { FILE_TYPE_OPTIONS } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { fileFormat } from 'src/components/file-thumbnail';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import { useTable, getComparator } from 'src/components/table';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { getFiles } from 'src/redux/slices/file';
//
import FileManagerTable from '../file-manager-table';
import FileManagerFilters from '../file-manager-filters';
import FileManagerGridView from '../file-manager-grid-view';
import FileManagerFiltersResult from '../file-manager-filters-result';
import FileManagerNewFolderDialog from '../file-manager-new-folder-dialog';
import FileStorageOverview from '../file-storage-overview';

// ----------------------------------------------------------------------

const defaultFilters = {
  name: '',
  type: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------
// const GB = 1000000000 * 24;
export default function FileManagerView() {
  const upMd = useResponsive('up', 'md');

  const dispatch = useDispatch();

  const { active } = useSelector((state) => state.scope);

  const { data, overview } = useSelector((state) => state.file);

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable({ defaultRowsPerPage: 10 });

  const settings = useSettingsContext();

  const openDateRange = useBoolean();

  const confirm = useBoolean();

  const upload = useBoolean();

  const [view, setView] = useState('grid');

  const onRefresh = useCallback(async () => {
    dispatch(getFiles());
  }, [dispatch]);
  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const dataFiltered = applyFilter({
    inputData: data,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const canReset =
    !!filters.name || !!filters.type.length || (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleChangeView = useCallback((event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  }, []);

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleDeleteItem = useCallback(
    async (id) => {
      try {
        await fileManagerService.deleteCurrentUser({
          _id: id,
        });
        enqueueSnackbar('删除成功');
      } catch (e) {
        enqueueSnackbar(e.response.data.message);
      }
      onRefresh();
    },
    [onRefresh, enqueueSnackbar]
  );

  const handleDeleteInvitedItem = useCallback(
    async (item) => {
      try {
        await fileManagerService.deleteInviteItem(item);
        enqueueSnackbar('退出成功');
      } catch (e) {
        enqueueSnackbar(e.response.data.message);
      }
      onRefresh();
    },
    [onRefresh, enqueueSnackbar]
  );

  const handleDeleteItems = useCallback(async () => {
    await table.selected.map(async (row) => {
      await fileManagerService.deleteCurrentUser({
        _id: row,
      });
    });
    onRefresh();
  }, [onRefresh, table]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const renderFilters = (
    <Stack
      spacing={2}
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-end', md: 'center' }}
    >
      <FileManagerFilters
        openDateRange={openDateRange.value}
        onCloseDateRange={openDateRange.onFalse}
        onOpenDateRange={openDateRange.onTrue}
        //
        filters={filters}
        onFilters={handleFilters}
        //
        dateError={dateError}
        typeOptions={FILE_TYPE_OPTIONS}
      />
      {false && (
        <ToggleButtonGroup size="small" value={view} exclusive onChange={handleChangeView}>
          <ToggleButton value="list">
            <Iconify icon="solar:list-bold" />
          </ToggleButton>
          <ToggleButton value="grid">
            <Iconify icon="mingcute:dot-grid-fill" />
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    </Stack>
  );

  const renderResults = (
    <FileManagerFiltersResult
      filters={filters}
      onResetFilters={handleResetFilters}
      //
      canReset={canReset}
      onFilters={handleFilters}
      //
      results={dataFiltered.length}
    />
  );
  function calculatePercentage(part, total) {
    return ((part / total) * 100).toFixed(2);
  }
  const TOTALLIMIT = 150000000;
  const renderStorageOverview = (
    <FileStorageOverview
      total={overview.used || 0}
      chart={{
        series: calculatePercentage(overview.used, TOTALLIMIT),
      }}
      data={[]}
      //   data={[
      //     {
      //       name: 'Images',
      //       usedStorage: (overview.used || 0) / 2,
      //       filesCount: 223,
      //       icon: <Box component="img" src="/assets/icons/files/ic_img.svg" />,
      //     },
      //     {
      //       name: 'Media',
      //       usedStorage: (overview.used || 0) / 5,
      //       filesCount: 223,
      //       icon: <Box component="img" src="/assets/icons/files/ic_video.svg" />,
      //     },
      //     {
      //       name: 'Documents',
      //       usedStorage: (overview.used || 0) / 5,
      //       filesCount: 223,
      //       icon: <Box component="img" src="/assets/icons/files/ic_document.svg" />,
      //     },
      //     {
      //       name: 'Other',
      //       usedStorage: (overview.used || 0) / 10,
      //       filesCount: 223,
      //       icon: <Box component="img" src="/assets/icons/files/ic_file.svg" />,
      //     },
      //   ]}
    />
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">文件 管理</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
            onClick={upload.onTrue}
          >
            上传
          </Button>
        </Stack>
        {!upMd && (
          <Stack sx={{ my: { xs: 3, md: 5 } }} spacing={2.5}>
            {renderStorageOverview}
          </Stack>
        )}
        <Stack
          spacing={2.5}
          sx={{
            my: { xs: 3, md: 5 },
          }}
        >
          {renderFilters}

          {canReset && renderResults}
        </Stack>

        {notFound ? (
          <EmptyContent
            filled
            title="No Data"
            sx={{
              py: 10,
            }}
          />
        ) : (
          <>
            {view === 'list' ? (
              <FileManagerTable
                table={table}
                tableData={data}
                dataFiltered={dataFiltered}
                onDeleteRow={handleDeleteItem}
                notFound={notFound}
                onOpenConfirm={confirm.onTrue}
              />
            ) : (
              <FileManagerGridView
                onRefresh={onRefresh}
                table={table}
                data={data}
                dataFiltered={dataFiltered}
                onDeleteItem={handleDeleteItem}
                onDeleteInvitedItem={handleDeleteInvitedItem}
                onOpenConfirm={confirm.onTrue}
              />
            )}
          </>
        )}
      </Container>

      <FileManagerNewFolderDialog
        open={upload.value}
        onClose={() => {
          upload.onFalse();
          onRefresh();
        }}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="删除"
        content={
          <>
            确定要删除 <strong> {table.selected.length} </strong> 个文件?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteItems();
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

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, type, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (file) => file.label.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (type.length) {
    inputData = inputData.filter((file) => type.includes(fileFormat(file.type)));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (file) =>
          fTimestamp(file.createdAt) >= fTimestamp(startDate) &&
          fTimestamp(file.createdAt) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}
