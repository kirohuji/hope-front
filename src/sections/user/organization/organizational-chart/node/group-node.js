import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import { Typography, Card, Box, Stack, Avatar, IconButton, MenuItem } from '@mui/material';
import Label from 'src/components/label/label';
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';
// ----------------------------------------------------------------------

GroupNode.propTypes = {
  sx: PropTypes.object,
  node: PropTypes.object,
  depth: PropTypes.number,
  length: PropTypes.number,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onCreate: PropTypes.func,
  onToggle: PropTypes.func,
  onManager: PropTypes.func,
  onClick: PropTypes.func,
};

export default function GroupNode ({ node, depth, length, sx, onEdit, onDelete, onCreate, onToggle, onManager, onClick }) {
  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const theme = useTheme();

  const isLight = theme.palette.mode === 'light';

  const styles = (color) => ({
    bgcolor: alpha(theme.palette[color].main, 0.08),
    border: `solid 1px ${alpha(theme.palette[color].main, 0.24)}`,
    color: isLight ? theme.palette[color].darker : theme.palette[color].lighter,
  });

  // const isLabel = depth === 1;
  const isLabel = node.type === ("org" || "role") && !node.root;

  const isGrRoot = node.group === 'root' || node.root;

  const isGrProduct = node.group === 'product design';

  const isGrDevelopment = node.group === 'development';

  const isGrMarketing = node.group === 'marketing';

  return (
    <Stack sx={{ position: 'relative', display: 'inline-flex', cursor: 'pointer' }} alignItems="center">
      {!isLabel && false && (
        <Avatar
          alt={node.name}
          src={node.avatar || ''}
          sx={{
            mt: -3.5,
            zIndex: 9,
            width: 56,
            height: 56,
            position: 'absolute',
            border: `solid 4px ${theme.palette.background.paper}`,
          }}
        />
      )}

      <Card
        sx={{
          pt: 5,
          pb: 3,
          minWidth: 230,
          borderRadius: 1.5,
          textTransform: 'capitalize',
          ...(isLabel && { py: 2 }),
          ...(isLabel && isGrProduct && styles('primary')),
          ...(isLabel && isGrDevelopment && styles('info')),
          ...(isLabel && isGrMarketing && styles('warning')),
          ...sx,
        }}
      >
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
              ...(isGrProduct && {
                bgcolor: 'primary.light',
              }),
              ...(isGrDevelopment && {
                bgcolor: 'info.light',
              }),
              ...(isGrMarketing && {
                bgcolor: 'warning.light',
              }),
            }}
          />
        )}
        <Typography variant={isLabel ? 'subtitle1' : 'subtitle2'} noWrap onClick={onClick}>
          {node.name}
          {isLabel && (
            <Label
              color={(isGrDevelopment && 'info') || (isGrMarketing && 'warning') || 'primary'}
              sx={{ ml: 1 }}
            >
              {length || node.count}
            </Label>
          )}
        </Typography>
        {
          /**

        {!isLabel && (
          <Typography variant="caption" component="div" noWrap sx={{ color: 'text.secondary' }}>
            {node.role}
          </Typography>
        )}
           */
        }
        <Typography variant="caption" component="div" noWrap sx={{ color: 'text.secondary' }}>
          {node.role}
        </Typography>
      </Card>
      <MenuPopover
        open={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        arrow="left-center"
        sx={{ width: 160 }}
      >
        {onDelete && false && (
          <MenuItem
            disabled={node.root}
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
        {onCreate && isGrDevelopment && (
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onEdit();
            }}
          >
            <Iconify icon="gridicons:add-outline" />
            新增
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
        {
          onManager && false && <MenuItem
            onClick={() => {
              handleClosePopover();
              onManager();
            }}
          >
            <Iconify icon="gridicons:add-outline" />
            组织管理
          </MenuItem>
        }
        {
          /**
        <MenuItem
          onClick={() => {
            handleClosePopover();
            onToggle();
          }}
        >
          <Iconify icon="gridicons:add-outline" />
          显示/隐藏用户
        </MenuItem>
           */
        }
      </MenuPopover>
    </Stack>
  );
}
