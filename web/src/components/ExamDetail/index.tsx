import {Box, Button, Grid, Typography} from "@mui/material";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {ChangeEvent} from "react";
import type {Exam, ExamGroup} from "../../utils/types";
import {getValidAccessToken} from "../../router/auth.ts";
import {getMethod} from "../../utils/api.ts";

export default function ExamDetail() {
    const [examFormData, setExamFormData] = useState<Exam>({
        name: "",
        code: "",
        exam_group: 0,
        number_of_question: 1,
        total_time: 0,
        correct_answer: {},
        questions: [],
        description: "default",
        file: null
    });

    const navigate = useNavigate();
    const {id, examGroupId, examId} = useParams();

    const handleBackToExamGroups = () => {
        navigate(`/class/${id}/exam`);
    };

    const handleBackToExamGroupDetail = () => {
        navigate(`/class/${id}/exam/${examGroupId}`);
    }

    const fileToBase64 = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error('Cannot read file to base64 string.'));
                }
            }
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file: File | null = e.target.files?.[0] ?? null;
        if (!file) return;
        if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
            alert('Vui lòng chọn file PDF hoặc hình ảnh');
            return;
        }

        const response = await fileToBase64(file);
        if (!response) return;

        setExamFormData({
            ...examFormData,
            file: {
                id: null,
                url: URL.createObjectURL(file),
                payload: String(response)
            }
        })
    }

    const [examGroup, setExamGroup] = useState<ExamGroup | null>(null);
    const [exam, setExam] = useState<Exam | null>(null);

    const onMounted = async () => {
        const accessToken: string | null = await getValidAccessToken();
        if (!accessToken) {
            console.error("No valid access token, redirecting to login page");
            navigate('/login');
            return;
        }

        const [examGroupData, examData] = await Promise.all([
            getMethod(`/exam_group/${examGroupId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }),
            getMethod(`/exam/${examId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
        ]);
        setExamGroup(examGroupData);
        setExam(examData);
    }
    useEffect(() => {
        onMounted();
    }, []);

    return (
        <>
            <Box sx={{
                height: 'calc(100vh - 112px)',
                backgroundColor: "yellow",

                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}>
                <Box sx={{display: 'flex', mb: 2, flexShrink: 0}}>
                    <Typography variant="h6" fontWeight="bold"
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                    mr: 2
                                }}
                                onClick={handleBackToExamGroups}
                    >
                        Danh sách bài thi
                    </Typography>

                    <Typography variant="h6" fontWeight="bold"
                                sx={{mr: 2}}>{`>`}</Typography>

                    <Typography variant="h6" fontWeight="bold"
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        textDecoration: 'underline',
                                    },
                                    mr: 2
                                }}
                                onClick={handleBackToExamGroupDetail}
                    >{examGroup?.name ?? ''}</Typography>

                    <Typography variant="h6" fontWeight="bold"
                                sx={{mr: 2}}>{`>`}</Typography>

                    <Typography variant="h6" fontWeight="bold">Thêm đề bài</Typography>
                </Box>

                <Box sx={{
                    flexGrow: 1,
                    minHeight: 0,
                    backgroundColor: "red",
                    overflow: "hidden"
                }}>
                    <Grid container spacing={2} sx={{height: "100%"}}>
                        <Grid size={{xs: 12, lg: 6}} sx={{
                            height: '100%',
                            border: '1px dashed #cccccc',

                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {
                                examFormData?.file?.url ? (
                                    <Box sx={{
                                        width: '100%',
                                        height: '100%',
                                        overflow: 'hidden' // ensure the scroll handled by iframe
                                    }}>
                                        <iframe
                                            src={examFormData.file.url}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                                display: 'block'
                                            }}
                                        />
                                    </Box>
                                ): (
                                    <>
                                        <input
                                            id="exam-upload"
                                            type="file"
                                            accept="application/pdf,image/*"
                                            style={{display: 'none'}}
                                            onChange={handleFileUpload}
                                        />
                                        <label htmlFor="exam-upload">
                                            <Button variant="contained" component="span" sx={{mt: 1}}>
                                                Tải lên từ máy
                                            </Button>
                                        </label>
                                    </>
                                )
                            }
                        </Grid>
                    </Grid>
                </Box>


            </Box>


        </>
    )
}