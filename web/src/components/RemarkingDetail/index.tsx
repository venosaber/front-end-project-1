import type {AnswerResult, Exam, ExamResult} from "../../utils/types";
import {Box, Button, Radio, Typography} from "@mui/material";
import dayjs from "dayjs";
import {ProgressCircle} from "../index.ts";
import {useState, useCallback, useMemo, memo} from "react";
import type {ChangeEvent} from "react";
import {toast} from "react-toastify";
import {getValidAccessToken} from "../../router/auth.ts";
import {putMethod} from "../../utils/api.ts";

interface QuestionI {
    id: number;
    index: number;
    type: string;
    isCorrect: boolean | null;
    answer: string | null;
    isInitiallyMarked: boolean;
}

interface RemarkingDetailProps {
    examResult: ExamResult;
    exam: Exam;
    onSaveSuccess: () => Promise<void>;
}

export default function RemarkingDetail({examResult, exam, onSaveSuccess}: RemarkingDetailProps) {
    // long-response answers need to be marked manually
    const remarkCount: number = examResult.answers.filter(answer =>
        answer.type === "long-response" && answer.is_correct === null).length;
    // number of not answered questions and incorrect answers
    const failedCount: number = examResult.number_of_question - remarkCount - examResult.number_of_correct_answer;

    /*** determine the correctness of the answer based on is_correct ***/
        // if is_correct is null, initially mark as null
        // if is_correct array contains a false value => mark as false, otherwise mark as true
    const translateCorrection = useCallback((is_correct: boolean[] | null) => {
            if (is_correct === null) return null;
            return !is_correct.includes(false); // answered single-choice or multiple-choice questions
        }, []);

    const answerObj = useMemo(() => {
        const obj: { [key: number]: { answer: string | null, isCorrect: boolean | null } } = {};
        examResult.answers.forEach((answer: AnswerResult) => {
            obj[answer.question] = {
                answer: answer.answer,
                isCorrect: translateCorrection(answer.is_correct)
            };
        });
        return obj;
    }, [examResult.answers, translateCorrection]);

    const initQuestions = useMemo(() => {
        return exam.questions.map(question => {
            return {
                id: question.id!,
                index: question.index,
                type: question.type,
                isCorrect: answerObj[question.id!]?.isCorrect === undefined ? false : answerObj[question.id!].isCorrect, // not answered => mark as false
                answer: answerObj[question.id!]?.answer ?? null, // not answered => answer is null,
                // only long-response questions which have been answered are initially unmarked
                isInitiallyMarked: !(answerObj[question.id!]?.isCorrect === null)
            }
        })
    }, [exam.questions, answerObj]);

    const sortedQuestions: QuestionI[] = [...initQuestions.sort((a: QuestionI, b: QuestionI) => a.index - b.index)];
    const [questions, setQuestions] = useState<QuestionI[]>(sortedQuestions);

    const handleMarkChange = useCallback((questionId: number, isCorrect: boolean) => {
        setQuestions(prevQuestions => {
            const newQuestions = [...prevQuestions];
            const curQuestionIndex = newQuestions.findIndex(q => q.id === questionId);
            if (curQuestionIndex !== -1) {
                newQuestions[curQuestionIndex] = {
                    ...newQuestions[curQuestionIndex],
                    isCorrect: isCorrect
                };
            }
            return newQuestions;
        });
    }, []);

    // if the is_correct array already exists, return it, otherwise return [true] or [false]
    const getIsCorrectArray = (question: QuestionI): boolean[] => {
        const existing = examResult.answers.find(answer => answer.question === question.id)?.is_correct;
        return existing ?? [question.isCorrect === true];
    };

    const onSubmit = async () => {
        // check for unmarked questions
        const unmarkedIndex: number = questions.findIndex(question => question.isCorrect === null);
        if (unmarkedIndex !== -1) {
            toast.error(`Câu số ${unmarkedIndex + 1} chưa được chấm!`);
            return;
        }

        // only answered questions have IDs returned from API
        const answeredQuestions: QuestionI[] = questions.filter(question => question.answer !== null);

        // payload can only include answered questions as these questions have IDs
        const questionsForPayload = answeredQuestions.map(question => {
            return {
                question: question.id,
                answer: question.answer,
                is_correct: getIsCorrectArray(question),
                id: examResult.answers.find(answer => answer.question === question.id)!.id
            }
        });
        const payload = {
            exam: examResult.exam,
            user: examResult.user,
            status: 'remarked',
            questions: questionsForPayload,
            device: examResult.device,
            id: examResult.id,
        };

        const accessToken: string | null = await getValidAccessToken();
        const response = await putMethod(`/exam_result/${examResult.id}`, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        if (!response) {
            toast.error('Lưu không thành công!');
            return;
        }
        toast.success('Lưu thành công!');
        await onSaveSuccess();
    }


    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Box>
                    <Typography variant="body1" fontWeight="600">
                        Tên đề bài: {exam.name}
                    </Typography>
                    <Typography variant="body1" fontWeight="600">
                        Thời gian nộp bài: {dayjs(examResult.created_at).format('HH:mm:ss DD/MM/YYYY')}
                    </Typography>
                </Box>

                <Button variant={'contained'} color={'primary'} onClick={onSubmit}>
                    Lưu lại
                </Button>
            </Box>

            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2, p: 1,
                border: '1px solid #cccccc'
            }}>
                <Box>
                    <Typography variant="body1">
                        Tổng số câu: {examResult.number_of_question}
                    </Typography>

                    <Typography variant="body1">
                        Số câu đúng: {examResult.number_of_correct_answer}
                    </Typography>

                    <Typography variant="body1">
                        Số câu sai: {failedCount}
                    </Typography>

                    <Typography variant="body1">
                        Số câu chưa chấm: {remarkCount}
                    </Typography>
                </Box>

                <ProgressCircle value={examResult.number_of_correct_answer} total={examResult.number_of_question}/>
            </Box>

            <Typography variant={'h6'} fontWeight={600} color={'info'}>Câu trả lời</Typography>

            {
                questions.map(question => <MemoizedQuestionUnit key={question.id}
                                                                question={question}
                                                                onMark={handleMarkChange}/>)
            }
        </Box>
    )
}

interface QuestionUnitProps {
    question: QuestionI;
    onMark: (questionId: number, isCorrect: boolean) => void;
}

const MemoizedQuestionUnit = memo(function QuestionUnit({question, onMark}: QuestionUnitProps) {
    const colorByCorrectness = (isCorrect: boolean | null) => {
        if (!question.isInitiallyMarked) return '#9d00ff';
        return isCorrect ? '#008000' : '#ff0000';
    }

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        onMark(question.id, e.target.value === 'true');
    }

    const MarkingElement = () => {
        // only remark long-response questions that are initially unmarked
        if (!question.isInitiallyMarked) return (
            <Box sx={{display: 'flex', alignItems: 'center'}}>
                <Radio name={`question-${question.id}`}
                       onChange={onChange}
                       id={`question-${question.id}-true`} value={'true'}
                       checked={question.isCorrect === true}
                />
                <label htmlFor={`question-${question.id}-true`}>Đúng</label>

                <Radio name={`question-${question.id}`} sx={{ml: '10px'}}
                       onChange={onChange}
                       id={`question-${question.id}-false`} value={'false'}
                       checked={question.isCorrect === false}
                />
                <label htmlFor={`question-${question.id}-false`}>Sai</label>
            </Box>
        )

        return <Typography variant={'body1'} color={colorByCorrectness(question.isCorrect)}>
            {question.isCorrect ? '✓' : '⨉'}
        </Typography>

    }

    return (
        <Box sx={{display: 'flex', alignItems: 'center', mb: '10px'}}>
            <Typography variant={'body1'} color={colorByCorrectness(question.isCorrect)} sx={{mr: '10px'}}>
                Câu {question.index + 1}:</Typography>
            <Typography variant={'body1'} color={colorByCorrectness(question.isCorrect)} sx={{mr: '10px'}}>
                {question.answer || 'Chưa trả lời'}</Typography>

            <MarkingElement/>
        </Box>
    )
});

