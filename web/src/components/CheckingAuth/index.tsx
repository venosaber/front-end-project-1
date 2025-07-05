import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function CircularIndeterminate() {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
        }}>
            <Box>
                <Box sx={{textAlign: 'center'}}>
                    <CircularProgress size={150}/>
                </Box>

                <Box sx={{mt: 2, fontSize: 30, fontWeight: 'bold'}}>
                    Checking active login status, please wait...
                </Box>
            </Box>
        </Box>
    );
}
