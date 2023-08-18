
import { Helmet } from 'react-helmet-async';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { Container } from '@mui/material';
// components
import { useSettingsContext } from 'src/components/settings';

export default function UserPermissionView () {
    const { themeStretch } = useSettingsContext();
    return (
        <>
            <Helmet>
                <title> 权限配置 | Hope Family</title>
            </Helmet>
            <Container maxWidth={themeStretch ? false : 'lg'}>
                1
            </Container>
        </>
    )
}