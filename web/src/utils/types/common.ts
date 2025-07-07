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
    payload: File | string | null
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