import {useEffect, useState, type ChangeEvent, type FormEvent} from "react";
import {getValidAccessToken, getUserInfo} from "../../router/auth.ts";
import {type NavigateFunction, useNavigate, useSearchParams} from "react-router-dom";
import {CheckingAuth, LogoElement} from "../../components";
import {Box, Button, Container, Paper, TextField, Typography} from "@mui/material";
import {getMethod, postMethod} from '../../utils/api.ts'
import type {Member} from '../../utils/types';
import {toast} from 'react-toastify';

function UnAuthorizedPage({navigate}: { navigate: NavigateFunction}) {
    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Box sx={{textAlign: 'center'}}>
                <Typography component={'h1'} variant={'h6'}>
                    Bạn chưa đăng nhập, vui lòng đăng nhập để tham gia lớp học
                </Typography>
                <Button variant={'contained'} color={'primary'} sx={{mt: 2, p: 2}}
                        onClick={() => navigate(`/login`)}>
                    Quay về trang đăng nhập
                </Button>
            </Box>
        </Box>
    )
}

function AlreadyInClassPage({navigate, classId}: { navigate: NavigateFunction, classId: string | null }) {
    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Box sx={{textAlign: 'center'}}>
                <Typography component={'h1'} variant={'h6'}>
                    Bạn đã tham gia lớp học này rồi
                </Typography>
                <Button variant={'contained'} color={'primary'} sx={{mt: 2, p: 2}}
                        onClick={() => navigate(`/class/${classId}`)}
                >
                    Đi tới lớp học
                </Button>
            </Box>
        </Box>
    )
}

export default function Invite() {
    const navigate: NavigateFunction = useNavigate();
    const [searchParams] = useSearchParams();
    const classId: string | null = searchParams.get('class');

    /***** check authorization *****/
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    /***** class information ******/
    const [isInClass, setIsInClass] = useState(false);
    const [classData, setClassData] = useState({
        name: '',
        code: '',
        users: [] as Member[]
    });

    /***** user id && protection code *****/
    const [userId, setUserId] = useState(0);

    // class's protection code
    const [inputCode, setInputCode] = useState('');

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (inputCode !== classData.code) {
            toast.error('Mã bảo vệ không chính xác!');
            return;
        }

        // add the user to the class
        const payload = {
            class_id: classId,
            user_id: userId
        }
        const response = await postMethod('/invite', payload);
        if(!response){
            toast.error('Có lỗi xảy ra, vui lòng thử lại sau!');
        }else{
            toast.success('Tham gia thành công!')
            navigate(`/class/${classId}`);
        }
    }

    useEffect(() => {
        const onMounted = async () => {
            const accessToken: string | null = await getValidAccessToken();
            setIsAuthenticated(!!accessToken);
            setIsCheckingAuth(false);

            if (accessToken && classId) {
                const {id} = getUserInfo(accessToken);
                setUserId(id);

                const {name, code, users} = await getMethod(`/master/class/${classId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                setClassData({name, code, users});

                // check if the user is already in the class
                setIsInClass(users.some((user: Member) => user.id === id));
            }
        }

        onMounted();
    }, []);

    if (isCheckingAuth) return <CheckingAuth/>;
    if (!isAuthenticated) {
        return (
            <UnAuthorizedPage navigate={navigate}/>
        )
    } else if (isInClass) {
        return (
            <AlreadyInClassPage navigate={navigate} classId={classId}/>
        )
    } else {
        return (
            <Container maxWidth={false}
                       sx={{
                           backgroundColor: '#f0f2f5',
                           minHeight: '100vh', p: 3,
                           display: 'flex', justifyContent: 'center', alignItems: 'center',
                       }}>

                <Paper sx={{
                    width: "100%",
                    maxWidth: "500px",

                    borderRadius: "10px",
                    overflow: "hidden", // to remain effect of border-radius with child grid items
                    boxShadow: "0 0 10px #000000"
                }}>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 3
                    }}>

                        <LogoElement/>
                        {/* Headings */}
                        <Typography component={'h1'} variant={'h4'}
                                    sx={{
                                        fontWeight: 'bold',
                                        mb: 1,
                                        color: 'text.primary',
                                        textAlign: 'center'
                                    }}>
                            Tham gia lớp học
                        </Typography>

                        {/*  Invite form  */}
                        <Box component={'form'} sx={{width: '100%'}}
                             onSubmit={onSubmit}
                        >
                            <Typography component={'p'} variant={'h6'}>
                                Lớp học: {classData.name}
                            </Typography>
                            <Typography component={'p'} variant={'h6'}>
                                {classData.users.length} Thành viên
                            </Typography>

                            <TextField fullWidth size={'small'} sx={{my: 1}}
                                       placeholder={"Vui lòng nhập mã bảo vệ"}

                                       name={"inputCode"}
                                       value={inputCode}
                                       onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                           setInputCode(e.target.value)
                                       }}
                            />

                            <Button
                                size={'large'} variant={'contained'} fullWidth
                                color={'primary'} sx={{fontWeight: '600', borderRadius: 2, mt: 2}}
                                type={'submit'}
                            >
                                Tham gia lớp học</Button>

                        </Box>

                    </Box>

                </Paper>
            </Container>
        )
    }

}