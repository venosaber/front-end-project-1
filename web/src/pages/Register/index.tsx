import './style.css'
import {
    Box,
    Button,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import {LogoElement} from "../../components";
import {type ChangeEvent, type FormEvent, useState} from "react";
import {useNavigate} from "react-router-dom";
import type {FocusEvent, MouseEvent} from "react";
import {postMethod} from "../../utils/api.ts";
import {toast} from 'react-toastify'
import {Visibility, VisibilityOff} from '@mui/icons-material';
import Select, {type SelectChangeEvent } from '@mui/material/Select';

interface RegisterForm {
    name: string,
    email: string,
    role: string,
    password: string,
    confirmPassword: string,
}

interface TouchedProps {
    [key: string]: boolean,
}

function RegisterPage() {
    const navigate = useNavigate();
    const [showSuccessful, setShowSuccessful] = useState<boolean>(false);

    /*************** form & validation *****************/
    const [formData, setFormData] = useState<RegisterForm>({
        name: '',
        email: '',
        role: 'student',
        password: '',
        confirmPassword: ''
    });

    const [helperTexts, setHelperTexts] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [touched, setTouched] = useState<TouchedProps>({
        name: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const validate: {[name: string]: (value: string) => boolean} = {
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
        validate[name](value);
    }

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        validate[name as keyof RegisterForm](value);
    }

    const onChangeRole = (e: SelectChangeEvent) => {
        setFormData({
            ...formData,
            role: e.target.value
        })
    }

    /*********** show - hide password **************/
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show: boolean) => !show);

    const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const handleMouseUpPassword = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    /******************* register logic *********************/

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // set all touched to true
        const curTouched = {...touched};
        Object.keys(touched).forEach((key) => {
            curTouched[key] = true;
        })
        setTouched(curTouched);

        // check valid
        const isValid: boolean =
            validate.name(formData.name) &&
            validate.email(formData.email) &&
            validate.password(formData.password) &&
            validate.confirmPassword(formData.confirmPassword);

        if (!isValid) return;

        // submit logic
        const payload = {
            ...formData,
            status: 'confirmed'
        }
        const response = await postMethod('/master/user', payload);
        if(!response){
            toast.error('Đăng ký mới thất bại, hãy thử lại!');
        }else{
            setShowSuccessful(true);
        }
    }

    const onNavigateToLogin = ()=> navigate('/login');

    const onCancel = () => {
        setFormData({name: '', email: '', password: '', confirmPassword: '', role: 'student'});
        setHelperTexts({name: '', email: '', password: '', confirmPassword: ''});
        setTouched({name: false, email: false, password: false, confirmPassword: false});
        onNavigateToLogin();
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
                        Đăng kí thành viên
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

                        <Box sx={{display: 'flex', alignItems: 'center', gap: '10px', mb: 2, mt: 2}}>
                            <Typography sx={{flexGrow: 1, flexShrink: 0}}>Bạn là: </Typography>
                            <Select fullWidth
                                    size={'small'}
                                    name={'role'}
                                    onChange={onChangeRole}
                                    value={formData.role}
                                    sx={{textAlign: 'center'}}
                            >
                                <MenuItem value={'student'}>Học sinh</MenuItem>
                                <MenuItem value={'teacher'}>Giáo viên</MenuItem>
                            </Select>
                        </Box>


                        <Typography>Mật khẩu</Typography>
                        <TextField fullWidth size={'small'} sx={{my: 1}}
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

            {
                showSuccessful && <OverlayAndDialog onNavigate={onNavigateToLogin} />
            }

        </Container>
    )
}

export default RegisterPage;

function OverlayAndDialog({onNavigate}: {onNavigate: ()=> void}){
    return (
        <>
            {/* Dark transparent overlay */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
            }} />

            {/* Dialog content */}
            <Box sx={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '450px',
                backgroundColor: 'background.paper',
                borderRadius: '10px',
                zIndex: 1001,
                p: 2,
                textAlign: 'center',
            }}>
                <Typography variant="h5" component="h2" sx={{
                    color: '#4caf50',
                    fontWeight: 'bold',
                    mb: 2
                }}>
                    Thành công
                </Typography>

                <Typography sx={{ mb: 3 }}>
                    Tạo tài khoản thành công, quay lại trang đăng nhập
                </Typography>

                <Button
                    variant="contained"
                    fullWidth
                    sx={{ mb: 1, backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
                    onClick={onNavigate}
                >
                    Quay lại đăng nhập
                </Button>
            </Box>
        </>
    )
}