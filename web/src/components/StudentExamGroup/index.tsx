import {Box, Typography, Grid} from '@mui/material';
import {useNavigate, useParams, Link} from 'react-router-dom';
import {useState, useEffect} from 'react';
import type {ExamGroup, Exam, ExamWithStatus, ExamResult} from '../../utils/types';
import {getUserInfo, getValidAccessToken} from "../../router/auth.ts";
import {Loading} from '..'
import {getMethod} from "../../utils/api.ts";

export default function StudentExamGroup() {
    const navigate = useNavigate();
    const {id, examGroupId} = useParams();
    const handleBackToExamGroupsList = () => {
        navigate(`/class/${id}/exam`);
    };

    const [isLoading, setIsLoading] = useState(true);
    const [examGroupDetail, setExamGroupDetail] = useState<ExamGroup | undefined>(undefined);
    const [examsWithStatus, setExamsWithStatus] = useState<ExamWithStatus[]>([]);
    const [isWaitingForUnlock, setIsWaitingForUnlock] = useState(false);
    const [unlockingIndex, setUnlockingIndex] = useState<number | null>(null);
    const [awaitingTime, setAwaitingTime] = useState(-1);

    const unlockNextExam = () => {
        // try to find an unlocked exam first
        const findUnlockedExam = examsWithStatus.find(exam => exam.status === 'unlocked');
        if (findUnlockedExam) return;

        const firstAvailableExamIdx = examsWithStatus.findIndex(exam => exam.status === 'locked');
        if (firstAvailableExamIdx !== -1) {
            const newExamsWithStatus = [...examsWithStatus];
            if (isWaitingForUnlock) {
                newExamsWithStatus[firstAvailableExamIdx].status = 'unlocking';
                setUnlockingIndex(firstAvailableExamIdx);
            } else {
                newExamsWithStatus[firstAvailableExamIdx].status = 'unlocked'
            }

            setExamsWithStatus(newExamsWithStatus);
        }
    }

    // countdown
    useEffect(()=>{
        if (isWaitingForUnlock && unlockingIndex !== null) {
            const interval = setInterval(() => {
                setAwaitingTime(prev => {
                    if(prev === 1){
                        clearInterval(interval);
                    }
                    return prev - 1;
                })
            }, 1000);
            return () => clearInterval(interval);
    }}, [isWaitingForUnlock, unlockingIndex]);

    // set the status of exam from 'unlocking' to 'unlocked'
    useEffect(()=>{
        if (awaitingTime === 0 && unlockingIndex !== null) {
            const newExams = [...examsWithStatus];
            newExams[unlockingIndex].status = 'unlocked';

            setExamsWithStatus(newExams);
            setIsWaitingForUnlock(false);
            setUnlockingIndex(null);
            if(examGroupDetail){
                setAwaitingTime(examGroupDetail.await_time);
            }
        }
    },[awaitingTime, unlockingIndex]);

    // check to unlock
    useEffect(()=>{
        const hasUnlockedExam = examsWithStatus.some(exam => exam.status === 'unlocked');
        const hasUnlockingExam = examsWithStatus.some(exam => exam.status === 'unlocking');

        if(!hasUnlockedExam && !hasUnlockingExam && !isWaitingForUnlock){
            unlockNextExam();
        }
    }, [examsWithStatus, isWaitingForUnlock]);


    let examName: string = '';
    let awaitTime: number = 0;
    if (examGroupDetail) {
        examName = examGroupDetail.name;
        awaitTime = examGroupDetail.await_time / 60;
    }

    const onMounted = async () => {
        const accessToken: string | null = await getValidAccessToken();
        if (!accessToken) {
            console.error("No valid access token, redirecting to login page");
            navigate('/login');
            return;
        }

        const {id: userId} = getUserInfo(accessToken);

        const [examGroupData, exams, examResults] = await Promise.all([
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
            getMethod(`/exam_result/?student=${userId}&exam_group=${examGroupId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
        ]);
        setExamGroupDetail(examGroupData);
        setAwaitingTime(examGroupData.await_time);

        const addStatusToExams = (exams: Exam[], examResults: ExamResult[]): ExamWithStatus[] => {
            const completedIds: number[] = examResults.map(examResult => examResult.exam);
            return exams.map(exam => {
                return completedIds.includes(exam.id) ? {...exam, status: 'completed'} : {...exam, status: 'locked'}
            })
        }
        const examsWithStatus = addStatusToExams(exams, examResults);
        setExamsWithStatus(examsWithStatus);
        setIsLoading(false);
    }

    useEffect(() => {
        onMounted();
    }, [])

    const numberOfCompletedExams = examsWithStatus.filter(exam => exam.status === 'completed').length;

    if (isLoading) return <Loading/>;

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
                mb: 3, p: 2, backgroundColor: '#ffffff',
                borderRadius: '8px', border: '1px solid #0000ff'
            }}>
                {/* Info */}

                <Typography variant={"h6"} fontWeight={500}>Tên bài thi: {examName}</Typography>
                <Typography variant={"h6"} fontWeight={500}>Thời gian chờ giữa các đề
                    bài: {awaitTime} phút</Typography>
                <Typography variant={"h6"} fontWeight={500}>
                    Trạng thái hoàn thành: {numberOfCompletedExams}/{examsWithStatus.length}
                </Typography>

            </Box>

            {/* List of exams  */}
            <Box>
                <Typography variant={"h6"} fontWeight={600} color={'primary'}>Danh sách đề bài</Typography>
            </Box>

            {
                (!examsWithStatus || examsWithStatus.length === 0)
                    ? (
                        <Typography fontWeight={500} sx={{fontSize: 18, mb: 2}}>
                            Chưa có đề bài nào được tải lên
                        </Typography>
                    )
                    : <ExamsGrid exams={examsWithStatus} classId={id!} examGroupId={examGroupId!}/>
            }

        </>
    )

}

function ExamsGrid({exams, classId, examGroupId}: { exams: ExamWithStatus[], classId: string, examGroupId: string }) {
    return (
        <Grid container spacing={2} sx={{my: 3}}>
            {
                exams.map((exam: ExamWithStatus) => (
                    <Grid key={exam.id} size={{xs: 12, md: 6}}>
                        {
                            exam.status === 'unlocked' ? (
                                <Link to={`/class/${classId}/exam/${examGroupId}/doing?lesson=${exam.id}`}
                                      style={{textDecoration: 'none', color: "#000000", backgroundColor: '#ffffff'}}
                                >
                                    <ExamBox exam={exam}/>
                                </Link>
                            ) : (
                                <Box sx={{backgroundColor: '#e0ecf6', cursor: 'not-allowed'}}>
                                    <ExamBox exam={exam}/>
                                </Box>
                            )
                        }

                    </Grid>
                ))
            }

        </Grid>
    )
}

function ExamBox({exam}: { exam: ExamWithStatus }) {
    return (
        <Box sx={{
            border: '1px dotted #0000ff',
            borderRadius: '8px',
            p: 1,

        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '5px',
                mb: '16px'
            }}>
                <Typography sx={{
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 'calc(100% - 50px)' // limit width
                }}>
                    Đề bài: {exam.name}
                </Typography>

               <ExamStatusLabel exam={exam}/>
        </Box>

    <Typography>Mã đề: {exam.code}</Typography>
    <Typography>Thời gian làm bài: {exam.total_time / 60} phút</Typography>
</Box>
)
}

function ExamStatusLabel({exam}: { exam: ExamWithStatus }){
    switch(exam.status) {
        case 'completed':
            return <Typography color={'primary'} sx={{fontWeight: 600}}>Đã hoàn thành</Typography>
        case 'locked':
            return <Typography color={'error'} sx={{fontWeight: 600}}>Chưa mở</Typography>
        case 'unlocking':
            return <Typography color={'success'} sx={{fontWeight: 600}}>Đang mở</Typography>
        case 'unlocked':
            return <Typography color={'success'} sx={{fontWeight: 600}}>Đang mở</Typography>
        default: return <></>
    }
}