import {Box, Typography, Button, Grid} from '@mui/material';
import {Add as AddIcon} from '@mui/icons-material';
import {useNavigate, useParams} from 'react-router-dom';
import {useEffect, useState} from 'react';
import type {ExamGroup, Exam} from '../../utils/types';
import {getValidAccessToken} from "../../router/auth.ts";
import {getMethod} from "../../utils/api.ts";

export default function ExamDetail() {
    const navigate = useNavigate();
    const {id, examGroupId} = useParams();

    const handleBackToExams = () => {
        navigate(`/class/${id}/exam`);
    };

    const [examGroupDetail, setExamGroupDetail] = useState<ExamGroup | null>(null);
    const [exams, setExams] = useState<Exam[]>([]);
    useEffect(() => {
        const onMounted = async () => {
            const accessToken: string | null = await getValidAccessToken();
            if (!accessToken) {
                console.error("No valid access token, redirecting to login page");
                navigate('/login');
                return;
            }

            const [examGroupData, exams] = await Promise.all([
                getMethod(`/exam_group/${examGroupId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }),
                getMethod(`/exam/?exam_group=${examGroupId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                })
            ]);
            setExamGroupDetail(examGroupData);
            setExams(exams);
        }
        onMounted();
    }, []);

    let examName: string = '';
    let awaitTime: number = 0;
    let startTime: string = '';
    if (examGroupDetail) {
        examName = examGroupDetail.name;
        awaitTime = examGroupDetail.await_time / 60;
        startTime = examGroupDetail.start_time;
    }

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
                            onClick={handleBackToExams}
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
                    >Chỉnh sửa</Button>
                    <Button variant={'outlined'} color={'error'}
                            sx={{fontWeight: 600}}
                    >Xóa bỏ</Button>
                </Box>
            </Box>

            {/* List of exams  */}
            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography variant={"h6"} fontWeight={600} color={'primary'}>Danh sách đề bài</Typography>
                <Button variant={'contained'}
                        sx={{fontWeight: 600, fontSize: 16}}>
                    <AddIcon/>Thêm đề bài
                </Button>
            </Box>

            {
                (exams.length === 0) ? (
                        <Typography fontWeight={500} sx={{fontSize: 18, mb: 2}}>
                            Chưa có đề bài nào được tải lên
                        </Typography>
                    )
                    : <ExamsGrid exams={exams} />
            }

            {/* List of exam results */
            }
            <Typography variant={"h6"} fontWeight={600} color={'primary'}>Danh sách bài làm</Typography>
        </>
    )

}

function ExamsGrid({exams}: { exams: Exam[] }) {
    return (
        <Grid container spacing={2}>
            {
                exams.map((exam: Exam)=> (
                    <Grid size={{xs: 12, sm: 6, md: 4}}>
                        <Box sx={{border: '1px dotted #0000ff', borderRadius: '8px', p: 1, backgroundColor: '#ffffff'}}>
                            <Typography>Đề bài: {exam.name}</Typography>
                            <Typography>Mã đề: {exam.code}</Typography>
                            <Typography>Thời gian làm bài: {exam.total_time/60} phút</Typography>
                            <Typography>Số câu hỏi: {exam.number_of_question}</Typography>
                        </Box>
                    </Grid>
                ))
            }

        </Grid>
    )
}