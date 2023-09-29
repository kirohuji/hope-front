import { Helmet } from "react-helmet-async";
import { Link,useNavigate } from 'react-router-dom';
// components
import { Box, Button, Typography } from "@mui/material";
import { Stack } from "@mui/system";
// routes
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import { bookService } from "src/composables/context-provider";
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------
export default function TrainingDashboardView () {

  const { enqueueSnackbar } = useSnackbar();
    const { themeStretch } = useSettingsContext();
    const navigate = useNavigate();
    
    const onStart = async () => {
        const response = await bookService.startWithCurrentUser()
        if(response){
            navigate(paths.reading(response.article_id));
        } else {
            enqueueSnackbar('今日没有灵修!')
        }
    }
    return (
        <>
            <Helmet>
                <title>TrainingDashboard: | Minimal UI</title>
            </Helmet>
            <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                justifyContent="space-evenly"
                sx={{
                    position: "absolute",
                    bottom: "55%",
                    width: "100%",
                    color: '#007B55'
                }}
            >
                <Box sx={{ margin: '15px', width: '100%' }}>
                    <Typography align="left" variant="h5" gutterBottom >凡有爱心的，都是由神而生，并且认识神，没有爱心的，就不认识神，因为神就是爱。</Typography>
                </Box>
                <Box sx={{ margin: '0 15px', width: '100%' }}>
                    <Typography align="right" variant="h5" gutterBottom >（约壹4：78）</Typography>
                </Box>
            </Stack>
            <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                justifyContent="space-evenly"
                style={{
                    position: "absolute",
                    bottom: "10%",
                    width: "100%"
                }}
            >
                <Button variant="soft" sx={{
                    borderRadius: '5%',
                    width: '150px',
                    padding: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }} onClick={onStart}>
                    <div style={{
                        fontSize: '15px',
                        fontWeight: '700',
                    }}>
                        今日灵修
                    </div>
                </Button>

                <Button
                    variant="soft"
                    component={Link}
                    to="/training"
                    sx={{
                        borderRadius: '5%',
                        width: '150px',
                        padding: '15px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <div style={{
                        fontSize: '15px',
                        fontWeight: '700',
                    }}>
                        灵修进度
                    </div>
                </Button>
            </Stack>
        </>
    )
}