


import PropTypes from 'prop-types';
import { useState, useCallback, useEffect, useImperativeHandle } from 'react';
// components
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarExport } from '@mui/x-data-grid';
import _ from 'lodash'
import { Button } from '@mui/material';
// eslint-disable-next-line import/no-extraneous-dependencies
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { useSnackbar } from '../snackbar';
// redux
import { useSelector } from '../../redux/store';

// eslint-disable-next-line react/prop-types
function CustomToolbar ({ importFile, onInsert }) {
    return (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport />
            {
                importFile && <Button size="small" startIcon={<NoteAddIcon />} onClick={importFile}>
                    导入
                </Button>
            }
            {
                onInsert && <Button size="small" startIcon={<NoteAddIcon />} onClick={onInsert}>
                    新增
                </Button>
            }
        </GridToolbarContainer >
    );
}
DataTable.propTypes = {
    columns: PropTypes.array,
    server: PropTypes.any,
    importFile: PropTypes.any,
    onInsert: PropTypes.func,
    childRef: PropTypes.any,
    search: PropTypes.object
};
export default function DataTable ({ server, columns, importFile, onInsert, childRef, search }) {
    const scope = useSelector((state) => state.scope);
    const { enqueueSnackbar } = useSnackbar();
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [sortModel, setSortModel] = useState([])
    const [filterModel, setFilterModel] = useState({
        items: []
    })
    const [isLoading, setIsLoading] = useState(true);
    const [tableData, setTableData] = useState([]);
    const [rowCountState, setRowCountState] = useState(0);
    const operation = (item) => {
        switch (item.operatorValue) {
            case "contains":
                return {
                    [item.columnField]: {
                        "$in": [item.value]
                    }
                }
            default:
                return item.value
        }
    }
    const getDatas = useCallback(async (selector = {}, options = {}) => {
        try {
            setIsLoading(true)
            const response = await server.pagination({
                ...search,
                ..._.merge(...filterModel.items.map(item => (operation(item)))),
                ...selector
            },
                {
                    scope: scope.active._id,
                    skip: paginationModel.page * paginationModel.pageSize,
                    limit: paginationModel.pageSize,
                    sort: sortModel.map(sort => (_.toPairs({ [sort.field]: sort.sort })[0])),
                    ...options
                },
            )
            setTableData(response.data);
            setRowCountState(Math.ceil(response.total / paginationModel.pageSize) - 1)
            setIsLoading(false)
        } catch (error) {
            enqueueSnackbar(error.message);
        }
    }, [server, paginationModel, filterModel, sortModel, search, scope, setIsLoading, setRowCountState, setTableData, enqueueSnackbar])
    useEffect(() => {
        getDatas()
    }, [getDatas]);

    useImperativeHandle(childRef, () => ({
        refresh: () => {
            getDatas()
        }
    }))
    const onPageSizeChange = (pageSize) => {
        setPaginationModel({
            page: 0,
            pageSize,
        })
        getDatas()
    }
    const onSortModelChange = (sortModels) => {
        setSortModel(sortModels)
        // getDatas()
    }
    const onFilterModelChange = (filters) => {
        setFilterModel(filters)
        getDatas()
    }
    return (
        <DataGrid
            autoHeight
            // checkboxSelection
            disableSelectionOnClick
            columns={columns}
            pageSizeOptions={[5, 10, 20, 50, 100]}
            pagination
            getRowId={(row) => row._id}
            filterMode="server"
            sortingMode="server"
            paginationMode="server"
            rowCount={rowCountState}
            rows={tableData}
            loading={isLoading}
            sortModel={sortModel}
            filterModel={filterModel}
            paginationModel={paginationModel}
            onPageSizeChange={onPageSizeChange}
            onSortModelChange={onSortModelChange}
            onFilterModelChange={onFilterModelChange}
            keepNonExistentRowsSelected
            showCellVerticalBorder
            showColumnVerticalBorder
            density="comfortable"
            localeText={{
                toolbarExport: "导出",
                toolbarExportLabel: "导出",
                toolbarExportCSV: "导出为CSV",
                toolbarExportPrint: "打印",
                toolbarFilters: "过滤",
                toolbarFiltersLabel: "过滤",
                toolbarColumns: "字段",
                toolbarColumnsLabel: "字段",
                toolbarDensity: '密度',
                toolbarDensityLabel: '密度',
                toolbarDensityCompact: '紧凑',
                toolbarDensityStandard: '标准',
                toolbarDensityComfortable: '适当',
                columnsPanelShowAllButton: '显示全部',
                columnsPanelHideAllButton: '隐藏全部',
                columnsPanelTextFieldLabel: "查找字段",
            }}
            // slots={{
            //     Toolbar: GridToolbar,
            // }}
            components={{
                Toolbar: () => CustomToolbar({ importFile, onInsert }),
            }}
        />
    )
}