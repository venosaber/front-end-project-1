import './style.css'
import {Box, Button, Container, Grid, Paper, TextField, Typography} from "@mui/material";
import {LogoElement} from "../../components";
import {type ChangeEvent, type FormEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import type {FocusEvent} from "react";

interface RegisterForm {
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
}

function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [helperTexts, setHelperTexts] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const validate = {
        name: (value: string) => {
            if (!value) {
                setHelperTexts(prev => ({...prev, name: 'Vui lòng nhập tên của bạn!'}));
                return false;
            }
            setHelperTexts(prev => ({...prev, name: ''}));
            return true;
        },

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
        },
        confirmPassword: (value: string) => {
            if (!value) {
                setHelperTexts(prev => ({...prev, confirmPassword: 'Vui lòng nhập lại mật khẩu!'}));
                return false;
            }
            if (formData.password && value !== formData.password) {
                setHelperTexts(prev => ({...prev, confirmPassword: 'Mật khẩu nhập lại phải trùng khớp!'}));
                return false;
            }

            setHelperTexts(prev => ({...prev, confirmPassword: ''}));
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
        validate[name as keyof RegisterForm](value);
    }

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        validate[name as keyof RegisterForm](value);
    }

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // set all touched to true
        const curTouched = {...touched};
        Object.keys(touched).forEach((key) => {
            curTouched[key as keyof RegisterForm] = true;
        })
        setTouched(curTouched);

        // check valid
        const isValid: boolean =
            validate.name(formData.name) &&
            validate.email(formData.email) &&
            validate.password(formData.password) &&
            validate.confirmPassword(formData.confirmPassword);

        if (!isValid){
            return;
        }


        // submit logic
    }

    const onCancel = () => {
        setFormData({name: '', email: '', password: '', confirmPassword: ''});
        setHelperTexts({name: '', email: '', password: '', confirmPassword: ''});
        setTouched({name: false, email: false, password: false, confirmPassword: false});
        navigate('/login');
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
                       p: 2
                   }}
        >
            <Paper sx={{
                width: "100%",
                maxWidth: "600px",

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
                    {/* Logo */}
                    <LogoElement/>

                    {/* Headings */}
                    <Typography component={'h1'} variant={'h4'}
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 1,
                                    color: 'text.primary',
                                    textAlign: 'center'
                                }}>
                        Đăng kí học viên
                    </Typography>

                    {/*  Register form  */}
                    <Box component={'form'} sx={{width: '100%'}}
                         onSubmit={onSubmit}
                    >
                        <Typography>Tên của bạn</Typography>
                        <TextField fullWidth size={'small'} sx={{my: 1}}
                                   placeholder={"Nhập tên của bạn"}

                                   name={"name"}
                                   value={formData.name}
                                   onChange={onChange}
                                   onBlur={handleBlur}
                                   error={touched.name && Boolean(helperTexts.name)}
                                   helperText={touched.name && helperTexts.name}
                        />

                        <Typography>Địa chỉ email</Typography>
                        <TextField fullWidth size={'small'} sx={{my: 1}}
                                   placeholder={"Nhập địa chỉ email"}

                                   name={"email"}
                                   value={formData.email}
                                   onChange={onChange}
                                   onBlur={handleBlur}
                                   error={touched.email && Boolean(helperTexts.email)}
                                   helperText={touched.email && helperTexts.email}
                        />

                        <Typography>Mật khẩu</Typography>
                        <TextField fullWidth size={'small'} sx={{my: 1}}
                                   placeholder={"Nhập mật khẩu"}
                                   type={"password"}

                                   name={"password"}
                                   value={formData.password}
                                   onChange={onChange}
                                   onBlur={handleBlur}
                                   error={touched.password && Boolean(helperTexts.password)}
                                   helperText={touched.password && helperTexts.password}
                        />

                        <Typography>Nhập lại mật khẩu</Typography>
                        <TextField fullWidth size={'small'} sx={{my: 1}}
                                   placeholder={"Nhập lại mật khẩu"}
                                   type={"password"}

                                   name={"confirmPassword"}
                                   value={formData.confirmPassword}
                                   onChange={onChange}
                                   onBlur={handleBlur}
                                   error={touched.confirmPassword && Boolean(helperTexts.confirmPassword)}
                                   helperText={touched.confirmPassword && helperTexts.confirmPassword}
                        />

                        {/* Buttons */}
                        <Grid container sx={{mt: 2, mb: 2}} spacing={2}>
                            <Grid size={{xs: 6}}>
                                <Button
                                    fullWidth variant={'outlined'}
                                    color={'primary'}
                                    onClick={onCancel}
                                    >Hủy</Button>
                            </Grid>

                            <Grid size={{xs: 6}}>
                                <Button
                                    fullWidth variant={'contained'}
                                    color={'primary'}
                                    type={'submit'}
                                >
                                    Đăng ký</Button>
                            </Grid>
                        </Grid>

                    </Box>

                </Box>

            </Paper>
        </Container>
    )
}

export default RegisterPage;