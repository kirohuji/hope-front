/* eslint-disable import/no-extraneous-dependencies */
import { Helmet } from "react-helmet-async";
import { useState, useCallback, forwardRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import 'dayjs/locale/zh-cn';

// @mui
import {
    Box, Typography, LinearProgress, Grid,
    Slide,
    Dialog,
    Button,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
} from '@mui/material';

import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import { styled } from '@mui/material/styles';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { getPlay, getBooksWithCurrentUserBySummarize } from 'src/redux/slices/trainning';
// components
import {
    StaticDatePicker
} from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Link } from "react-router-dom";
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify'
import TrainingCard from 'src/sections/training/training-card'
import { bookService } from 'src/composables/context-provider';
import _ from 'lodash'

dayjs.extend(isBetweenPlugin);

const CustomDialogContent = styled(DialogContent, {})(() => ({
    backgroundImage: "https://api-dev-minimal-v4.vercel.app/assets/images/covers/cover_1.jpg"
}))
const CustomPickersDay = styled(PickersDay, {
    shouldForwardProp: (prop) =>
        prop !== 'isContain',
})(({ theme, isContain }) => ({
    backgroundColor: 'none',
    ...(isContain && {
        borderRadius: 0,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        '&:hover, &:focus': {
            backgroundColor: theme.palette.primary.dark,
        },
    }),
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
}));

function TabPanel (props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && children}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const defaultBook = {
    "_id": "YctPoepmauJSeAdZP",
    "label": "没选择灵修本! ",
    "description": "<p>当前没有选择灵修本!</p>",
    "cover": "http://localhost:5005/images/avatars/uW7stSkCa9PJG5Mwv/original/uW7stSkCa9PJG5Mwv.jpg",
    "title": "",
    "content": "",
    "employmentTypes": [],
    "experience": "1 year exp",
    "role": "Data Analyst",
    "skills": [],
    "workingSchedule": [],
    "locations": [],
    "benefits": [],
    "expiredDate": "20230805",
    "salary": {
        "type": "Hourly",
        "price": 0,
        "negotiable": false
    }
}
export default function TrainingProcessPage () {
    const dispatch = useDispatch();

    const { themeStretch } = useSettingsContext();

    const [scrollable, setScrollable] = useState('one');
    const [click, setCLick] = useState(null);
    const [value, setValue] = useState(null);
    const [open, setOpen] = useState(false);
    const [books, setBooks] = useState([]);

    const { bookSummarize } = useSelector((state) => state.trainning);    // const [bookSummarize, setBookSummarize] = useState([]);

    // const { list, current } = useSelector((state) => state.training);

    const getBooks = useCallback(async () => {
        try {
            const booksData = await bookService.getBooksWithCurrentUser();
            setBooks(booksData)
            const bookData = _.find(booksData, ["currentStatus", "active"])
            if (bookData) {
                dispatch(getBooksWithCurrentUserBySummarize({
                    bookId: bookData._id
                }))
                // const bookSummarizeData = await bookService.getBooksWithCurrentUserBySummarize({
                //     bookId: bookData._id
                // });
                // setBookSummarize(bookSummarizeData)
            }
        } catch (error) {
            // setLoadingPost(false);
            // setErrorMsg(error.message);
        }
    }, [dispatch])

    const getCurrentTraining = useCallback(async () => {
        try {
            dispatch(getPlay())
        } catch (error) {
            // setLoadingPost(false);
            // setErrorMsg(error.message);
        }
    }, [dispatch])

    useEffect(() => {
        getBooks();
        getCurrentTraining()
    }, [getBooks, getCurrentTraining]);

    const handleDialogOpen = () => {
        setOpen(true);
    };

    const handleDialogClose = () => {
        setOpen(false);
    };

    const handleClick = (event) => {
        setCLick(event.currentTarget);
    };
    const handleClose = () => {
        setCLick(null);
    };

    const renderPickerDay = (date, selectedDates, pickersDayProps, dates) => {
        if (!value) {
            return <PickersDay {...pickersDayProps} />;
        }
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < dates.length; i++) {
            const isContain = date.isSame(dates[i], 'day');
            if (date.isSame(dates[i], 'day')) {
                return <CustomPickersDay
                    // onClick={(e) => {
                    //     handleDialogClose();
                    //     handleDialogOpen(e)
                    // }}
                    isContain={isContain}
                    {...pickersDayProps}
                />
            }
        }
        return (
            <CustomPickersDay
                isContain={false}
                {...pickersDayProps}
            />
        );
    };

    return (
        <>
            <Helmet>
                <title> 灵修 | Hope Family</title>
            </Helmet>
            <TabPanel value={scrollable} index="one" key={0}>
                <Box sx={{ margin: '0 15px', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h4" >正在学习</Typography>
                    <Label style={{ textDecoration: 'none' }} variant="soft" color="primary" component={Link} to="/training/search">
                        换本灵修
                    </Label>
                </Box>
                <Box
                    sx={{
                        bgcolor: 'background.neutral',
                        margin: '15px',
                        borderRadius: '5%'
                    }}
                >
                    <Box sx={{ display: 'flex', position: "relative" }}>
                        {books.length ? books.map((book, index) => <TrainingCard post={book} index={index} key={index} />) : <TrainingCard post={defaultBook} />}
                        {
                            false && <Iconify
                                icon="ic:outline-more-vert"
                                style={{
                                    mr: 1, color: 'text.primary', position: "absolute", right: "8px", top: '8px'
                                }} />
                        }
                    </Box>
                    {
                        books.length ? <Box sx={{ padding: '15px' }}>
                            <div>
                                <LinearProgress
                                    variant="determinate"
                                    value={(bookSummarize.inProcess / bookSummarize.total) * 100}
                                    sx={{ width: 1 }} />
                            </div>
                            <div style={{
                                fontSize: '14px',
                                marginTop: '8px',
                                display: "flex",
                                justifyContent: "space-between"
                            }}>
                                <div>
                                    已完成 {bookSummarize.inProcess}天
                                </div>
                                <div> 总共{bookSummarize.total}天</div>
                            </div>
                        </Box> : <div />
                    }
                </Box>

                <Box sx={{ marginLeft: '15px' }}>
                    <Typography variant="h4" gutterBottom >我的进程</Typography>
                </Box>
                {
                    false &&
                    <Box
                        sx={{
                            bgcolor: 'background.neutral',
                            margin: '15px',
                            padding: '15px',
                            borderRadius: '5%'
                        }}
                    >
                        <Typography variant="h6" gutterBottom >概览</Typography>
                        <Box>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={3} md={3}>
                                    <Label variant="ghost" color="primary" startIcon={<Iconify icon="eva:email-fill" />} style={{ background: 'none' }}>
                                        今日学习时长
                                    </Label>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginLeft: '6px'
                                    }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>69</span><span style={{ fontSize: '14px', marginLeft: '4px' }}>分钟</span>
                                    </div>
                                </Grid>
                                <Grid item xs={6} sm={3} md={3}>
                                    <Label variant="ghost" color="primary" startIcon={<Iconify icon="eva:email-fill" />} style={{ background: 'none' }}>
                                        累积学习时长
                                    </Label>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginLeft: '6px'
                                    }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>5705</span><span style={{ fontSize: '14px', marginLeft: '4px' }}>分钟</span>
                                    </div>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                }
                <Box
                    sx={{
                        bgcolor: 'background.neutral',
                        margin: '15px',
                        padding: '15px',
                        borderRadius: '5%'
                    }}
                >
                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale="zh-cn">
                        <StaticDatePicker
                            orientation="portrait"
                            className="whiteBg"
                            openTo="day"
                            value={value}
                            view="day"
                            width="100%"
                            displayStaticWrapperAs="desktop"
                            onChange={(newValue) => {
                                setValue(newValue);
                            }}
                            renderDay={(date, selectedDates, pickersDayProps) => renderPickerDay(date, selectedDates, pickersDayProps, bookSummarize?.days?.map(day => new Date(day)) || [])}
                            showToolbar={false}
                            renderInput={() => null}
                        />
                    </LocalizationProvider>
                </Box>

                {
                    /**
                    <Popover
                        open={Boolean(click)}
                        anchorEl={click}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                        disableRestoreFocus
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                    >
                        <Box sx={{ p: 2, maxWidth: 280 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Etiam feugiat lorem non metus
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Fusce vulputate eleifend sapien. Curabitur at lacus ac velit ornare lobortis.
                            </Typography>
                        </Box>
                    </Popover>
                     */
                }
                <Dialog
                    open={open}
                    TransitionComponent={Transition}
                    keepMounted
                    fullWidth
                    onClose={handleDialogClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <div style={{ backgroundImage: "url(https://api-dev-minimal-v4.vercel.app/assets/images/covers/cover_1.jpg)", backgroundSize: "cover", height: '200px' }}>
                        <DialogTitle id="alert-dialog-slide-title">2023年5月21日 灵修</DialogTitle>
                        <CustomDialogContent>
                            <DialogContentText id="alert-dialog-slide-description" style={{ color: 'black' }}>
                                爱是恒久忍耐...
                            </DialogContentText>
                        </CustomDialogContent>
                    </div>
                    <DialogActions>
                        <Button color="inherit" onClick={handleDialogClose}>
                            取消
                        </Button>
                        <Button variant="contained" onClick={handleDialogClose}>
                            查看
                        </Button>
                    </DialogActions>
                </Dialog>
            </TabPanel>
        </>
    )
}