/* eslint-disable react/prop-types */
import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect, forwardRef, useMemo, createContext } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import clsx from 'clsx';
// @mui
import TreeView from '@mui/lab/TreeView';
import TreeItem, { useTreeItem, treeItemClasses } from '@mui/lab/TreeItem';
import { alpha, styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';

// routes
import { paths } from 'src/routes/paths';

// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import EditForm from 'src/sections/access/edit-form';

// redux 
import { useSelector } from 'src/redux/store';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// utils
import { find } from 'lodash'
import { roleService } from 'src/composables/context-provider';
// sections

// ----------------------------------------------------------------------

const StyledTreeView = styled(TreeView)({
  height: 240,
  flexGrow: 1,
  maxWidth: 400,
});


const StyledTreeItem = styled((props) => <TreeItem {...props} />)(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));
StyledTreeItem.propTypes = {
  theme: PropTypes.object,
};
const EditContent = forwardRef((props, ref) => {
  const {
    classes,
    className,
    label,
    nodeId,
    icon: iconProp,
    expansionIcon,
    displayIcon,
  } = props;
  const {
    disabled,
    expanded,
    selected,
    focused,
    handleExpansion,
    handleSelection,
    preventSelection,
  } = useTreeItem(nodeId);

  const icon = iconProp || expansionIcon || displayIcon;

  const handleMouseDown = (event) => {
    preventSelection(event);
  };

  const handleExpansionClick = (event) => {
    handleExpansion(event);
    handleSelection(event);
  };

  const handleSelectionClick = (event) => {
    handleSelection(event);
  };
  return (
    <userContext.Consumer>
      {
        ({ setRow, quickEdit, handleAdd, handleAlter, handleRemove }) => <Box
          className={clsx(className, classes.root, {
            [classes.expanded]: expanded,
            [classes.selected]: selected,
            [classes.focused]: focused,
            [classes.disabled]: disabled,
          })}
          onClick={handleExpansionClick}
          onMouseDown={handleMouseDown}
          ref={ref}
          sx={{
            border: 'none',
            borderRadius: '5px',
            textAlign: 'left',
            position: 'relative',
            width: '100%',
            zIndex: 1,
            '& svg': {
              fontSize: 18,
            }
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            {icon}
            <Typography
              onClick={handleSelectionClick}
              component="div"
              className={classes.label}
              noWrap
            >
              {label.label}
            </Typography>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 18, }}>
            <Typography noWrap component="div" className={classes.label} onClick={() => {
              handleAdd(label)
            }}>
              添加
            </Typography>
            <Typography noWrap component="div" className={classes.label} onClick={() => {
              handleAlter(label)
            }}>
              修改
            </Typography>
            <Typography noWrap component="div" className={classes.label} onClick={() => {
              handleRemove(label)
            }}>
              删除
            </Typography>
          </div>
        </Box>
      }
    </userContext.Consumer>
  );
})


function SubList ({ data }) {
  return (
    <>
      {data.map((list) => (
        <List key={list.value} data={list} />
      ))}
    </>
  );
}

SubList.propTypes = {
  data: PropTypes.array,
};

export function List ({ data }) {
  const hasChild = data.children && !!data.children;
  return (
    <StyledTreeItem nodeId={data._id} label={data} _id={data._id} ContentComponent={EditContent} >
      {hasChild && <SubList data={data.children} />}
    </StyledTreeItem>
  );
}

List.propTypes = {
  data: PropTypes.object,
};


function getTree (data) {
  const root = data
    .filter((item) => item.root).map(item => ({
      name: item.label,
      ...item,
    }))
  const tree = [];
  function serverArray (list, parent) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < list.length; i++) {
      if (list[i]) {
        const item = find(data, ['_id', list[i]._id]);
        if (item && item.children) {
          if (item.children.length) {
            serverArray(item.children, item);
          } else {
            delete item.children;
          }
        }
        if (parent && parent.children) {
          if (item) {
            parent.children[i] = {
              name: item.label,
              ...item,
            };
          } else {
            delete parent.children[i];
          }
        }
      }
    }
    return tree;
  }
  serverArray(root, null);
  console.log('tree', root)
  return root;
}

const userContext = createContext({ item: {} });

export default function AccessPage () {
  const [permissions, setPermissions] = useState([]);
  const [row, setRow] = useState({})
  const [parent, setParent] = useState({})
  const scope = useSelector((state) => state.scope);

  const quickEdit = useBoolean();

  const settings = useSettingsContext();

  const getData = useCallback(async () => {
    const response = await roleService.getRoleWithUser({
      options: {
        scope: scope.active._id
      }
    });
    setPermissions(getTree(response));
  }, [setPermissions, scope]);

  const handleAdd = useCallback((data) => {
    setRow({});
    setParent(data);
    quickEdit.onTrue()
  }, [quickEdit, setParent])

  const handleAlter = useCallback((data) => {
    setRow(data);
    setParent(null);
    quickEdit.onTrue()
  }, [quickEdit, setRow])

  const handleRemove = useCallback(async (data) => {
    await roleService.delete({
      _id: data._id
    })
    getData()
  }, [getData])

  useEffect(() => {
    getData();
  }, [getData]);

  const providerValue = useMemo(() => ({ setRow, quickEdit, handleAdd, handleAlter, handleRemove }), [setRow, quickEdit, handleAdd, handleAlter, handleRemove]);


  return (
    <>
      <Helmet>
        <title> Dashboard: 资源权限</title>
      </Helmet>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Access"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'User', href: paths.dashboard.user.root },
            { name: 'List' },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Grid container spacing={3}>
          <Grid xs={12} md={12}>
            <Card sx={{ pt: 5, pb: 5, px: 3, height: '75vh' }}>
              <Button variant="text" sx={{ fontSize: 14 }} onClick={() => {
                setRow({
                  root: true,
                })
                setParent(null)
                quickEdit.onTrue()
              }}>
                添加根节点
              </Button>
              {
                permissions && permissions.length ?
                  <userContext.Provider value={providerValue}>
                    <StyledTreeView defaultExpanded={['1']}>
                      {permissions.map(permission => <List key={permission._id} data={permission} />)}
                    </StyledTreeView>
                  </userContext.Provider>
                  : ""
              }
            </Card>
          </Grid>
        </Grid>
      </Container>

      {
        quickEdit.value && <EditForm current={row} open={quickEdit.value} parent={parent} onClose={() => {
          quickEdit.onFalse();
          getData();
        }} />
      }
      {/** <AccessView /> */}
    </>
  );
}
