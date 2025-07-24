import {Box, Typography, Button} from '@mui/material';
import {Add as AddIcon} from '@mui/icons-material';
import {useNavigate, useParams} from 'react-router-dom';
import {useState, useEffect} from 'react';
import type {ExamGroup, Exam, ExamResult, User, Member, StudentResultGroup} from '../../utils/types';
import {ExamGroupDialog, ExamsList, ResultGroupsList} from '..';
import dayjs from 'dayjs';
import {getValidAccessToken} from "../../router/auth.ts";
import {getMethod} from "../../utils/api.ts";

export default function TeacherExamGroup() {
    const navigate = useNavigate();
    const {id, examGroupId} = useParams();
    const classId: number = Number(id);
    const handleBackToExamGroupsList = () => {
        navigate(`/class/${id}/exam`);
    };

    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const handleEditExamGroup = () => {
        setIsOpenDialog(true);
    };

    const [isDeleting, setIsDeleting] = useState(false);
    const handleDeleteExamGroup = async () => {
        setIsDeleting(true);
        setIsOpenDialog(true);
    }

    const handleCreateExam = () => {
        navigate(`/class/${id}/exam/${examGroupId}/0`);
    }

    const handleEditExam = (examId: number) => {
        navigate(`/class/${id}/exam/${examGroupId}/${examId}`);
    }

    const handleMark = (studentID: number)=> {
        navigate(`/class/${id}/exam/${examGroupId}/marking?student=${studentID}`);
    }

    const [examGroupDetail, setExamGroupDetail] = useState<ExamGroup | undefined>(undefined);
    const [exams, setExams] = useState<Exam[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [studentResultGroups, setStudentResultGroups] = useState<StudentResultGroup[]>([]);

    let examName: string = '';
    let awaitTime: number = 0;
    let startTime: string = '';
    if (examGroupDetail) {
        examName = examGroupDetail.name;
        awaitTime = examGroupDetail.await_time / 60;
        startTime = dayjs(examGroupDetail.start_time).format('DD/MM/YYYY');
    }

    const onMounted = async () => {
        const accessToken: string | null = await getValidAccessToken();
        if (!accessToken) {
            console.error("No valid access token, redirecting to login page");
            navigate('/login');
            return;
        }

        try {
            const [examGroupData, examsData, classData] = await Promise.all([
                getMethod(`/exam_group/${examGroupId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }),
                getMethod(`/exam/?exam_group=${examGroupId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }),
                getMethod(`/master/class/${classId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })
            ]);
            if (examGroupData) setExamGroupDetail(examGroupData);
            if (examsData) setExams(examsData);

            // get detail info of all users in the class
            let members: Member[] = [];
            if (classData) members = classData.users;
            // filter by role to get students only
            if (members) {
                const membersData: User[] = await Promise.all(
                    members.map(member => getMethod(`/master/user/${member.id}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }))
                )
                const studentsData: User[] = membersData.filter(member => member.role === 'student');
                if (studentsData) setStudents(studentsData);
            }
        } catch (e) {
            console.error('Problem fetching data from server', e);
        }
    }

    useEffect(() => {
        onMounted();
    }, [])

    useEffect(() => {
        const onMountingResults = async () => {
            const accessToken: string | null = await getValidAccessToken();
            if (!accessToken) {
                console.error("No valid access token, redirecting to login page");
                navigate('/login');
                return;
            }

            try {
                // 2-dimensional array of ExamResult
                const resultsData: ExamResult[][] = await Promise.all(
                    students.map(student =>
                        getMethod(`/exam_result/?student=${student.id}&exam_group=${examGroupId}`, {
                            headers: {
                                Authorization: `Bearer ${accessToken}`
                            }
                        })
                    )
                );

                // add exam results to each student's data
                const studentResults= students.map((student: User, index: number)=>{
                    return {
                        ...student,
                        results: resultsData[index]
                    }
                });
                console.log('empty & not empty: ', studentResults);
                // only show students who have taken at least one of the exams
                const notEmptyStudentResults: StudentResultGroup[] = studentResults.filter((studentResult: StudentResultGroup) =>
                    studentResult.results.length > 0);
                console.log('not empty: ',notEmptyStudentResults);
                setStudentResultGroups(notEmptyStudentResults);
            } catch (e) {
                console.error('Problem fetching data from server', e);
            }
        }

        onMountingResults();
    }, [students, examGroupId]);

    return (
        <>
            <Box sx={{display: 'flex'}}>
                <Typography variant="h6" fontWeight="bold" mb={3}
                            sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                                mr: 2
                            }}
                            onClick={handleBackToExamGroupsList}
                >
                    Danh sách bài thi
                </Typography>
                <Typography variant="h6" fontWeight="bold" mb={3}>{`>`} Chi tiết bài thi</Typography>
            </Box>

            {/* Exam group info */}
            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                mb: 3, p: 2, backgroundColor: '#ffffff',
                borderRadius: '8px', border: '1px solid #0000ff'
            }}>
                {/* Info */}
                <Box>
                    <Typography variant={"h6"} fontWeight={500}>Tên bài thi: {examName}</Typography>
                    <Typography variant={"h6"} fontWeight={500}>Ngày bắt đầu: {startTime}</Typography>
                    <Typography variant={"h6"} fontWeight={500}>Thời gian chờ giữa các đề
                        bài: {awaitTime} phút</Typography>
                </Box>
                {/* Buttons*/}
                <Box sx={{display: 'flex', gap: '10px'}}>
                    <Button variant={'contained'} color={'success'}
                            sx={{fontWeight: 600}}
                            onClick={handleEditExamGroup}
                    >Chỉnh sửa</Button>
                    <Button variant={'outlined'} color={'error'}
                            sx={{fontWeight: 600}}
                            onClick={handleDeleteExamGroup}
                    >Xóa bỏ</Button>
                </Box>
            </Box>

            {/* List of exams  */}
            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography variant={"h6"} fontWeight={600} color={'primary'}>Danh sách đề bài</Typography>
                <Button variant={'contained'}
                        sx={{fontWeight: 600, fontSize: 16}}
                        onClick={handleCreateExam}
                >
                    <AddIcon/>Thêm đề bài
                </Button>
            </Box>

            {
                (!exams || exams.length === 0)
                    ? (
                        <Typography fontWeight={500} sx={{fontSize: 18, mb: 2}}>
                            Chưa có đề bài nào được tải lên.
                        </Typography>
                    )
                    : <ExamsList exams={exams} handleEditExam={handleEditExam}/>
            }

            {/* List of student result groups */}
            <Typography variant={"h6"} fontWeight={600} color={'primary'}>Danh sách bài làm</Typography>

            {
                (!studentResultGroups || studentResultGroups.length === 0)
                    ? (
                        <Typography fontWeight={500} sx={{fontSize: 18, mb: 2}}>
                            Chưa có học viên nào làm bài thi.
                        </Typography>
                    )
                    : <ResultGroupsList studentResultGroups={studentResultGroups}
                                        numberOfExams={exams.length}
                                        handleMark={handleMark}
                    />
            }

            <ExamGroupDialog courseId={classId}
                             isOpenDialog={isOpenDialog}
                             setIsOpenDialog={setIsOpenDialog}
                             isDeleting={isDeleting}
                             setIsDeleting={setIsDeleting}
                             examGroup={examGroupDetail}
                             onMounted={onMounted}/>

        </>
    )

}