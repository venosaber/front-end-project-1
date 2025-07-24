import {useParams, useSearchParams, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import type {SyntheticEvent, ReactNode} from "react";
import {Box, Typography, Tab, Tabs} from "@mui/material";
import {Loading, RemarkingDetail} from "..";
import type {ExamGroup, Exam, ExamResult} from "../../utils/types";
import {getValidAccessToken} from "../../router/auth.ts";
import {getMethod} from "../../utils/api.ts";
import {toast} from "react-toastify";

export default function TeacherMarking() {
    const navigate = useNavigate();
    const {id, examGroupId} = useParams();
    const [searchParams] = useSearchParams();
    const studentId: string | null = searchParams.get('student');
    const [isLoading, setIsLoading] = useState(true);

    const handleBackToExamGroup = () => {
        navigate(`/class/${id}/exam/${examGroupId}`);
    }

    const [examGroup, setExamGroup] = useState<ExamGroup | null>(null);
    const [exams, setExams] = useState<Exam[]>([]);
    const [examResults, setExamResults] = useState<ExamResult[]>([]);

    const matchExam = (examResult: ExamResult) => {
        return exams.find(exam => exam.id === examResult.exam);
    }

    const fetchResultData = async () => {
        const accessToken: string | null = await getValidAccessToken();
        if (!accessToken) {
            console.error("No valid access token, redirecting to login page");
            navigate('/login');
            return;
        }

        try {
            // only exam results data need to fetch (reload)
            const examResultsData = await getMethod(`/exam_result?student=${studentId}&exam_group=${examGroupId}`, {headers: {Authorization: `Bearer ${accessToken}`}});
            if (examResultsData) {
                setExamResults(examResultsData.sort((a: ExamResult, b: ExamResult) => a.exam - b.exam));
            }
        } catch (e) {
            console.error('Error on re-loading exam results: ', e);
            toast.error('Không thể làm mới dữ liệu!')
        }
    }

    useEffect(() => {
        const onInitialMount = async () => {
            setIsLoading(true);
            const accessToken: string | null = await getValidAccessToken();
            if (!accessToken) {
                console.error("No valid access token, redirecting to login page");
                navigate('/login');
            }

            try {
                const [examResultsData, examsData, examGroupData] = await Promise.all([
                    getMethod(`/exam_result?student=${studentId}&exam_group=${examGroupId}`, {headers: {Authorization: `Bearer ${accessToken}`}}),
                    getMethod(`/exam?exam_group=${examGroupId}`, {headers: {Authorization: `Bearer ${accessToken}`}}),
                    getMethod(`/exam_group/${examGroupId}`, {headers: {Authorization: `Bearer ${accessToken}`}})
                ]);

                // sort by exam id
                if (examResultsData) setExamResults(examResultsData.sort((a: ExamResult, b: ExamResult) => a.exam - b.exam));
                if (examsData) setExams(examsData.sort((a: Exam, b: Exam) => a.id! - b.id!));

                if (examGroupData) setExamGroup(examGroupData);
            } catch (e) {
                console.error('Error on loading data: ', e);
                toast.error('Có lỗi khi tải dữ liệu!')
            } finally{
                setIsLoading(false);
            }
        }

        onInitialMount();
    }, []);

    if (isLoading) return <Loading/>

    return (
        <>
            <Box sx={{display: 'flex', marginBottom: 3}}>
                <Typography variant="h6" fontWeight="bold"
                            sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                                mr: 2
                            }}
                            onClick={handleBackToExamGroup}
                >
                    {examGroup?.name ?? ''}
                </Typography>
                <Typography variant="h6" fontWeight="bold">{`>`} Chấm bài</Typography>
            </Box>

            <Box sx={{backgroundColor: "#ffffff"}}>
                <BasicTabs examResults={examResults} matchExam={matchExam} onSaveSuccess={fetchResultData} />
            </Box>
        </>
    )
}

interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{p: 3}}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

interface BasicTabsProps {
    examResults: ExamResult[];
    matchExam: (examResult: ExamResult) => Exam | undefined;
    onSaveSuccess: () => Promise<void>;
}

function BasicTabs({examResults, matchExam, onSaveSuccess}: BasicTabsProps) {
    const [value, setValue] = useState(0);

    const handleChange = (_event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{width: '100%'}}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={value} onChange={handleChange} aria-label="exam results"
                      variant="scrollable"
                >
                    {
                        examResults.map((examResult: ExamResult, index: number) => {
                            return (
                                <Tab key={examResult.id} label={`Đề ${index + 1}`} {...a11yProps(index)} />
                            )
                        })
                    }
                </Tabs>
            </Box>

            {
                examResults.map((examResult: ExamResult, index: number) => {
                    const matchedExam: Exam = matchExam(examResult)!;
                    return (
                        <CustomTabPanel key={examResult.id} index={index} value={value}>
                            <RemarkingDetail examResult={examResult} exam={matchedExam} onSaveSuccess={onSaveSuccess} />
                        </CustomTabPanel>
                    )
                })
            }
        </Box>
    );
}

