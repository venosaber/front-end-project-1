import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material'
import {
    NotificationsOutlined as NotificationIcon,
    AccessTime as ClockIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

import type {ExamGroup} from '../../utils/types';

export default function RecentActivity({examGroups}: {examGroups: ExamGroup[]}) {
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
                {examGroups.reverse().map((examGroup: ExamGroup) => (
                    <ListItem key={examGroup.id} sx={{px: 0, py: 1}}>
                        <ListItemIcon sx={{minWidth: 40}}>
                            <Avatar
                                src={`https://i.pravatar.cc/150?img=${examGroup.id}`}
                                sx={{width: 32, height: 32}}
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Typography variant="body2">
                                    Bài thi <Typography component="span" color="primary"
                                                        fontWeight="medium">{examGroup.name}</Typography> vừa
                                    được tải lên
                                </Typography>
                            }
                            secondary={
                                <Box sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
                                    <ClockIcon sx={{fontSize: 14, mr: 0.5, color: 'text.secondary'}}/>
                                    <Typography variant="caption" color="text.secondary">
                                        {dayjs(examGroup.created_at).format("DD-MM-YYYY HH:mm:ss")}
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