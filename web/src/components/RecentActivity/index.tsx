import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material'
import {
    NotificationsOutlined as NotificationIcon,
    AccessTime as ClockIcon,
} from '@mui/icons-material';

export default function RecentActivity({tests}: {tests: Test[]}) {
    return (
        <Box sx={{
            width: 320, flexShrink: 0, borderLeft: '1px solid #e0e0e0',
            p: 3, backgroundColor: '#fff', borderRadius: 3,
            display: {xs: 'none', lg: 'block'}
        }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>
                <NotificationIcon sx={{verticalAlign: 'middle', mr: 1}}/>
                Hoạt động gần đây
            </Typography>

            <List>
                {tests.reverse().map((test: Test) => (
                    <ListItem key={test.id} sx={{px: 0, py: 1}}>
                        <ListItemIcon sx={{minWidth: 40}}>
                            <Avatar
                                src={`https://i.pravatar.cc/150?img=${test.id}`}
                                sx={{width: 32, height: 32}}
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant="body2">
                                    Bài thi <Typography component="span" color="primary"
                                                        fontWeight="medium">{test.name}</Typography> vừa
                                    được tải lên
                                </Typography>
                            }
                            secondary={
                                <Box sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
                                    <ClockIcon sx={{fontSize: 14, mr: 0.5, color: 'text.secondary'}}/>
                                    <Typography variant="caption" color="text.secondary">
                                        {test.date}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                ))
                }
            </List>

        </Box>
    )
}