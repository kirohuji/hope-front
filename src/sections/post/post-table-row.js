import PropTypes from 'prop-types';
import { format } from 'date-fns';
// @mui
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { getLabelFromValue } from 'src/utils/map';
import { status as statusMap } from './post-new-edit-form';
// ----------------------------------------------------------------------

export default function PostTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const {
    title,
    body,
    metaTitle,
    metaDescription,
    poster,
    category,
    publishedAt,
    published,
    commented,
    createdAt,
    status,
    _id,
  } = row;

  const router = useRouter();

  const confirm = useBoolean();

  const popover = usePopover();


  const handleSourceId = () => {
    router.push(paths.dashboard.post.details(_id));
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell
          sx={{
            display: 'flex',
            alignItems: 'center',
            maxWidth: '210px',
            whiteSpace: 'nowrap',
            overflow: 'hidden' /* 隐藏溢出的文本 */,
            textOverflow: 'ellipsis' /* 显示省略号 */,
          }}
        >
          <Avatar alt={poster.username} src={poster.photoURL} sx={{ mr: 2 }} />

          <ListItemText
            primary={`${poster.username}${
              poster.realName ? `(${poster.realName})` : ''
            }`}
            secondary={poster.email}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            disableTypography
            sx={{
              width: '120px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            primary={
              <Typography variant="body2" noWrap>
                {metaTitle}
              </Typography>
            }
            secondary={
              <Link
                noWrap
                variant="body2"
                onClick={onViewRow}
                sx={{ color: 'text.disabled', cursor: 'pointer' }}
              >
                {metaDescription}
              </Link>
            }
          />
        </TableCell>
        <TableCell
          sx={{
            maxWidth: '100px',
            whiteSpace: 'nowrap',
            overflow: 'hidden' /* 隐藏溢出的文本 */,
            textOverflow: 'ellipsis' /* 显示省略号 */,
          }}
        >
          <Link color="primary" onClick={handleSourceId} sx={{ cursor: 'pointer' }}>
            查看
          </Link>
        </TableCell>
        <TableCell
          sx={{
            width: '80px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {category ? category.join(',') : '未分类'}
        </TableCell>

        {/* <TableCell>{published ? '已发布' : '未发布'}</TableCell> */}

        <TableCell>{commented ? '允许' : '禁止'}</TableCell>

        <TableCell>
          <ListItemText
            primary={format(new Date(createdAt), 'dd MMM yyyy')}
            secondary={format(new Date(createdAt), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell>
          {publishedAt ? (
            <ListItemText
              primary={format(new Date(publishedAt), 'dd MMM yyyy')}
              secondary={format(new Date(publishedAt), 'p')}
              primaryTypographyProps={{ typography: 'body2', noWrap: true }}
              secondaryTypographyProps={{
                mt: 0.5,
                component: 'span',
                typography: 'caption',
              }}
            />
          ) : (
            '未发布'
          )}
        </TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'published' && 'success') ||
              (status === 'pending_review' && 'warning') ||
              (status === 'rejected' && 'error') ||
              'default'
            }
          >
            {getLabelFromValue(status, statusMap)}
          </Label>
        </TableCell>
        {/* 

        <TableCell>{published}</TableCell>

        <TableCell>{commented}</TableCell>

        <TableCell>{poster}</TableCell>

        <TableCell>
          <ListItemText
            primary={format(new Date(createdAt), 'dd MMM yyyy')}
            secondary={format(new Date(createdAt), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>

        <TableCell>
          {publishedAt ? (
            <ListItemText
              primary={format(new Date(publishedAt), 'YYYY-MM-DD')}
              secondary={format(new Date(publishedAt), 'p')}
              primaryTypographyProps={{ typography: 'body2', noWrap: true }}
              secondaryTypographyProps={{
                mt: 0.5,
                component: 'span',
                typography: 'caption',
              }}
            />
          ) : (
            '未发布'
          )}
        </TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'paid' && 'success') ||
              (status === 'pending' && 'warning') ||
              (status === 'overdue' && 'error') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell> */}

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          查看/编辑
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          删除
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="删除"
        content="你确认要删除吗?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            删除
          </Button>
        }
      />
    </>
  );
}

PostTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
