import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// utils
import { fDate } from 'src/utils/format-time';
// components
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import TextMaxLine from 'src/components/text-max-line';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { articleService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

export default function ArticleItemHorizontal({ onRefresh, article, book }) {
  const popover = usePopover();

  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const {
    title,
    author,
    coverUrl,
    date,
    description,
    _id,
  } = article;

  return (
    <>
      <Stack component={Card} direction="row">
        <Stack
          sx={{
            width: '100%',
            p: (theme) => theme.spacing(3, 3, 2, 3),
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>

            <Box component="span" sx={{ typography: 'caption', color: 'text.disabled' }}>
              {fDate(date)}
            </Box>
          </Stack>

          <Stack spacing={1} flexGrow={1}>
            <Link
              color="inherit"
              component={RouterLink}
              href={paths.dashboard.article.details(_id)}
            >
              <TextMaxLine variant="subtitle2" line={2}>
                {title}
              </TextMaxLine>
            </Link>

            <TextMaxLine variant="body2" sx={{ color: 'text.secondary' }}>
              {description}
            </TextMaxLine>
          </Stack>

          <Stack direction="row" alignItems="center">
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-horizontal-fill" />
            </IconButton>
          </Stack>
        </Stack>

        {mdUp && (
          <Box sx={{ width: 180, height: 240, position: 'relative', flexShrink: 0, p: 1 }}>
            {author && (
              <Avatar
                alt={author?.name}
                src={author?.avatarUrl}
                sx={{ position: 'absolute', top: 16, right: 16, zIndex: 9 }}
              />
            )}
            <Image alt={title} src={coverUrl} sx={{ height: 1, borderRadius: 1.5 }} />
          </Box>
        )}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="bottom-center"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            router.push(paths.dashboard.article.details(_id));
          }}
        >
          <Iconify icon="solar:eye-bold" />
          查看
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            if (book) {
              router.push(paths.dashboard.book.article.edit(book._id, _id));
            } else {
              router.push(paths.dashboard.article.edit(_id));
            }
          }}
        >
          <Iconify icon="solar:pen-bold" />
          编辑
        </MenuItem>

        <MenuItem
          onClick={async () => {
            await articleService.delete({
              _id,
            });
            onRefresh();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          删除
        </MenuItem>
      </CustomPopover>
    </>
  );
}

ArticleItemHorizontal.propTypes = {
  onRefresh: PropTypes.func,
  book: PropTypes.object,
  article: PropTypes.shape({
    author: PropTypes.object,
    coverUrl: PropTypes.string,
    date: PropTypes.any,
    // date: PropTypes.instanceOf(Date),
    description: PropTypes.string,
    public: PropTypes.bool,
    title: PropTypes.string,
    totalComments: PropTypes.number,
    totalShares: PropTypes.number,
    totalViews: PropTypes.number,
    _id: PropTypes.string,
  }),
};
