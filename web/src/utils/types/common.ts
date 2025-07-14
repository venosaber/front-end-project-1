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
    created_at: string,
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
    file: ExamFile | null
}

export interface Question{
    type: string,
    correct_answer: string,
    index: number,
    id?: number | null
}

export interface ExamFile{
    id: number | null,
    url: string,
    payload: string
}

export interface Action {
    type: string,
    payload: any
}