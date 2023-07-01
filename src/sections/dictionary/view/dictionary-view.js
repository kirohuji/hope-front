import { useCallback, useEffect, useState, useRef } from 'react';
import { chunk, findIndex } from 'lodash';
// @mui
import { Container, Card, Stack, IconButton, MenuItem, Button, DialogTitle, Dialog, } from '@mui/material';
// section
import Nav from 'src/sections/dictionary/nav/Nav';
import Header from 'src/sections/dictionary/header/Header';
import DictionaryForm from 'src/sections/dictionary/DictionaryForm';
// setting
import { useSettingsContext } from 'src/components/settings';
// components
import DataTable from 'src/components/data-table';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import MenuPopover from 'src/components/menu-popover';
import ConfirmDialog from 'src/components/confirm-dialog';
// composables
import { dictionaryService, dictionaryOptionService } from 'src/composables/context-provider';

// redux
// import { useSelector } from 'src/redux/store';

const columns = [
    {
        field: 'label',
        headerName: '名称',
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        editable: true,
    },
    {
        field: 'value',
        headerName: '编码',
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        disableColumnMenu: true,
        filterable: false,
        sortable: false,
    },
    {
        field: 'description',
        headerName: '描述',
        flex: 1.5,
        align: 'center',
        headerAlign: 'center',
        disableColumnMenu: true,
        filterable: false,
        sortable: false,
    },
    {
        field: 'type',
        headerName: '类型',
        flex: 1,
        align: 'center',
        headerAlign: 'center',
        editable: true,
    },
    {
        field: 'sort',
        headerName: '排序',
        flex: 0.5,
        align: 'center',
        headerAlign: 'center',
        disableColumnMenu: true,
        filterable: false,
        sortable: false,
    }
];
export default function DictionaryView () {
    // const scope = useSelector((state) => state.scope);
    const { themeStretch } = useSettingsContext();
    const [openNav, setOpenNav] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const [current, setCurrent] = useState(null)
    const [parent, setParent] = useState([])
    const [menus, setMenus] = useState([]);
    const [levels, setLevels] = useState([]);
    const [openPopover, setOpenPopover] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openVersionConfirm, setOpenVersionConfirm] = useState(false);
    const [openForm, setOpenForm] = useState(false);;
    const [row, setRow] = useState({});
    const dataTableEl = useRef(null);
    const handleOpenConfirm = () => {
        setOpenConfirm(true);
    };

    const handleCloseFormModal = () => {
        setOpenForm(false);
    }
    const handleVersionCloseConfirm = () => {
        setOpenVersionConfirm(false);
    }
    const handleOpenFormModal = () => {
        setOpenForm(true);
    }
    const handleCloseConfirm = () => {
        setOpenConfirm(false);
    };

    const handleOpenPopover = (event) => {
        setOpenPopover(event.currentTarget);
    };

    const handleClosePopover = () => {
        setOpenPopover(null);
    };

    const action = {
        field: 'action',
        headerName: '操作',
        align: 'center',
        headerAlign: 'center',
        width: 80,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => (
            <IconButton color={openPopover ? 'inherit' : 'default'} onClick={(e) => {
                setRow(params.row);
                handleOpenPopover(e);
            }}>
                <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
        ),
    }

    const getMenus = useCallback(async () => {
        const response = await dictionaryService.getAll({
            
        });
        setMenus(response)
    }, [setMenus])

    useEffect(() => {
        getMenus()
    }, [getMenus]);


    const onDeleteRow = async () => {
        dictionaryOptionService.delete({
            _id: row._id,
        })
        handleCloseConfirm(true)
        dataTableEl.current.refresh();
        enqueueSnackbar("发布成功");
    }

    const onCreate = () => {
        setRow({})
        handleOpenFormModal()
    }


    const onPublic = async () => {
        dictionaryService.patch({
            _id: current._id,
        })
        enqueueSnackbar("发布成功");
    }

    const onChildren = () => {
        const level = {
            name: row.label,
            to: row._id,
        }
        levels.push(level);
        setParent(row);
        setLevels(levels)
    }

    const onSave = async (form) => {
        if (row && row._id) {
            await dictionaryOptionService.patch({
                dictionaryId: current._id,
                parentId: parent._id,
                _id: row._id,
                ...form,
            })
        } else {
            await dictionaryOptionService.post({
                dictionaryId: current._id,
                parentId: parent._id,
                _id: row._id,
                ...form,
            })
        }
        handleCloseFormModal()
        dataTableEl.current.refresh();
    }

    return (
        <Container maxWidth={themeStretch ? false : 'xl'} >
            <Card
                sx={{
                    height: { md: '72vh' },
                    display: { md: 'flex' },
                }}
            >
                <Nav
                    items={menus}
                    openNav={openNav}
                    onCloseNav={()=> setOpenNav(false) }
                    onRefresh={getMenus}
                    onSelect={(item) => {
                        setCurrent(item);
                        setParent(item);
                        setLevels([
                            {
                                name: item.label,
                                root: true,
                                to: item._id
                            }
                        ])
                    }}
                />
                <Stack flexGrow={1} sx={{ overflow: 'hidden' }}>
                    {
                        current && <Header current={current} onPublic={() => setOpenVersionConfirm(true)} />
                    }
                    {
                        levels && levels.length > 0 && <CustomBreadcrumbs
                            links={levels}
                            sx={{ m: 1 }}
                            toLink={(link) => {
                                if (link.root) {
                                    setParent(current);
                                    setLevels([
                                        {
                                            name: current.label,
                                            root: true,
                                            to: current._id
                                        }
                                    ])
                                } else {
                                    const index = findIndex(levels, ["to", link.to])
                                    console.log(index)
                                    setLevels(chunk(levels, index + 1)[0])
                                    setParent({
                                        _id: link.to
                                    });
                                }
                            }}
                        />
                    }
                    {
                        current && <DataTable
                            onInsert={onCreate}
                            childRef={dataTableEl}
                            columns={[...columns, action]}
                            server={dictionaryOptionService}
                            search={{ parentId: parent._id}}
                        />
                    }
                </Stack>
                <MenuPopover
                    open={openPopover}
                    onClose={handleClosePopover}
                    arrow="right-top"
                    sx={{ width: 140 }}
                >
                    <MenuItem
                        onClick={() => {
                            handleOpenConfirm();
                            handleClosePopover();
                        }}
                        sx={{ color: 'error.main' }}
                    >
                        <Iconify icon="eva:trash-2-outline" />
                        删除
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleOpenFormModal()
                            handleClosePopover();
                        }}
                    >
                        <Iconify icon="eva:edit-fill" />
                        编辑
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            onChildren()
                            handleClosePopover();
                        }}
                    >
                        <Iconify icon="ri:expand-right-fill" />
                        编辑子集
                    </MenuItem>
                </MenuPopover>
                <ConfirmDialog
                    open={openConfirm}
                    onClose={handleCloseConfirm}
                    title="删除"
                    content="你确定删除吗?"
                    action={
                        <Button variant="contained" color="error" onClick={onDeleteRow}>
                            删除
                        </Button>
                    }
                />
                <ConfirmDialog
                    open={openVersionConfirm}
                    onClose={handleVersionCloseConfirm}
                    title=" 发布"
                    content="你确定发布吗?"
                    action={
                        <Button variant="contained" color="error" onClick={onPublic}>
                            发布
                        </Button>
                    }
                />
                <Dialog fullWidth maxWidth="xs" open={openForm} onClose={handleCloseFormModal}>
                    <DialogTitle>{row && row._id ? "编辑" : "新增"}</DialogTitle>
                    <DictionaryForm item={row} onSubmitData={onSave} />
                </Dialog>
            </Card>
        </Container >
    )
}