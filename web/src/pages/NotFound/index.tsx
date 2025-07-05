import {useNavigate} from "react-router-dom";
import {Box, Button, Typography} from "@mui/material";

export default function NotFound() {
    const navigate = useNavigate();
    const onGoBack = () => {
        navigate('/classes');
    }
    return (
        <Box sx={{textAlign: 'center', mt: '100px'}}>
            <Typography component={'h1'} variant={'h2'} color={'error'}>404 - Page Not Found</Typography>
            <Typography component={'p'} variant={'h5'} sx={{mt: 3}}>The page you are looking for does not exist.</Typography>
            <Button variant={'outlined'} sx={{mt: 4, p: 3}} onClick={onGoBack}>
                <Typography variant={'h6'}>Go back to home page here</Typography>
            </Button>
        </Box>
    )
}