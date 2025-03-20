import PropTypes from 'prop-types';
import { useState, useRef, useCallback } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Markdown from 'src/components/markdown';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
import CryptoJS from 'crypto-js';

// utils
import { fDate } from 'src/utils/format-time';
// components
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

const secretKey = 'future';

// ----------------------------------------------------------------------

export default function ProfilePostItem({ post, user, onClick }) {
  const { poster } = post;

  const renderHead = (
    <CardHeader
      disableTypography
      avatar={<Avatar src={poster?.photoURL} alt={poster?.displayName} />}
      title={
        <Link color="inherit" variant="subtitle1">
          {poster?.displayName}
        </Link>
      }
      subheader={
        <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
          {fDate(post.publishedAt || post.createdAt)}
        </Box>
      }
      action={
        <IconButton>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      }
    />
  );

  const renderActions = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        p: (theme) => theme.spacing(2, 3, 3, 3),
      }}
    >
      {/* <FormControlLabel
        control={
          <Checkbox
            defaultChecked
            color="error"
            icon={<Iconify icon="solar:heart-bold" />}
            checkedIcon={<Iconify icon="solar:heart-bold" />}
          />
        }
        label={fShortenNumber(post.likeCount)}
        sx={{ mr: 1 }}
      /> */}
      <Stack direction="row" sx={{ fontSize: '12px', color: 'text.secondary' }}>
        <Box sx={{ mr: 2 }}>{post.likeCount} 赞同</Box>
        <Box>{post.commentCount} 评论</Box>
      </Stack>

      {/* {!!post.personLikes.length && (
        <AvatarGroup
          sx={{
            [`& .${avatarGroupClasses.avatar}`]: {
              width: 32,
              height: 32,
            },
          }}
        >
          {post.personLikes.map((person) => (
            <Avatar key={person.name} alt={person.name} src={person.avatarUrl} />
          ))}
        </AvatarGroup>
      )} */}

      {/* <Box sx={{ flexGrow: 1 }} />

      <IconButton onClick={handleClickComment}>
        <Iconify icon="solar:chat-round-dots-bold" />
      </IconButton>

      <IconButton>
        <Iconify icon="solar:share-bold" />
      </IconButton> */}
    </Stack>
  );

  return (
    <Box onClick={onClick} sx={{ p: 0.5, pr: 0.1, pl: 0.1 }}>
      <Card>
        {renderHead}

        {/* <Typography
          variant="body2"
          sx={{
            p: (theme) => theme.spacing(3, 3, 2, 3),
          }}
        >
          <Markdown children={post.body} />
        </Typography> */}

        <Markdown
          sx={{
            p: (theme) => theme.spacing(3, 3, 2, 3),
          }}
          children={CryptoJS.AES.decrypt(post.body, secretKey).toString(CryptoJS.enc.Utf8)}
        />
        {post.cover && (
          <Box sx={{ p: 1 }}>
            <Image alt={post.cover} src={post.cover} ratio="16/9" sx={{ borderRadius: 1.5 }} />
          </Box>
        )}

        {renderActions}

        {/* {!!post.comments.length && renderCommentList} */}

        {/* {renderInput} */}
      </Card>
    </Box>
  );
}

ProfilePostItem.propTypes = {
  post: PropTypes.object,
  user: PropTypes.object,
  onClick: PropTypes.func,
};
