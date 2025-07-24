import {useEffect, useState, useMemo} from 'react';
import type {ChangeEvent} from 'react';
import {Box, Button, Grid, InputAdornment, Paper, TextField, Typography} from '@mui/material';
import {Add as AddIcon, Description as DescriptionIcon, Search as SearchIcon} from '@mui/icons-material';
import type {ExamGroup, Course} from '../../utils/types';
import {Loading} from '..';

import dayjs from 'dayjs';
import {getMethod} from "../../utils/api.ts";
import {getUserInfo, getValidAccessToken} from "../../router/auth.ts";
import {useNavigate, Link, type NavigateFunction} from "react-router-dom";
import {ExamGroupDialog} from "..";

export default function ExamsContent({course}: { course: Course }) {
    const navigate: NavigateFunction = useNavigate();
    const {id: courseId} = course;
    const [userRole, setUserRole] = useState('student');

    const [searchQuery, setSearchQuery] = useState('');
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const handleCreateExamGroup = () => {
        setIsOpenDialog(true);
    };

    const [examGroups, setExamGroups] = useState<ExamGroup[]>([]);

    const filteredExamGroups: ExamGroup[] = useMemo(() =>
            examGroups.filter(examGroup =>
                examGroup.name.toLowerCase().includes(searchQuery.toLowerCase()))
        , [examGroups, searchQuery]);

    function toDateOnly(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    const today: Date = toDateOnly(new Date());

    const openExamGroups: ExamGroup[] = filteredExamGroups.filter(
        examGroup => toDateOnly(new Date(examGroup.start_time)) <= today
    );

    const notOpenExamGroups: ExamGroup[] = filteredExamGroups.filter(
        examGroup => toDateOnly(new Date(examGroup.start_time)) > today
    );

    const [isLoading, setIsLoading] = useState(true);
    const onMounted = async () => {
        const accessToken: string | null = await getValidAccessToken();
        if (!accessToken) {
            console.error("No valid access token, redirecting to login page");
            navigate('/login');
            return;
        }
        const {role} = getUserInfo(accessToken);
        setUserRole(role);

        const examGroupsData: ExamGroup[] = await getMethod(`/exam_group?class_id=${course.id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        setExamGroups(examGroupsData)
        setIsLoading(false);
    }

    useEffect(() => {
        onMounted();
    }, []);

    if (isLoading) return <Loading/>

    return (
        <>
            <Box sx={{p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
                {/* Header with search and create button */}
                <Box sx={{
                    display: {xs: 'block', md: 'flex'},
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <Typography variant="h5" fontWeight="bold" color="text.primary"
                                sx={{display: {xs: 'block', md: 'inline-flex'}, mb: 2}}
                    >
                        Danh sách Bài thi
                    </Typography>


                    <Box sx={{display: {xs: 'block', md: 'inline-flex'}}}>
                        <Box sx={{display: {xs: 'block', sm: 'inline-flex'}, gap: 2}}>
                        <TextField
                            placeholder="Tìm kiếm"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action"/>
                                        </InputAdornment>
                                    )
                                },

                            }}
                            sx={{backgroundColor: "#fff", flexShrink: 0, minWidth: '300px', mb: 2}}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateExamGroup}
                            // not allowing students to create an exam group
                            sx={{
                                display: userRole === 'student' ? 'none' : {xs: 'block', sm: 'inline-flex'},
                                flexShrink: 0, mb: 2
                            }}
                        >
                            <Box sx={{display: 'flex', alignItems: 'center ', gap: '5px'}}>
                                <AddIcon/> <Typography>Tạo bài thi</Typography>
                            </Box>
                        </Button>
                        </Box>
                    </Box>
                </Box>
                {/*</Grid>*/}

                {/* Active Tests Section */}
                <Box sx={{mb: 4}}>
                    <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        color="primary"
                        sx={{mb: 2}}
                    >
                        Bài thi đang diễn ra
                    </Typography>

                    <ExamGroupsGrid examGroups={openExamGroups} classId={course.id}/>
                </Box>

                {/* Not Active Tests Section - won't allow students to see */}
                <Box sx={{display: userRole === 'student' ? 'none' : 'block'}}>
                    <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        color="primary"
                        sx={{mb: 2}}
                    >
                        Bài thi chưa bắt đầu
                    </Typography>

                    <ExamGroupsGrid examGroups={notOpenExamGroups} classId={course.id}/>
                </Box>

            </Box>

            <ExamGroupDialog courseId={courseId}
                             isOpenDialog={isOpenDialog}
                             setIsOpenDialog={setIsOpenDialog}
                             onMounted={onMounted}
                             isDeleting={isDeleting}
                             setIsDeleting={setIsDeleting}
            />

        </>
    );
}

function ExamGroupsGrid({examGroups, classId}: { examGroups: ExamGroup[], classId: number }) {

    return (
        <>
            <Grid container spacing={2}>
                {examGroups.length === 0 && (<>0</>)}
                {examGroups.map((examGroup: ExamGroup) => (
                    <Grid size={{xs: 12, md: 6, lg: 4}} key={examGroup.id} sx={{border: '1px solid #0000ff'}}>

                        <Paper elevation={0}>
                            <Link to={`/class/${classId}/exam/${examGroup.id}`}
                                  style={{textDecoration: 'none', color: "#000000"}}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: '20px',
                                        p: 2,
                                        mr: 2
                                    }}
                                >
                                    <DescriptionIcon
                                        sx={{
                                            fontSize: 48,
                                            color: '#3498db'
                                        }}
                                    />

                                    <Box>
                                        <Typography variant='body1' fontWeight="medium" textAlign="left"
                                                    sx={{mb: 1}}>
                                            {examGroup.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary"
                                                    fontWeight={'medium'}>
                                            Ngày bắt đầu: {dayjs(examGroup.start_time).format('DD/MM/YYYY')}
                                        </Typography>
                                    </Box>

                                </Box>
                            </Link>
                        </Paper>

                    </Grid>
                ))}
            </Grid>
        </>
    )
}