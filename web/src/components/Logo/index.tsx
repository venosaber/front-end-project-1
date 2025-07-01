import {Box, Card, CardMedia, Typography} from "@mui/material";

function Logo() {
    return(
        <>
            {/*logo*/}
            <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                <Card sx={{width: 80, boxShadow: 'none'}}>
                    <CardMedia image={'/logo2.png'}
                               title={'web logo'}
                               sx={{height: 60}}/>
                </Card>

                <Typography variant={'h2'} component={'span'}
                            sx={{fontWeight: 'bold', color: "#173054"}}>BK
                </Typography>

                <Typography variant={'h2'} component={'span'}
                            sx={{fontWeight: 'bold', color: "#f7a41d"}}>Star
                </Typography>
            </Box>
        </>
    )
}

export default Logo;