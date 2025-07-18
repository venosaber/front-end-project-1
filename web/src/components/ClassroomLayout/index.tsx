import { useMemo, cloneElement, useState, useEffect} from "react";
import {Box, List, ListItemButton, ListItemIcon, ListItemText, Typography} from "@mui/material";
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import { Link, Routes, Route, useParams, useLocation} from 'react-router-dom';
import {Loading, MembersContent, OverviewContent, ExamGroupsList, ExamGroup as ExamGroupDetail, TeacherExamDetail} from "..";
import {getMethod} from "../../utils/api.ts";
import type {Course, ExamGroup} from "../../utils/types";
import {getValidAccessToken} from "../../router/auth.ts";
import {useNavigate} from "react-router-dom";

const ClassroomLayout = () => {

    const {id: classId } = useParams(); // get classId (id) from URL
    const [course, setCourse] = useState<Course>({
        id: 0,
        code: '',
        name: '',
        users: []
    });

    const [examGroups, setExamGroups] = useState<ExamGroup[]>([])

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const location = useLocation();
    const navigate = useNavigate();

    // useMemo to only compute again the menuItems when classId changes
    const menuItems = useMemo(() => {
        return [
            {
                text: "Tổng quan",
                path: `/class/${classId}`,
                segment: undefined,
                icon: <DashboardIcon />
            },
            {
                text: "Bài thi",
                path: `/class/${classId}/exam`,
                segment: "exam",
                icon: <AssignmentIcon />
            },
            {
                text: "Thành viên",
                path: `/class/${classId}/member`,
                segment: "member",
                icon: <PeopleIcon />
            }
        ];
    }, [classId]);

    const isActive = (pathSegment?: string) => {
        if (!classId) return false;

        const basePath = `/class/${classId}`;
        const currentPath = location.pathname.endsWith('/') && location.pathname.length > 1
            ? location.pathname.slice(0, -1)
            : location.pathname;

        if (!pathSegment) {
            return currentPath === basePath;
        }
        return currentPath === `${basePath}/${pathSegment}`;
    };

    useEffect(() => {
        const onMounted = async () => {
            const accessToken: string | null = await getValidAccessToken();
            if(!accessToken){
                console.error("No valid access token, redirecting to login page");
                navigate('/login');
                return;
            }

            try{
                const [courseData, examGroupsData] = await Promise.all([
                    getMethod(`/master/class/${classId}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }),
                    getMethod(`/exam_group?class_id=${classId}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    })
                ]);
                setCourse(courseData);
                setExamGroups(examGroupsData);

            }catch (err) {
                console.error("Error on loading course's data: ",err);
                navigate('/classes');

            }finally {
                setIsLoading(false);
            }
        }

        onMounted();
    }, []);

    if(isLoading) return <Loading />

    return (
        <Box sx={{mt: '64px', height: 'calc(100vh - 64px)', display: 'flex', backgroundColor: '#f5f5f5'}}>
            <Box sx={{width: '100%', maxWidth: 260, bgcolor: 'background.paper',
                display: {xs: 'none', md: 'flex'}, flexDirection: 'column', justifyContent: 'space-between'}}>
                <List component="nav" aria-label="main mailbox folders">
                    {menuItems.map((item) => {
                        const active = isActive(item.segment);
                        return (
                            <ListItemButton
                                key={item.text}
                                component={Link}
                                to={item.path}
                                selected={active}
                            >
                                <ListItemIcon>
                                    {cloneElement(item.icon, { color: active ? 'primary' : 'action' })}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        color: active ? 'primary' : 'action'
                                    }}
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
                <CopyrightInfo />
            </Box>

            <Box component="main" sx={{flexGrow: 1, p: 3, overflowY: 'auto'}}>
                <Routes>
                    <Route index element={<OverviewContent
                        course={course}
                        examGroups={examGroups}/>} />
                    <Route path="exam" element={<ExamGroupsList course={course}/>} />
                    <Route path="member" element={<MembersContent course={course}/>} />
                    <Route path="exam/:examGroupId" element={<ExamGroupDetail />} />
                    <Route path="exam/:examGroupId/:examId" element={<TeacherExamDetail />} />
                </Routes>
            </Box>
        </Box>
    )
}

function CopyrightInfo(){
    return  (
        <Box sx={{p: 2, mt: 'auto'}}>
            <Typography variant="caption" color="text.secondary" sx={{display: 'block', textAlign: 'center'}}>
                ©2024 Allrights reserved
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{display: 'block', textAlign: 'center'}}>
                BKStar
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{display: 'block', textAlign: 'center'}}>
                Version 1.3.1
            </Typography>
        </Box>
    )
}

export default ClassroomLayout;