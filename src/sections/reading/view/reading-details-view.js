
import { Helmet } from 'react-helmet-async';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import { Grid, Box, Divider, Stack, Container, Typography, Pagination } from '@mui/material';
import { bookService } from 'src/composables/context-provider';
import { useSettingsContext } from 'src/components/settings';
import {
    getArticle,
    nextStep,
    backStep,
} from 'src/redux/slices/article';
// components
import { SkeletonPostDetails } from 'src/components/skeleton';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
// sections
import QuestionnaireCard from 'src/sections/article/questionnaire/cards/index';
import ArticleRendering from '../ArticleRendering';

const STEPS = ['阅读环节', '问答环节'];
export default function ReadingPage () {
    const { themeStretch } = useSettingsContext();
    const dispatch = useDispatch();

    const [errorMsg, setErrorMsg] = useState(null);


    const { id } = useParams();
    const { article, isLoading, activeStep } = useSelector((state) => state.article);
    useEffect(() => {
        dispatch(getArticle(id));
    }, [dispatch, id]);

    const handleNextStep = () => {
        dispatch(nextStep());
    };

    const handleBackStep = () => {
        dispatch(backStep());
    };

    const handleSubmit = async (data) => {
      try{
        await bookService.submitWithCurrentUser(article);
      } catch(e){
        console.log(e.message)
      }
    }
    return (
        <>
            <Helmet>
                <title>{`Blog: ${article?.title || ''} | Hope Family`}</title>
            </Helmet>
            <Container maxWidth={themeStretch ? false : 'lg'}>
                <Box sx={{ mt: 2 }}>
                    {!isLoading &&
                        <>
                            {activeStep === 0 && (
                                <ArticleRendering post={article} onNextStep={handleNextStep} />
                            )}
                            {activeStep === 1 && (
                                <QuestionnaireCard
                                    post={article}
                                    onBackStep={handleBackStep}
                                    onNextStep={handleSubmit}
                                />
                            )}
                        </>
                    }
                    {errorMsg && !isLoading && <Typography variant="h6">404 {errorMsg}</Typography>}

                    {isLoading && <SkeletonPostDetails />}
                </Box>
            </Container>
        </>
    )
}