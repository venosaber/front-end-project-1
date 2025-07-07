import {
    Box, Button, Grid, Paper, Typography, Tooltip
} from '@mui/material';
import {ContentCopy as ContentCopyIcon} from '@mui/icons-material';
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import type {Member, ExamGroup, Course} from "../../utils/types"
import {toast} from "react-toastify";
import {RecentActivity, MembersContent} from "..";

interface OverviewContentProps {
    course: Course
    examGroups: ExamGroup[]
}

export default function OverviewContent({course, examGroups}: OverviewContentProps) {

    // swapping to have teachers at the head of the array
    const users: Member[] = course.users;
    users.sort((a, b) => {
        if (a.role === "teacher" && b.role === "student") {
            return -1;
        } else if (a.role === "student" && b.role === "teacher") {
            return 1;
        } else {
            return 0;
        }
    });
    const teachers: Member[] = users.filter(user => user.role === "teacher");
    const teachersName: string = teachers.map(teacher => teacher.name).join(", ");
    const newUsers: Member[] = [...users];

    /*********** share invite link *************/
    const baseUrl: string = window.location.origin;
    const linkToInvite = `${baseUrl}/invite?class=${course.id}`
    const onCopyLink = () => {
        navigator.clipboard.writeText(linkToInvite).then(() => {
            toast.info('Đã sao chép link lớp học!');
        }).catch((err) => {
            toast.error('Sao chép thất bại !');
            console.error('Failed to copy link to clipboard: ', err);
        })
    };

    return (
        <>
            <Box sx={{display: 'flex', justifyContent: 'space-around', gap: '20px', alignItems: 'flex-start'}}>
                <Box sx={{flexGrow: 1}}>
                    {/* Header section */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 2,
                            backgroundColor: '#3498db',
                            color: 'white'
                        }}>

                        <Box>
                            <Box>
                                <Typography variant="h5" fontWeight="bold" sx={{mb: 1}}>
                                    <AssignmentIcon sx={{mr: 1, verticalAlign: 'middle'}}/>
                                    {course.name}
                                </Typography>

                                <Typography variant="body1" sx={{opacity: 0.9}}>
                                    Giáo viên: {teachersName}
                                </Typography>

                                <Box sx={{display: 'flex', alignItems: 'flex-end', mt: 2, gap: '10px'}}>
                                    <Typography variant="body1" sx={{opacity: 0.9}}>
                                        Chia sẻ lớp học
                                    </Typography>

                                    {/*To center the tooltip for the Button, wrap the button inside Tooltip and div*/}
                                    <div style={{display: 'flex', justifyContent: 'center'}}>
                                        <Tooltip title={'Copy link mời vào lớp'} arrow>
                                            <Button
                                                variant="outlined"
                                                startIcon={<ContentCopyIcon/>}
                                                size="small"
                                                sx={{
                                                    mt: 1,
                                                    color: 'white',
                                                    borderColor: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                        borderColor: 'white',
                                                    }
                                                }}
                                                onClick={onCopyLink}
                                            >
                                                <Typography variant='caption' sx={{opacity: 0.9}}>
                                                    Sao chép liên kết
                                                </Typography>
                                            </Button>
                                        </Tooltip>
                                    </div>

                                </Box>

                            </Box>

                        </Box>

                    </Paper>

                    {/* Statistics section */}
                    <Grid container spacing={2}>
                        < Grid size={6}>
                            <Paper elevation={0} sx={{p: 2, borderRadius: 2}}>
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <PeopleIcon sx={{color: '#3498db', mr: 2, fontSize: 48}}/>
                                    <Typography variant="h5" fontWeight="medium">
                                        {newUsers.length} Thành Viên
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        < Grid size={6}>
                            <Paper elevation={0} sx={{p: 2, borderRadius: 2}}>
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <PeopleIcon sx={{color: '#3498db', mr: 2, fontSize: 48}}/>
                                    <Typography variant="h5" fontWeight="medium">
                                        {examGroups.length} Bài Kiểm Tra
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Members section */}
                    <MembersContent course={course} />
                </Box>

                {/* Recent Activity section */}
                <RecentActivity examGroups={examGroups} />
            </Box>
        </>
    )
}
