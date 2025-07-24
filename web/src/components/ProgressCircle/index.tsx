import { Box, CircularProgress, Typography } from '@mui/material';

export default function ProgressCircle({ value, total }: { value: number, total: number }) {
    const percent: number = (value / total) * 100;

    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress
                variant="determinate"
                value={100}
                sx={{
                    color: '#eee',
                }}
                size={80}
                thickness={5}
            />
            <CircularProgress
                variant="determinate"
                value={percent}
                sx={{
                    position: 'absolute',
                    left: 0,
                    color: 'green',
                }}
                size={80}
                thickness={5}
            />
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Typography variant="caption" component="div" fontSize={16}>
                    {`${value}/${total}`}
                </Typography>
            </Box>
        </Box>
    );
}
