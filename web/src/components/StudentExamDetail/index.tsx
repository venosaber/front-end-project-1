import {useReducer, useEffect, useState} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {getUserInfo, getValidAccessToken} from "../../router/auth.ts";
import {getMethod, postMethod} from "../../utils/api.ts";
import {Box, Button, Container, Typography, Grid} from "@mui/material";
import {LogoElement} from "..";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {initState, reducer} from "./studentReducer.ts";
import {StudentAnswers, StudentExamDialog} from '..'
import type {Question, Answer} from "../../utils/types";
import {isMobile, isTablet, isDesktop} from "react-device-detect";
import {useExamFlow} from '../../contexts/ExamFlowProvider';
import {toast} from "react-toastify";
import {API_URL} from "../../plugins/api.ts";

export default function StudentExamDetail() {
    const [state, dispatch] = useReducer(reducer, initState);
    const [userId, setUserId] = useState<number>(0);
    const [isDataReady, setIsDataReady] = useState(false);

    const navigate = useNavigate();
    const {id, examGroupId} = useParams();
    const [searchParams] = useSearchParams();
    const examId: string | null = searchParams.get('lesson');

    const handleBackToExamGroupDetail = () => {
        navigate(`/class/${id}/exam/${examGroupId}`);
    }

    const getDeviceType = () => {
        if (isMobile) {
            return 'mobile';
        }
        if (isTablet) {
            return 'tablet';
        }
        if (isDesktop) {
            return 'desktop';
        }
        return 'unknown';
    }

    // get functions from context
    const {startUnlockTimer, initializeExamData} = useExamFlow();

    // load examGroupDetail to context
    useEffect(() => {
        if (examGroupId) {
            initializeExamData(examGroupId);
        }
    }, [examGroupId, initializeExamData]);

    const [isOpenDialog, setIsOpenDialog] = useState(false);

    const onSubmit = async () => {
        const accessToken: string | null = await getValidAccessToken();
        if (!accessToken) {
            toast.error("Có lỗi xảy ra: Phiên đăng nhập không hợp lệ!");
            navigate('/login');
            return;
        }

        const payload = {
            exam: Number(examId),
            user: userId,
            status: 'completed',
            questions: state.questions.map((question: Answer) => (
                {
                    question: question.questionId,
                    answer: question.answer
                }
            )),
            device: state.device
        }

        const response = await postMethod('/exam_result', payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        if (!response) {
            toast.error('Nộp bài không thành công!');
        } else {
            toast.success('Nộp bài thành công');
            // clear localStorage
            localStorage.removeItem(`lesson-${examId}-${userId}-answers`);
            localStorage.removeItem(`lesson-${examId}-${userId}-time`);

            // start counting down to unlock the next exam (if any)
            startUnlockTimer(Number(examId));
        }
    }

    const handleSubmitEarly = () => {
        setIsOpenDialog(true);
    }

    useEffect(() => {
        const onMounted = async () => {
            const accessToken: string | null = await getValidAccessToken();
            if (!accessToken) {
                console.error("No valid access token, redirecting to login page");
                navigate('/login');
                return;
            }

            const {id: userId} = getUserInfo(accessToken);
            setUserId(userId);

            const examData = await getMethod(`/exam/${examId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            // the answers and time-left are saved by useEffect to localStorge
            // try to load data from localStorage first, otherwise load initial data from API
            const savedQuestions = localStorage.getItem(`lesson-${examId}-${userId}-answers`);
            const savedTimeLeft = localStorage.getItem(`lesson-${examId}-${userId}-time`);

            const questions = savedQuestions ?
                JSON.parse(savedQuestions) :
                examData.questions.map((question: Question) => (
                    {
                        questionId: question.id,
                        questionIndex: question.index,
                        questionType: question.type,
                        answer: ''
                    }));

            const timeLeft = savedTimeLeft ?
                Number(savedTimeLeft) :
                examData.total_time;

            const payload = {
                examName: examData.name,
                examCode: examData.code,
                examFile: examData.file,
                questions: questions,
                timeLeft: timeLeft,
                device: getDeviceType()
            }

            dispatch({type: 'LOAD_INITIAL_DATA', payload: payload});
            setIsDataReady(true);
        }
        onMounted();
    }, []);

    useEffect(() => {
        // timeout
        if (state.timeLeft <= 0 && isDataReady) {
            setIsOpenDialog(true);
            // automatically submit answers
            onSubmit();
        } else {
            // countdown to 0
            const interval = setInterval(() => {
                dispatch({type: 'COUNTDOWN'})
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [state.timeLeft, isDataReady]);

    useEffect(() => {
        if (userId && examId && isDataReady) {
            // save answers to localStorage each time there is a change
            localStorage.setItem(
                `lesson-${examId}-${userId}-answers`,
                JSON.stringify(state.questions)
            );

            // save remaining time to localStorage every second
            localStorage.setItem(
                `lesson-${examId}-${userId}-time`,
                state.timeLeft.toString()
            );
        }
    }, [state.questions, state.timeLeft, userId, examId, isDataReady]);

    return (
        <>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                p: 2

            }}>
                <LogoElement width={40} height={30} fontSize={32} mb={0}/>
                <Box sx={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    {
                        state.timeLeft > 0
                            ? (
                                <>
                                    <AccessTimeIcon/>
                                    <Typography variant={'h5'} sx={{fontWeight: 600, color: '#333333'}}>
                                        {formatTime(state.timeLeft)}
                                    </Typography>
                                </>)
                            : (
                                <Typography variant={'h5'} color={'error'} sx={{fontWeight: 600}}>
                                    {'Hết giờ!'}
                                </Typography>
                            )
                    }

                </Box>
                <Button variant={'contained'}
                        onClick={handleSubmitEarly}>
                    Nộp bài sớm
                </Button>
            </Box>

            <Container maxWidth={false}
                       sx={{
                           mt: '0px', backgroundColor: '#f0f2f5',
                           minHeight: 'calc(100vh - 80px)', p: 3,
                           display: 'flex',
                           flexDirection: 'column'
                       }}>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                    flexShrink: 0
                }}>
                    <Typography variant={'h6'} fontWeight={600} color={'#333333'}>
                        Làm bài thi {'>'} {state.examName}
                    </Typography>

                    <Typography variant={'h6'} fontWeight={600} color={'#333333'}>
                        Mã đề: {state.examCode}
                    </Typography>
                </Box>

                <Box sx={{
                    flexGrow: 1,
                    minHeight: 0,
                }}>
                    <Grid container spacing={2} sx={{height: "100%"}}>
                        <Grid size={{xs: 12, lg: 6}} sx={{
                            height: '100%',
                            border: '1px dashed #cccccc',
                            backgroundColor: "#ffffff",

                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Box sx={{
                                width: '100%',
                                height: '100%'
                            }}>
                                <iframe
                                    src={`${API_URL}/${state.examFile.url}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        display: 'block'
                                    }}
                                />
                            </Box>
                        </Grid>

                        <Grid size={{xs: 12, lg: 6}} sx={{
                            height: '100%',
                            border: 'none',
                            overflowY: 'auto',
                            backgroundColor: "#ffffff",
                            p: 1
                        }}>
                            <StudentAnswers
                                state={state} dispatch={dispatch}/>
                        </Grid>

                    </Grid>
                </Box>

            </Container>

            <StudentExamDialog timeLeft={state.timeLeft}
                               isOpenDialog={isOpenDialog}
                               setIsOpenDialog={setIsOpenDialog}
                               onSubmit={onSubmit}
                               handleBackToExamGroupDetail={handleBackToExamGroupDetail}/>

        </>
    )
}

function formatTime(seconds: number) {
    const hours: number = Math.floor(seconds / 3600);
    const minutes: number = Math.floor((seconds % 3600) / 60);
    const secondsLeft: number = seconds % 60;
    let hoursString: string = hours < 10 ? '0' + hours : hours.toString();
    let minutesString: string = minutes < 10 ? '0' + minutes : minutes.toString();
    let secondsString: string = secondsLeft < 10 ? '0' + secondsLeft : secondsLeft.toString();
    return `${hoursString}:${minutesString}:${secondsString}`;
}
