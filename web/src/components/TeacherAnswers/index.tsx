import type {FormEvent, Dispatch} from 'react'
import type {ChangeEvent} from "react";
import type {Question, Exam} from '../../utils/types';

import {
    Grid,
    Box,
    TextField,
    Radio,
    Checkbox,
    Select,
    type SelectChangeEvent,
    MenuItem,
    Typography, Button
} from '@mui/material';
import {toast} from 'react-toastify';
import {getValidAccessToken} from "../../router/auth.ts";
import {postMethod, putMethod} from "../../utils/api.ts";

interface TeacherAnswersProps {
    handleBackToExamGroupDetail: () => void,
    examGroupIdNum: number,
    examIdNum: number,
    state: Exam,
    dispatch: Dispatch<any>
}

export default function TeacherAnswers({
                                           handleBackToExamGroupDetail,
                                           examGroupIdNum,
                                           examIdNum,
                                           state,
                                           dispatch
                                       }: TeacherAnswersProps) {
    const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch({type: 'SET_NAME', payload: e.target.value});
    };

    const onCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch({type: 'SET_CODE', payload: e.target.value});
    };

    const onTotalTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch({type: 'SET_TOTAL_TIME', payload: e.target.value});
    };

    const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const amount: number = Number(e.target.value);
        dispatch({type: 'SET_AMOUNT', payload: amount});
    }

    const checkValid = () => {
        if (!state.name || !state.code) {
            toast.error('Hãy điền đầy đủ các trường thông tin!');
            return false;
        }
        if (state.total_time <= 0 || isNaN(state.total_time)) {
            toast.error('Thời gian thi phải là số dương!');
            return false;
        }
        if (!state.file?.url) {
            console.log(state)
            toast.error('Chưa upload đề thi!');
            return false;
        }

        const unCheckedQtn: number = state.questions.findIndex(question => !question.correct_answer && question.type !== 'long-response');
        if (unCheckedQtn !== -1) {
            toast.error(`Câu số ${unCheckedQtn + 1} chưa chọn đáp án!`);
            return false;
        }
        return true;
    }

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!checkValid()) return;
        const payload = {
            name: state.name,
            code: state.code,
            exam_group: examGroupIdNum,
            number_of_question: state.number_of_question,
            total_time: state.total_time * 60,  // convert to seconds
            correct_answer: state.correct_answer,
            questions: state.questions,
            description: state.description,
            file: state.file,
            deleted_questions: state.deleted_questions
        }

        console.log(payload);
        const accessToken: string | null = await getValidAccessToken();

        // create mode
        if (examIdNum === 0) {
            const response = await postMethod('/exam', payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (!response) {
                toast.error('Tạo đề thi thất bại, hãy thử lại!');
                return;
            } else {
                toast.success('Tạo đề thi thành công!');
                handleBackToExamGroupDetail();
            }
        }
        // update mode
        if(examIdNum){
            const response = await putMethod(`/exam/${examIdNum}`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            if(!response){
                toast.error('Chỉnh sửa đề thi thất bại, hãy thử lại!')
                return;
            } else {
                toast.success('Chỉnh sửa đề thi thành công!');
                handleBackToExamGroupDetail();
            }
        }

    }


    return (
        <>
            <Box
                component='form'
                sx={{'& > :not(style)': {m: 1}}}
                noValidate
                autoComplete="off"
                onSubmit={onSubmit}
            >

                <Grid container spacing={2} sx={{p: 2}}>
                    <Grid size={{xs: 12, lg: 6}}>
                        <label htmlFor={'exam-name'}>
                            Tên đề
                            <span style={{color: "#ff0000", marginLeft: 5}}>*</span>
                        </label>
                        <TextField fullWidth size={'small'}
                                   id={'exam-name'}
                                   name={'name'}
                                   value={state.name}
                                   onChange={onNameChange}
                        />
                    </Grid>

                    <Grid size={{xs: 12, lg: 6}}>
                        <label htmlFor={'exam-code'}>
                            Mã đề
                            <span style={{color: "#ff0000", marginLeft: 5}}>*</span>
                        </label>
                        <TextField fullWidth size={'small'}
                                   id={'exam-code'}
                                   name={'code'}
                                   value={state.code}
                                   onChange={onCodeChange}
                        />
                    </Grid>

                    <Grid size={{xs: 12, lg: 6}}>
                        <label htmlFor={'exam-total_time'}>
                            Thời gian làm bài (phút)
                            <span style={{color: "#ff0000", marginLeft: 5}}>*</span>
                        </label>
                        <TextField fullWidth size={'small'}
                                   id={'exam-total_time'}
                                   name={'total_time'}
                                   value={state.total_time}
                                   onChange={onTotalTimeChange}
                        />
                    </Grid>

                    <Grid size={{xs: 12, lg: 6}}>
                        <label htmlFor={'exam-number_of_question'}>
                            Số câu
                            <span style={{color: "#ff0000", marginLeft: 5}}>*</span>
                        </label>
                        <TextField fullWidth size={'small'}
                                   id={'exam-number_of_question'}
                                   name={'number_of_question'}
                                   value={state.number_of_question}
                                   onChange={onAmountChange}
                        />
                    </Grid>


                </Grid>

                <Box>
                    {
                        state.questions.map((question: Question) =>
                            (
                                QuestionUnit(question)
                            ))
                    }
                </Box>

                <Box sx={{textAlign: 'center'}}>
                    <Button
                        variant="contained"
                        size="large"
                        type="submit"
                        sx={{fontWeight: 600, mt: 2}}
                    >
                        {examIdNum?'Chỉnh sửa đề bài':'Tạo đề bài'}
                    </Button>
                </Box>
            </Box>
        </>
    )


    function QuestionElement(question: Question) {
        const onChangeAnswer = (e: ChangeEvent<HTMLInputElement>) => {
            const payload = {
                targetedAnswer: e.target.value,
                index: question.index
            }

            if (question.type === 'single-choice') {
                dispatch({type: 'SINGLE_CHANGE_CORRECT_ANSWER', payload: payload});
            }
            if (question.type === 'multiple-choice') {
                if (e.target.checked) {
                    dispatch({type: 'MULTIPLE_CHECK_OPTION', payload: payload})
                } else {
                    dispatch({type: 'MULTIPLE_UNCHECK_OPTION', payload: payload})
                }
            }
        }

        const options: string[] = ["A", "B", "C", "D"];

        switch (question.type) {
            case 'single-choice':
                return options.map((option: string, index: number) => {
                    return (
                        <Box key={index}>
                            <Radio name={`question-${question.index}`}
                                   onChange={onChangeAnswer}
                                   checked={question.correct_answer === option}
                                   id={`question-${question.index}-${option}`} value={option}/>
                            <label htmlFor={`question-${question.index}-${option}`}>{option}</label>
                        </Box>
                    )
                });

            case 'multiple-choice':
                return options.map((option: string, index: number) => {
                    return (
                        <Box key={index}>
                            <Checkbox name={`question-${question.index}`}
                                      onChange={onChangeAnswer}
                                      checked={question.correct_answer.includes(option)}
                                      id={`question-${question.index}-${option}`} value={option}/>
                            <label htmlFor={`question-${question.index}-${option}`}>{option}</label>
                        </Box>
                    )
                });

            case 'long-response':
                return <TextField size={'small'}
                                  value={'Học sinh tự điền'}
                                  disabled/>;

            default:
                return <></>
        }
    }

    function QuestionUnit(question: Question) {
        const onChangeType = (e: SelectChangeEvent) => {
            const questionType: string = e.target.value;
            const payload = {
                questionType: questionType,
                index: question.index
            }
            dispatch({type: 'CHANGE_QUESTION_TYPE', payload: payload});

        };

        return (
            <Box key={question.index} sx={{m: "10px 0 10px 10px "}}>
                <Grid container spacing={2} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <Grid size={{xs:1.5, lg:2}}>
                        <Typography sx={{fontSize: 20}}>Câu {question.index + 1}:</Typography>
                    </Grid>

                    <Grid size={{xs:4, lg:4}}>
                        <Select fullWidth
                                size={'small'}
                                name={'questionType'}
                                onChange={onChangeType}
                                defaultValue={question.type}
                        >
                            <MenuItem value={'single-choice'}>Chọn một đáp án</MenuItem>
                            <MenuItem value={'multiple-choice'}>Chọn nhiều đáp án</MenuItem>
                            <MenuItem value={'long-response'}>Điền vào chỗ trống</MenuItem>
                        </Select>
                    </Grid>

                    <Grid size={{xs:6.5, lg:6}} sx={{display: 'flex'}}>
                        {
                            QuestionElement(question)
                        }
                    </Grid>

                </Grid>
            </Box>
        )
    }

}

