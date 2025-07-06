import {FHeader, Loading} from "../../components";
import {Avatar, Box, Button, Container, Grid, Paper, TextField, Typography} from "@mui/material";
import {type ChangeEvent, type FocusEvent, type FormEvent, useEffect} from "react";
import {useState} from "react";
import {getUserInfo, getValidAccessToken} from "../../router/auth.ts";
import type {User, Avata} from "../../utils/types";
import {getMethod, postMethod, putMethod} from "../../utils/api.ts";
import {useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';

interface InfoForm {
    name: string,
    email: string,
    school: string,
    parent_name: string,
    parent_phone: string,
    avata: Avata | null
}

interface PasswordForm {
    old_password: string,
    new_password: string,
    confirm_new_password: string
}

export default function Profile() {
    const navigate = useNavigate();

    /********* convert to base 64 (images) ************/
    // const fileToBase64 = (file: File): Promise<string> => {
    //     return new Promise((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.onload = () => {
    //             resolve(reader.result as string);
    //         };
    //         reader.onerror = reject;
    //         reader.readAsDataURL(file);
    //     });
    // };

    const [infoFormData, setInfoFormData] = useState<InfoForm>({
        name: '',
        email: '',
        school: '',
        parent_name: '',
        parent_phone: '',
        avata: null
    });

    const [passwordFormData, setPasswordFormData] = useState<PasswordForm>({
        old_password: '',
        new_password: '',
        confirm_new_password: ''
    });

    const [infoHelperTexts, setInfoHelperTexts] = useState({
        name: '',
        email: ''
    });

    const [passwordHelperTexts, setPasswordHelperTexts] = useState({
        old_password: '',
        new_password: '',
        confirm_new_password: ''
    })

    const [touchedInfo, setTouchedInfo] = useState({
        name: false,
        email: false
    });

    const [touchedPassword, setTouchedPassword] = useState({
        old_password: false,
        new_password: false,
        confirm_new_password: false
    })

    const validate = {
        name: (value: string) => {
            if (!value) {
                setInfoHelperTexts(prev => ({...prev, name: 'Vui lòng nhập tên của bạn!'}));
                return false;
            }
            setInfoHelperTexts(prev => ({...prev, name: ''}));
            return true;
        },

        email: (value: string) => {
            if (!value) {
                setInfoHelperTexts(prev => ({...prev, email: 'Vui lòng nhập email!'}));
                return false;
            }

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailRegex.test(value)) {
                setInfoHelperTexts(prev => ({...prev, email: 'Địa chỉ email không hợp lệ!'}));
                return false;
            }

            setInfoHelperTexts(prev => ({...prev, email: ''}));
            return true;
        },

        old_password: (value: string) => {
            if (!value) {
                setPasswordHelperTexts(prev => ({...prev, old_password: 'Vui lòng nhập mật khẩu cũ!'}));
                return false;
            }
            if (value.length < 6) {
                setPasswordHelperTexts(prev => ({...prev, old_password: 'Vui lòng nhập tối thiểu 6 ký tự!'}));
                return false;
            }

            if (passwordFormData.new_password && value === passwordFormData.new_password) {
                setPasswordHelperTexts(prev => ({...prev, new_password: 'Mật khẩu mới phải khác mật khẩu cũ!'}));
                return false;
            }

            setPasswordHelperTexts(prev => ({...prev, old_password: ''}));
            return true;
        },

        new_password: (value: string) => {
            if (!value) {
                setPasswordHelperTexts(prev => ({...prev, new_password: 'Vui lòng nhập mật khẩu mới!'}));
                return false;
            }
            if (value.length < 6) {
                setPasswordHelperTexts(prev => ({...prev, new_password: 'Vui lòng nhập tối thiểu 6 ký tự!'}));
                return false;
            }

            if (passwordFormData.old_password && value === passwordFormData.old_password) {
                setPasswordHelperTexts(prev => ({...prev, new_password: 'Mật khẩu mới phải khác mật khẩu cũ!'}));
                return false;
            }

            setPasswordHelperTexts(prev => ({...prev, new_password: ''}));
            return true;
        },

        confirm_new_password: (value: string) => {
            if (!value) {
                setPasswordHelperTexts(prev => ({...prev, confirm_new_password: 'Vui lòng nhập lại mật khẩu mới!'}));
                return false;
            }
            if (passwordFormData.new_password && value !== passwordFormData.new_password) {
                setPasswordHelperTexts(prev => ({...prev, confirm_new_password: 'Mật khẩu nhập lại phải trùng khớp!'}));
                return false;
            }

            setPasswordHelperTexts(prev => ({...prev, confirm_new_password: ''}));
            return true;
        }
    }

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        if (['email', 'name'].includes(name)) {
            setTouchedInfo({
                ...touchedInfo,
                [e.target.name]: true
            });
            validate[name as 'email' | 'name'](value);
        }

        if (['old_password', 'new_password', 'confirm_new_password'].includes(name)) {
            setTouchedPassword({
                ...touchedPassword,
                [e.target.name]: true
            });
            validate[name as 'old_password' | 'new_password' | 'confirm_new_password'](value);
        }

    }

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        if (['old_password', 'new_password', 'confirm_new_password'].includes(name)) {
            setPasswordFormData({
                ...passwordFormData,
                [name]: value
            })
        } else {
            setInfoFormData({
                ...infoFormData,
                [name]: value
            });
        }

        if (['email', 'name'].includes(name)) {
            validate[name as 'email' | 'name'](value);
        }
        if (['old_password', 'new_password', 'confirm_new_password'].includes(name)) {
            validate[name as 'old_password' | 'new_password' | 'confirm_new_password'](value);
        }
    }

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file: File | null = event.target.files?.[0] ?? null;
        if (file) {
            const url: string = URL.createObjectURL(file);

            setInfoFormData({
                ...infoFormData,
                avata: {
                    id: null,
                    url,
                    payload: file
                }
            });
        }
    };

    const onSubmitInfo = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // set all touched to true
        setTouchedInfo({
            name: true,
            email: true
        })

        // check valid
        const isValid: boolean = validate.name(infoFormData.name) && validate.email(infoFormData.email);
        if (!isValid) return;

        // submit logic
        const payload = {...infoFormData, avata: null};

        /****** Convert avatar file to base64 if exists ******/
        // if (infoFormData.avata?.payload instanceof File) {
        //     payload.avata = {
        //         ...payload.avata,
        //         id: null,
        //         payload: await fileToBase64(infoFormData.avata.payload) // convert File -> base64 string
        //     };
        // }

        const accessToken: string | null = await getValidAccessToken();
        const response = await putMethod(`/master/user/${userId}`,payload,{
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        if(response !== null){
            toast.success('Cập nhật thông tin thành công!');
        }else{
            toast.error('Cập nhật thất bại!')
        }

    }

    const onSubmitPassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // set all touched to true
        setTouchedPassword({
            old_password: true,
            new_password: true,
            confirm_new_password: true
        });

        // check valid
        const isValid: boolean =
            validate.old_password(passwordFormData.old_password)
            && validate.new_password(passwordFormData.new_password)
            && validate.confirm_new_password(passwordFormData.confirm_new_password);
        if(!isValid) return;

        // submit logic
        // passwords need to be converted to base64
        const payload = {
            id: userId,
            old_password: btoa(passwordFormData.old_password),
            new_password: btoa(passwordFormData.new_password)
        }
        const accessToken: string | null = await getValidAccessToken();
        const response = await postMethod('/master/user/change_password',payload,{
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if(!response){
           toast.error('Sai mật khẩu cũ!');
        }else{
            toast.success('Thay đổi mật khẩu thành công!');
        }

    }

    const [userId, setUserId] = useState(0);
    const [isLoadingInfo, setIsLoadingInfo] = useState<boolean>(true);

    useEffect(() => {
        const onMounted = async () => {
            const accessToken: string | null = await getValidAccessToken();
            if(!accessToken){
                console.error("No valid access token, redirecting to login page");
                navigate('/login');
                return;
            }

            const {id} = getUserInfo(accessToken);
            setUserId(id);

            try{
                const userData: User = await getMethod(`/master/user/${id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                const {name, email, school, parent_name, parent_phone, avata} = userData;

                setInfoFormData({
                    name,
                    email,
                    school: school || '',
                    parent_name: parent_name || '',
                    parent_phone: parent_phone || '',
                    avata: avata || {id: 0, url: '', payload: null}
                })
            }catch (err) {
                console.error("Error on loading courses: ",err);
            }finally {
                setIsLoadingInfo(false);
            }
        }
        onMounted();
    }, []);

    if(isLoadingInfo) return <Loading />

    return (
        <>
            <FHeader/>
            <Container maxWidth={false}
                       component={"main"}
                       sx={{
                           mt: '64px',
                           minHeight: 'calc(100vh - 64px)',
                           backgroundColor: "#f0f0f0",
                           p: 2
                       }}
            >
                <h1 style={{margin: '0 auto 10px', fontWeight: 600, textAlign: 'center'}}>THÔNG TIN CÁ NHÂN</h1>

                <Paper sx={{
                    width: "100%",
                    borderRadius: "10px",
                    overflow: "hidden", // to remain effect of border-radius with child grid items
                    boxShadow: "0 0 10px #000000"
                }}>

                    <Box component={'form'} sx={{width: '100%', p: 2}} onSubmit={onSubmitInfo}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography component={'h2'} color={'primary'}
                                        sx={{fontWeight: 600, fontSize: 20}}>THÔNG TIN CƠ BẢN</Typography>
                            <Button variant={'contained'} size={'large'}
                                    sx={{fontWeight: 600, borderRadius: 2}}
                                    type={'submit'}>Lưu lại</Button>
                        </Box>

                        <Grid size={{xs: 12}} sx={{textAlign: 'center', mb: 2}}>
                            <Avatar
                                alt="Avatar"
                                src={infoFormData.avata?.url ?? undefined}
                                sx={{width: 120, height: 120, mx: 'auto'}}
                            />
                            <input
                                accept="image/*"
                                id="avatar-upload"
                                type="file"
                                style={{display: 'none'}}
                                onChange={handleFileUpload}
                            />
                            <label htmlFor="avatar-upload">
                                <Button variant="contained" component="span" sx={{mt: 1}}>
                                    Tải lên
                                </Button>
                            </label>
                        </Grid>

                        <Grid container spacing={3}>
                            <Grid size={{xs: 12, md: 6}} width={'100%'}>
                                <Typography sx={{fontWeight: 600, fontSize: 18}}
                                            color={'textPrimary'}>Tên của bạn</Typography>
                                <TextField fullWidth size={'small'} sx={{my: 1}}
                                           placeholder={'Nhập tên của bạn'}

                                           name={'name'}
                                           value={infoFormData.name}
                                           onChange={onChange}
                                           onBlur={handleBlur}
                                           error={touchedInfo.name && Boolean(infoHelperTexts.name)}
                                           helperText={touchedInfo.name && infoHelperTexts.name}
                                />
                            </Grid>

                            <Grid size={{xs: 12, md: 6}} width={'100%'}>
                                <Typography sx={{fontWeight: 600, fontSize: 18}}
                                            color={'textPrimary'}>Email</Typography>
                                <TextField fullWidth size={'small'} sx={{my: 1}}
                                           placeholder={'Nhập email của bạn'}

                                           name={'email'}
                                           value={infoFormData.email}
                                           onChange={onChange}
                                           onBlur={handleBlur}
                                           error={touchedInfo.email && Boolean(infoHelperTexts.email)}
                                           helperText={touchedInfo.email && infoHelperTexts.email}
                                />
                            </Grid>

                            <Grid size={{xs: 12, md: 6}} width={'100%'}>
                                <Typography sx={{fontWeight: 600, fontSize: 18}}
                                            color={'textPrimary'}>Trường</Typography>
                                <TextField fullWidth size={'small'} sx={{my: 1}}
                                           placeholder={'Nhập tên trường bạn'}

                                           name={'school'}
                                           value={infoFormData.school}
                                           onChange={onChange}
                                />
                            </Grid>

                            <Grid size={{xs: 12, md: 6}} width={'100%'}>
                                <Typography sx={{fontWeight: 600, fontSize: 18}}
                                            color={'textPrimary'}>Tên phụ huynh</Typography>
                                <TextField fullWidth size={'small'} sx={{my: 1}}
                                           placeholder={'Nhập tên phụ huynh'}

                                           name={'parent_name'}
                                           value={infoFormData.parent_name}
                                           onChange={onChange}
                                />
                            </Grid>

                            <Grid size={{xs: 12, md: 6}} width={'100%'}>
                                <Typography sx={{fontWeight: 600, fontSize: 18}}
                                            color={'textPrimary'}>Số điện thoại phụ huynh</Typography>
                                <TextField fullWidth size={'small'} sx={{my: 1}}
                                           placeholder={'Nhập sđt phụ huynh'}

                                           name={'parent_phone'}
                                           value={infoFormData.parent_phone}
                                           onChange={onChange}
                                />
                            </Grid>

                        </Grid>
                    </Box>
                </Paper>

                <Paper sx={{
                    width: "100%",
                    borderRadius: "10px",
                    overflow: "hidden", // to remain effect of border-radius with child grid items
                    boxShadow: "0 0 10px #000000",
                    m: '40px auto 30px'
                }}>

                    <Box component={'form'} sx={{width: '100%', p: 2}} onSubmit={onSubmitPassword}>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography component={'h2'} color={'primary'}
                                        sx={{fontWeight: 600, fontSize: 20}}>THAY ĐỔI MẬT KHẨU</Typography>
                            <Button variant={'contained'} size={'large'}
                                    sx={{fontWeight: 600, borderRadius: 2}}
                                    type={'submit'}>Lưu lại</Button>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid size={{xs: 12, md: 6}} width={'100%'}>
                                <Typography sx={{fontWeight: 600, fontSize: 18}}
                                            color={'textPrimary'}>Mật khẩu cũ</Typography>
                                <TextField fullWidth size={'small'} sx={{my: 1}}
                                           placeholder={'Nhập mật khẩu cũ của bạn'}
                                           type={'password'}

                                           name={'old_password'}
                                           value={passwordFormData.old_password}
                                           onChange={onChange}
                                           onBlur={handleBlur}
                                           error={touchedPassword.old_password && Boolean(passwordHelperTexts.old_password)}
                                           helperText={touchedPassword.old_password && passwordHelperTexts.old_password}
                                />
                            </Grid>

                            <Grid size={{xs: 12, md: 6}} width={'100%'}>
                            </Grid>

                            <Grid size={{xs: 12, md: 6}} width={'100%'}>
                                <Typography sx={{fontWeight: 600, fontSize: 18}}
                                            color={'textPrimary'}>Mật khẩu mới</Typography>
                                <TextField fullWidth size={'small'} sx={{my: 1}}
                                           placeholder={'Nhập mật khẩu mới của bạn'}
                                           type={'password'}

                                           name={'new_password'}
                                           value={passwordFormData.new_password}
                                           onChange={onChange}
                                           onBlur={handleBlur}
                                           error={touchedPassword.new_password && Boolean(passwordHelperTexts.new_password)}
                                           helperText={touchedPassword.new_password && passwordHelperTexts.new_password}
                                />
                            </Grid>

                            <Grid size={{xs: 12, md: 6}} width={'100%'}>
                                <Typography sx={{fontWeight: 600, fontSize: 18}}
                                            color={'textPrimary'}>Nhập lại mật khẩu mới</Typography>
                                <TextField fullWidth size={'small'} sx={{my: 1}}
                                           placeholder={'Nhập lại mật khẩu mới của bạn'}
                                           type={'password'}

                                           name={'confirm_new_password'}
                                           value={passwordFormData.confirm_new_password}
                                           onChange={onChange}
                                           onBlur={handleBlur}
                                           error={touchedPassword.confirm_new_password && Boolean(passwordHelperTexts.confirm_new_password)}
                                           helperText={touchedPassword.confirm_new_password && passwordHelperTexts.confirm_new_password}
                                />
                            </Grid>

                        </Grid>
                    </Box>
                </Paper>
            </Container>
        </>
    )
}