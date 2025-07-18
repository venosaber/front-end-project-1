import {Box, Button, Grid, Typography} from "@mui/material";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useReducer, useState} from "react";
import type {ChangeEvent} from "react";
import type {ExamGroup} from "../../utils/types";
import {getValidAccessToken} from "../../router/auth.ts";
import {getMethod} from "../../utils/api.ts";
import {initState, reducer} from "./teacherReducer.ts";
import {TeacherAnswers} from '..'

export default function TeacherExamDetail() {
    const [state, dispatch] = useReducer(reducer, initState);

    const navigate = useNavigate();
    const {id, examGroupId, examId} = useParams();
    let examGroupIdNum = 0;
    let examIdNum = 0;
    if (examGroupId !== undefined && examId !== undefined) {
        examGroupIdNum = Number(examGroupId);
        examIdNum = Number(examId);
    }

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

        const uploadFile = {
            id: null,
            url: URL.createObjectURL(file),
            payload: String(response)
        }
        console.log('send file: ', uploadFile);
        dispatch({type: 'UPLOAD_FILE', payload: uploadFile});
    }

    const [examGroup, setExamGroup] = useState<ExamGroup | null>(null);

    const onMounted = async () => {
        const accessToken: string | null = await getValidAccessToken();
        if (!accessToken) {
            console.error("No valid access token, redirecting to login page");
            navigate('/login');
            return;
        }

        // examId already exists => edit mode
        if(examIdNum !== 0) {
            const examData = await getMethod(`/exam/${examId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if(examData.exam_group_id !== examGroupIdNum) {
                console.error("Invalid exam id");
                // handleBackToExamGroupDetail();
            }
            dispatch({type: 'LOAD_INITIAL_DATA', payload: examData})
        }

        const examGroupData = await getMethod(`/exam_group/${examGroupId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        setExamGroup(examGroupData);
    }
    useEffect(() => {
        onMounted();
    }, []);

    return (
        <>
            <Box sx={{
                height: 'calc(100vh - 112px)',
                display: "flex",
                flexDirection: "column"
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

                    <Typography variant="h6" fontWeight="bold">
                        {examIdNum ? state.name : 'Thêm đề bài' }
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
                            {
                                state?.file?.url ? (
                                    <Box sx={{
                                        width: '100%',
                                        height: '100%'
                                    }}>
                                        <iframe
                                            src={state.file.url}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                                display: 'block'
                                            }}
                                        />
                                    </Box>
                                ) : (
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

                        <Grid size={{xs: 12, lg: 6}} sx={{
                            height: '100%',
                            border: 'none',
                            overflowY: 'auto',
                            backgroundColor: "#ffffff",

                        }}>
                            <TeacherAnswers
                                handleBackToExamGroupDetail={handleBackToExamGroupDetail}
                                examGroupIdNum={examGroupIdNum} examIdNum={examIdNum}
                                state={state} dispatch={dispatch}/>
                        </Grid>
                    </Grid>
                </Box>


            </Box>


        </>
    )
}