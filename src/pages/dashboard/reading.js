import { Helmet } from 'react-helmet-async';
// sections
import { ReadingDetailsView } from 'src/sections/reading/view';

// ----------------------------------------------------------------------

export default function PermissionDeniedPage () {
    return (
        <>
            <Helmet>
                <title> Dashboard: Reading View</title>
            </Helmet>

            <ReadingDetailsView />
        </>
    );
}
