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