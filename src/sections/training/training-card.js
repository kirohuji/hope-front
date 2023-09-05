import PropTypes from 'prop-types';
import { paramCase } from 'src/utils/change-case';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { alpha, styled } from '@mui/material/styles';
import { Box, Card, Avatar, Typography, CardContent, Stack, Link } from '@mui/material';
// routes
import { paths } from 'src/routes/paths';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// utils
import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';
// components
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import TextMaxLine from 'src/components/text-max-line';
import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const StyledOverlay = styled('div')(({ theme }) => ({
    top: 0,
    zIndex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: alpha(theme.palette.grey[900], 0.64),
}));

// ----------------------------------------------------------------------

TrainingCard.propTypes = {
    index: PropTypes.number,
    post: PropTypes.object,
};

export default function TrainingCard ({ post, index }) {
    const isDesktop = useResponsive('up', 'md');

    const { cover, title, view, comment, share, author, createdAt } = post;

    const latestPost = index === 0 || index === 1 || index === 2;

    if (isDesktop && latestPost) {
        return (
            <Card>
                {
                    author && <Avatar
                        alt={author.name}
                        src={author.avatarUrl}
                        sx={{
                            top: 24,
                            left: 24,
                            zIndex: 9,
                            position: 'absolute',
                        }}
                    />
                }
                <PostContent
                    title={title}
                    view={view}
                    comment={comment}
                    share={share}
                    createdAt={createdAt}
                    index={index}
                />

                <StyledOverlay />

                <Image alt="cover" src={cover} sx={{ height: 40 }} />
            </Card>
        );
    }

    return (
        <Card sx={{ margin: '15px 0 15px 15px', width: '110px', height: '140px' }}>
            <Box sx={{ position: 'relative' }}>
                <Image alt="cover" src={cover} ratio="4/6" />
            </Box>
            <Stack spacing={2.5} sx={{
                position: "absolute",
                bottom: 0,
                background: "white",
                width: "100%",
                height: "41px",
                padding: "8px",
                fontSize: "14px"
            }}>
                {title}
            </Stack>
        </Card>
    );
}

// ----------------------------------------------------------------------

PostContent.propTypes = {
    view: PropTypes.number,
    index: PropTypes.number,
    share: PropTypes.number,
    title: PropTypes.string,
    comment: PropTypes.number,
    createdAt: PropTypes.string,
};

export function PostContent ({ title, view, comment, share, createdAt, index }) {
    const isDesktop = useResponsive('up', 'md');

    const linkTo = paths.post.view(title);

    const latestPostLarge = index === 0;

    const latestPostSmall = index === 1 || index === 2;

    const POST_INFO = [
        { id: 'comment', value: comment, icon: 'eva:message-circle-fill' },
        { id: 'view', value: view, icon: 'eva:eye-fill' },
        { id: 'share', value: share, icon: 'eva:share-fill' },
    ];

    return (
        <CardContent
            sx={{
                pt: 4.5,
                width: 1,
                ...((latestPostLarge || latestPostSmall) && {
                    pt: 0,
                    zIndex: 9,
                    bottom: 0,
                    position: 'absolute',
                    color: 'common.white',
                }),
            }}
        >
            <Typography
                gutterBottom
                variant="caption"
                component="div"
                sx={{
                    color: 'text.disabled',
                    ...((latestPostLarge || latestPostSmall) && {
                        opacity: 0.64,
                        color: 'common.white',
                    }),
                }}
            >
                {fDate(createdAt)}
            </Typography>

            <Link component={RouterLink} to={linkTo}  color="inherit">
                <TextMaxLine
                    variant={isDesktop && latestPostLarge ? 'h5' : 'subtitle2'}
                    line={2}
                    persistent
                >
                    {title}
                </TextMaxLine>
            </Link>

            <Stack
                flexWrap="wrap"
                direction="row"
                justifyContent="flex-end"
                sx={{
                    mt: 3,
                    color: 'text.disabled',
                    ...((latestPostLarge || latestPostSmall) && {
                        opacity: 0.64,
                        color: 'common.white',
                    }),
                }}
            >
                {POST_INFO.map((info) => (
                    <Stack
                        key={info.id}
                        direction="row"
                        alignItems="center"
                        sx={{ typography: 'caption', ml: info.id === 'comment' ? 0 : 1.5 }}
                    >
                        <Iconify icon={info.icon} width={16} sx={{ mr: 0.5 }} />
                        {fShortenNumber(info.value)}
                    </Stack>
                ))}
            </Stack>
        </CardContent>
    );
}
