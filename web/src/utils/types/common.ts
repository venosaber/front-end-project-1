export interface Course {
    id: number,
    code: string,
    name: string,
    users: Member[]
}

export interface Member {
    id: number,
    name: string,
    role: string,
    status: string
}

export interface Avata{
    id: number | null,
    url?: string,
    payload: string | null
}

export interface User extends Member {
    email: string,
    school: string | null,
    parent_name: string | null,
    parent_phone: string | null,
    avata: Avata | null
}

export interface ExamGroup {
    id: number,
    name: string,
    clas: number,
    start_time: string,
    await_time: number,
    created_at: Date,
    is_once: boolean,
    is_save_local: boolean
}

export interface Exam{
    id?: number,
    name: string,
    code: string,
    exam_group: number,
    number_of_question: number,
    total_time: number,
    correct_answer: {},
    questions: Question[],
    description: string,
    file: ExamFile | null,
    deleted_questions: number[]
}

export interface ExamWithStatus extends Exam{
    status: string
}

export interface Question{
    type: string,
    correct_answer: string,
    index: number,
    id?: number
}

export interface Answer{
    questionId: number,
    questionIndex: number,
    questionType: string,
    answer: string
}

export interface AnswerResult{
    id: number | null,
    question: number,
    index: number,
    answer: string | null,
    is_correct: boolean[] | null,
    type: string
}

export interface ExamFile{
    id: number | null,
    url?: string,
    payload?: string
}

export interface ExamDoing{
    examName: string,
    examCode: string,
    examFile: ExamFile,
    questions: Answer[],
    timeLeft: number,
    device: string
}

export interface ExamResult{
    id: number,
    exam: number,
    user: number,
    status: string,
    old_answer: null,
    answers: AnswerResult[],
    number_of_question: number,
    number_of_correct_answer: number,
    score: number | null,
    created_at: Date,
    device: string
}

export interface StudentResultGroup extends User{
    results: ExamResult[]
}

export interface Action {
    type: string,
    payload?: any
}