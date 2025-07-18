import type {Question, Exam, Action} from '../../utils/types';

const defaultQuestion = {
    type: 'single-choice',
    correct_answer: '',
    index: 0
}

export const initState: Exam = {
    name: "",
    code: "",
    exam_group: 0,
    number_of_question: 1,
    total_time: 0,
    correct_answer: {},
    questions: [defaultQuestion],
    description: "default",
    file: null,
    deleted_questions: []
}

const actionHandlers = {
    // load data from API to state
    'LOAD_INITIAL_DATA': (state: Exam, action: Action) => {
        // convert total time from seconds to minutes
        const loadedState = {...action.payload};
        const totalTimeByMinutes: number = action.payload.total_time / 60;
        return {...state, ...loadedState, total_time: totalTimeByMinutes};
    },

    // set the name of the exam
    'SET_NAME': (state: Exam, action: Action) => {
        return {...state, name: action.payload}
    },

    // set the code of the exam
    'SET_CODE': (state: Exam, action: Action) => {
        return {...state, code: action.payload}
    },

    // set the total time of the exam
    'SET_TOTAL_TIME': (state: Exam, action: Action) => {
        return {...state, total_time: action.payload}
    },

    // set the number of questions
    'SET_AMOUNT': (state: Exam, action: Action) => {
        const newAmount: number = action.payload;
        if(newAmount <= 0 || isNaN(newAmount)) return state;
        if(newAmount < state.questions.length){
            return {
                ...state,
                number_of_question: newAmount,
                questions: state.questions.slice(0, newAmount)
            }
        }else{
            const newQuestions = [...state.questions];
            for (let i: number = state.questions.length; i < newAmount; i++) {
                newQuestions.push({
                    ...defaultQuestion,
                    index: i
                })
            }
            return {
                ...state,
                number_of_question: newAmount,
                questions: newQuestions
            }
        }
    },

    // change a question's type
    'CHANGE_QUESTION_TYPE': (state: Exam, action: Action) => {
        const {questionType, index} = action.payload;
        const newQuestions = state.questions.map((question: Question) => {
            if(question.index === index){
                return {
                    ...question,
                    type: questionType,
                    correct_answer: ''
                }
            }
            return question;
        })
        return {
            ...state,
            questions: newQuestions
        }
    },

    // change the correct answer for a single-choice question
    'SINGLE_CHANGE_CORRECT_ANSWER': (state: Exam, action: Action) => {
        const {targetedAnswer, index} = action.payload;
        const newQuestions = state.questions.map((question: Question) => {
            if(question.index === index){
                return {
                    ...question,
                    correct_answer: targetedAnswer
                }
            }
            return question;
        });
        return {
            ...state,
            questions: newQuestions
        }
    },

    // uncheck an option of a multiple-choice question
    'MULTIPLE_UNCHECK_OPTION': (state: Exam, action: Action) => {
        const {targetedAnswer: uncheckedAnswer, index} = action.payload;
        const newQuestions: Question[] = state.questions.map((question: Question) => {
            if(question.index === index){
                const curQuestion = state.questions[index];
                const curCorrectAnswers: string[] = curQuestion.correct_answer.split(',');
                if(curCorrectAnswers.length === 1){
                    return {
                        ...question,
                        correct_answer: ''
                    }
                }else{
                    const newCorrectAnswers: string[] = curCorrectAnswers.filter(answer => answer!== uncheckedAnswer);
                    return {
                        ...question,
                        correct_answer: newCorrectAnswers.sort().join(',')
                    }
                }
            }

            return question;
        })

        return {
            ...state,
            questions: newQuestions
        }
    },

    // check an option of a multiple-choice question
    'MULTIPLE_CHECK_OPTION': (state: Exam, action: Action) => {
        const {targetedAnswer: checkedAnswer, index} = action.payload;
        const newQuestions: Question[] = state.questions.map((question: Question) => {
            if(question.index === index){
                const curQuestion = state.questions[index];
                // avoid saving the empty string by filter(Boolean)
                const curCorrectAnswers: string[] = curQuestion.correct_answer.split(',').filter(Boolean);
                curCorrectAnswers.push(checkedAnswer);
                return {
                    ...question,
                    correct_answer: curCorrectAnswers.sort().join(',')
                }
            }
            return question;
        })

        return {
            ...state,
            questions: newQuestions
        }
    },

    // handle uploading the file
    'UPLOAD_FILE': (state: Exam, action: Action) => {
        return {...state, file: action.payload};
    }
}

export const reducer = (state: Exam, action: Action) => {
    const handler = actionHandlers[action.type as keyof typeof actionHandlers];
    if (!handler) {
        throw new Error(`No handler for action type ${action.type}`);
    }
    return handler(state, action);
}