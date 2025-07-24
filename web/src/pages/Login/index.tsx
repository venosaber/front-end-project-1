import {Box, Button, Card, CardMedia, Checkbox, Container,
    FormControlLabel, Grid, Paper, TextField, Typography
} from "@mui/material";
import './style.css'
import {type ChangeEvent, type FocusEvent, type FormEvent, type MouseEvent} from "react";
import {useState} from "react";
import {LogoElement} from "../../components";
import {useNavigate} from "react-router-dom";
import {IconButton, InputAdornment} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";

import {postMethod} from "../../utils/api";
import {setCookie, getUserInfo} from "../../router/auth.ts";
import { toast } from 'react-toastify';

interface LoginForm {
    email: string,
    password: string,
}

function LoginPage() {
    const navigate = useNavigate();

    /************** form & validation ****************/
    const [formData, setFormData] = useState<LoginForm>({
        email: '',
        password: ''
    });

    const [helperTexts, setHelperTexts] = useState<LoginForm>({
        email: '',
        password: ''
    });

    const [touched, setTouched] = useState({
        email: false,
        password: false
    });

    const validate = {
        email: (value: string) => {
            if (!value) {
                setHelperTexts(prev => ({...prev, email: 'Vui lòng nhập email!'}));
                return false;
            }

            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailRegex.test(value)) {
                setHelperTexts(prev => ({...prev, email: 'Địa chỉ email không hợp lệ!'}));
                return false;
            }

            setHelperTexts(prev => ({...prev, email: ''}));
            return true;
        },
        password: (value: string) => {
            if (!value) {
                setHelperTexts(prev => ({...prev, password: 'Vui lòng nhập mật khẩu!'}));
                return false;
            }
            if (value.length < 6) {
                setHelperTexts(prev => ({...prev, password: 'Vui lòng nhập tối thiểu 6 ký tự!'}));
                return false;
            }

            setHelperTexts(prev => ({...prev, password: ''}));
            return true;
        }
    }

    const onBlur = (e: FocusEvent<HTMLInputElement>) => {
        setTouched({
            ...touched,
            [e.target.name]: true
        })
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        onBlur(e);
        validate[name as keyof LoginForm](value);
    }

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        validate[name as keyof LoginForm](value);
    }

    /************** show - hide password *****************/
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show: boolean) => !show);

    const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const handleMouseUpPassword = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    /*************** login *************/
    const [rememberMe, setRememberMe] = useState(false);

    const login = async () => {
        const payload = {
            email: formData.email,
            password: formData.password
        }
        const response = await postMethod('/login', payload);
        if(!response){
            toast.error('Sai email hoặc mật khẩu!');
        } else {
            toast.success('Đăng nhập thành công!');
            const {access: accessToken, refresh: refreshToken} = response;
            /********* save tokens in cookie ********/
            const now: number = Math.floor(Date.now() / 1000);

            const {exp} = getUserInfo(accessToken); // decode JWT token
            const maxAge: number = exp - now;
            setCookie('accessToken', accessToken, maxAge);

            // "remember me" feature
            if(rememberMe){
                const refreshMaxAgeMs: number = 7 * 24 * 60 * 60 * 1000; // a week
                const expiresAt: number = now + refreshMaxAgeMs;
                localStorage.setItem('refreshTokenExpiresAt', expiresAt.toString());

                setCookie('refreshToken', refreshToken, refreshMaxAgeMs/1000);
                localStorage.setItem('rememberMe', 'true');
            }else{
                setCookie('refreshToken', refreshToken);  // session cookie
                localStorage.removeItem('rememberMe');
            }
        }

    }

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // set all touched to true
        const curTouched = {...touched};
        Object.keys(touched).forEach((key) => {
            curTouched[key as keyof LoginForm] = true;
        })
        setTouched(curTouched);

        // check valid
        const isValid: boolean = validate.email(formData.email) && validate.password(formData.password);
        if (!isValid) {
            return;
        }

        await login();
        navigate('/classes');
    }

    return (
        <Container maxWidth={false}
                   component={"main"}
                   sx={{
                       minHeight: "100vh",
                       display: "flex",
                       justifyContent: "center",
                       alignItems: "center",
                       backgroundColor: "#e0ffff",
                       p: {xs: 2, md: 4}
                   }}
        >
            <Paper sx={{
                width: "100%",
                maxWidth: "1000px",

                borderRadius: "10px",
                overflow: "hidden", // to remain effect of border-radius with child grid items
                boxShadow: "0 0 10px #000000"
            }}>
                <Grid container sx={{height: "100%"}}>
                    {/*left part*/}
                    {/* xs: 0 -> disappear on mobile screen, md: 6 -> 50% on tablets */}
                    <Grid size={{xs: 0, md: 6}}
                          sx={{
                              backgroundColor: 'rgb(49, 130, 206)',
                              color: 'rgb(255,255,255)',
                              pt: 10, pb: 10, pl: 5, pr: 5,

                              display: {xs: "none", md: "flex"},
                              flexDirection: "column",
                              justifyContent: "space-between"
                          }}
                    >

                        <Card sx={{maxWidth: 400, borderRadius: "16px"}}>
                            <CardMedia
                                sx={{height: 300}}
                                image={"/creativity.png"}
                                title="creative logo"
                            />
                        </Card>

                        <Box>
                            <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                                GIEO MẦM SÁNG TẠO...
                            </Typography>
                            <Typography variant="h6" sx={{fontWeight: 'bold', textAlign: "right"}}>
                                ... DẪN HƯỚNG ĐAM MÊ
                            </Typography>
                        </Box>
                    </Grid>

                    {/*right part*/}
                    {/* xs: 12 -> 100% on mobile screen, md: 6 -> 50% on tablets */}
                    <Grid size={{xs: 12, md: 6}}
                          sx={{height: "100%"}}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: {xs: 3, md: 5}
                        }}>

                            {/*logo*/}
                            <LogoElement/>

                            {/* Headings */}
                            <Box>
                                <Typography component={'h1'} variant={'h4'}
                                            sx={{
                                                fontWeight: 'bold',
                                                mb: 1,
                                                color: 'text.primary',
                                                textAlign: 'center'
                                            }}>
                                    Đăng nhập
                                </Typography>

                                <Typography variant={'body2'}
                                            sx={{color: 'text.secondary', textAlign: 'center', mb: 3}}
                                >
                                    Cung cấp giải pháp toàn diện cho <br />
                                    lớp học thông minh
                                </Typography>
                            </Box>

                            {/* Login form */}
                            <Box component={'form'} sx={{width: '100%'}}
                                 onSubmit={onSubmit}
                            >
                                <TextField
                                    fullWidth variant={"outlined"} margin={"normal"}
                                    placeholder={"Nhập email"}

                                    name={"email"}
                                    value={formData.email}
                                    onChange={onChange}
                                    onBlur={handleBlur}
                                    error={touched.email && Boolean(helperTexts.email)}
                                    helperText={touched.email && helperTexts.email}
                                />

                                <TextField
                                    fullWidth variant={"outlined"} margin={"normal"}
                                    placeholder={"Nhập mật khẩu"}

                                    name={"password"}
                                    value={formData.password}
                                    onChange={onChange}
                                    onBlur={handleBlur}
                                    error={touched.password && Boolean(helperTexts.password)}
                                    helperText={touched.password && helperTexts.password}

                                    type={showPassword ? 'text' : 'password'}
                                    slotProps={{
                                        input: {
                                            endAdornment:
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label={
                                                            showPassword ? 'hide the password' : 'display the password'
                                                        }
                                                        onClick={handleClickShowPassword}
                                                        onMouseDown={handleMouseDownPassword}
                                                        onMouseUp={handleMouseUpPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                    </IconButton>
                                                </InputAdornment>
                                        }
                                    }}
                                />

                                <FormControlLabel label="Ghi nhớ tôi"
                                                  control={
                                                      <Checkbox
                                                          checked={rememberMe}
                                                          onChange={(e: ChangeEvent<HTMLInputElement>)=>setRememberMe(e.target.checked)}
                                                      />}
                                />

                                <Button fullWidth type={'submit'} variant={'contained'}
                                        sx={{
                                            mt: 2, mb: 2, py: 1.5,
                                            borderRadius: '8px',
                                            fontWeight: 'bold'
                                        }}
                                >Đăng nhập</Button>

                                <Box sx={{textAlign: 'center'}}>
                                    <Button onClick={() => navigate('/register')}>
                                        Đăng ký tài khoản cho học viên</Button>
                                </Box>

                            </Box>

                        </Box>
                    </Grid>
                </Grid>

            </Paper>

        </Container>
    )
}

export default LoginPage;
