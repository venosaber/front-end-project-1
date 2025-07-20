import type {Dispatch} from 'react'
import type {ChangeEvent} from "react";
import type {ExamDoing, Answer, Action} from '../../utils/types';

import {
    Grid,
    Box,
    TextField,
    Radio,
    Checkbox,
    Typography
} from '@mui/material';

interface StudentAnswersProps {
    state: ExamDoing,
    dispatch: Dispatch<Action>
}

export default function StudentAnswers({state, dispatch}: StudentAnswersProps) {

    return (
        <>
            <Typography variant={'h5'} color={'primary'} sx={{m: '1px 2px', fontWeight: 600}}>
                Phiếu trả lời
            </Typography>
            <Box>
                <Grid container spacing={1}>
                    {
                        state.questions.map((question: Answer) =>
                            (
                                <Grid size={{xs: 6}} key={question.questionId}>
                                    {QuestionUnit(question, dispatch)}
                                </Grid>
                            ))
                    }
                </Grid>

            </Box>
        </>
    )
}

function QuestionUnit(question: Answer, dispatch: Dispatch<Action>) {

    return (
        <Box key={question.questionId} sx={{m: "10px 0 10px 10px "}}>
            <Grid container spacing={2} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <Grid size={{xs: 2}}>
                    <Typography sx={{fontSize: 20}}>C{question.questionIndex + 1}:</Typography>
                </Grid>

                <Grid size={{xs: 10}} sx={{display: 'flex'}}>
                    {
                        QuestionElement(question, dispatch)
                    }
                </Grid>

            </Grid>
        </Box>
    )
}

function QuestionElement(question: Answer, dispatch: Dispatch<Action>) {
    const onChangeAnswer = (e: ChangeEvent<HTMLInputElement>) => {
        const payload = {
            targetedAnswer: e.target.value,
            index: question.questionIndex,
        }

        switch (question.questionType) {
            case 'single-choice':
                dispatch({type: 'SINGLE_CHANGE_ANSWER', payload: payload});
                break;
            case 'multiple-choice':
                if (e.target.checked) {
                    dispatch({type: 'MULTIPLE_CHECK_OPTION', payload: payload})
                } else {
                    dispatch({type: 'MULTIPLE_UNCHECK_OPTION', payload: payload})
                }
                break;
            case 'long-response':
                dispatch({type: 'LONG_RESPONSE_ANSWER', payload: payload});
                break;
        }
    }

    const options: string[] = ["A", "B", "C", "D"];

    switch (question.questionType) {
        case 'single-choice':
            return options.map((option: string, index: number) => {
                return (
                    <Box key={index}>
                        <Radio name={`question-${question.questionIndex}`}
                               onChange={onChangeAnswer}
                               checked={question.answer === option}
                               id={`question-${question.questionIndex}-${option}`} value={option}/>
                        <label htmlFor={`question-${question.questionIndex}-${option}`}>{option}</label>
                    </Box>
                )
            });

        case 'multiple-choice':
            return options.map((option: string, index: number) => {
                return (
                    <Box key={index}>
                        <Checkbox name={`question-${question.questionIndex}`}
                                  onChange={onChangeAnswer}
                                  checked={question.answer.includes(option)}
                                  id={`question-${question.questionIndex}-${option}`} value={option}/>
                        <label htmlFor={`question-${question.questionIndex}-${option}`}>{option}</label>
                    </Box>
                )
            });

        case 'long-response':
            return <TextField
                fullWidth
                size={'small'}
                variant="outlined"
                value={question.answer}
                onChange={onChangeAnswer}
                slotProps={{
                    input: {
                        style: {whiteSpace: 'nowrap', overflowX: 'auto'}
                    }
                }}
            />

        default:
            return <></>
    }
}
