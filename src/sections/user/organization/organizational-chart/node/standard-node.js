import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { Box, Typography, IconButton, MenuItem, Card, Avatar } from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';
import Label from 'src/components/label/label';
// ----------------------------------------------------------------------

StandardNode.propTypes = {
  sx: PropTypes.object,
  node: PropTypes.object,
  depth: PropTypes.number,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onCreate: PropTypes.func,
  onToggle: PropTypes.func,
  onManager: PropTypes.func,
  onPermission: PropTypes.func,
  onClick: PropTypes.func,
  hasChild: PropTypes.bool,
};

export default function StandardNode({
  node,
  depth,
  sx,
  hasChild,
  onEdit,
  onDelete,
  onCreate,
  onToggle,
  onPermission,
  onManager,
  onClick,
}) {
  const name = node.label;

  const group = node.scope;

  const role = node.value;
  
  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };
  const isLabel = node.type === ('org' || 'role') && !node.root;

  const isGrRoot = group === 'root' || node.root;

  return (
    <>
      <Card
        className="card"
        sx={{
          p: 2,
          minWidth: 200,
          borderRadius: 1.5,
          textAlign: 'left',
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'column',
          textTransform: 'capitalize',
          ...(isLabel && { py: 2 }),
          ...sx,
        }}
      >
        {hasChild && (
          <IconButton
            color="default"
            onClick={onToggle}
            sx={{ position: 'absolute', top: 8, right: 32 }}
          >
            <Iconify icon="la:expand" />
          </IconButton>
        )}
        <IconButton
          color={openPopover ? 'inherit' : 'default'}
          onClick={handleOpenPopover}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <Iconify icon="eva:more-horizontal-fill" />
        </IconButton>
        {depth !== 1 && !isGrRoot && (
          <Box
            sx={{
              top: 0,
              left: 0,
              width: 1,
              height: 4,
              position: 'absolute',
              borderRadius: 1.5,
            }}
          />
        )}
        <Avatar
          onClick={onClick}
          alt={node.name}
          src={node.leader?.photoURL || ''}
          sx={{ mr: 2, mb: 1, width: 48, height: 48 }}
        />

        <Typography variant={isLabel ? 'subtitle1' : 'subtitle2'} noWrap onClick={onClick}>
          {name}
          {node.count ? (
            <Label
              color="primary"
              sx={{ ml: 1 }}
            >
              {node.count}
            </Label>
          ) : (
            ''
          )}
        </Typography>
        <Typography variant="caption" component="div" noWrap sx={{ color: 'text.secondary' }}>
          {role || node.value}
        </Typography>
        {node.type === 'org' && (
          <Typography variant="caption" component="div" noWrap sx={{ color: 'text.secondary' }}>
            负责人:{' '}
            {`${node.leader?.displayName || node.leader.username}(${node.leader?.realName})` ||
              '无'}
          </Typography>
        )}
      </Card>

      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        arrow="left-center"
        sx={{ width: 160 }}
      >
        {onDelete && (
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:trash-2-outline" />
            删除
          </MenuItem>
        )}

        {onEdit && (
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onEdit();
            }}
          >
            <Iconify icon="eva:edit-fill" />
            编辑
          </MenuItem>
        )}
        {onPermission && (
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onPermission();
            }}
          >
            <Iconify icon="eva:edit-fill" />
            配置权限
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleClosePopover();
            onCreate();
          }}
        >
          <Iconify icon="gridicons:add-outline" />
          添加子节点
        </MenuItem>
        {onManager && false && (
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onManager();
            }}
          >
            <Iconify icon="gridicons:add-outline" />
            组织管理
          </MenuItem>
        )}
      </MenuPopover>
    </>
  );
}
