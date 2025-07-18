import {useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {getUserInfo, getValidAccessToken} from "../../router/auth.ts";

import {StudentExamGroup, TeacherExamGroup} from '..';

export default function ExamGroup() {
    const navigate = useNavigate();

    const [userRole, setUserRole] = useState<string>('student');

    useEffect(() => {
        const onMounted = async () => {
            const accessToken: string | null = await getValidAccessToken();
            if (!accessToken) {
                console.error("No valid access token, redirecting to login page");
                navigate('/login');
                return;
            }
            const {role} = getUserInfo(accessToken);
            setUserRole(role);
        }

        onMounted();
    }, []);

    if(userRole === 'student') {
        return <StudentExamGroup />
    }
    if(userRole === 'teacher') {
        return <TeacherExamGroup />
    }

    return <></>

}

