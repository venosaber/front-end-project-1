import {useState, useEffect} from "react";
import {getValidAccessToken, getUserInfo} from "../../router/auth.ts";

export default function Testing() {
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
       const onMounted = async () => {
           const accessToken = await getValidAccessToken();

           const {role} = getUserInfo(accessToken);
           setUserRole(role);
       }
       onMounted();
    },[])

    if(userRole === 'student') return <div>Student</div>
    return <div>Teacher</div>
}