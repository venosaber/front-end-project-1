import {FHeader} from "../../components";
import {Box, Button, Container, Grid, Paper, TextField, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {type ChangeEvent, type FocusEvent, type FormEvent, useState} from "react";

interface NewClassForm {
    name: string,
    code: string
}

function NewClass(){

    const navigate = useNavigate();

    const [formData, setFormData] = useState<NewClassForm>({
        name: '',
        code: ''
    });

    const [helperTexts, setHelperTexts] = useState<NewClassForm>({
        name: '',
        code: ''
    });

    const [touched, setTouched] = useState({
        name: false,
        code: false
    });

    const validate = {
        name: (value: string) => {
            if (!value) {
                setHelperTexts(prev => ({...prev, name: 'Vui lòng nhập tên lớp học!'}));
                return false;
            }
            setHelperTexts(prev => ({...prev, name: ''}));
            return true;
        },

        code: (value: string) => {
            if (!value) {
                setHelperTexts(prev => ({...prev, code: 'Vui lòng nhập mã bảo vệ!'}));
                return false;
            }
            if (value.length < 6) {
                setHelperTexts(prev => ({...prev, code: 'Vui lòng nhập tối thiểu 6 ký tự!'}));
                return false;
            }

            setHelperTexts(prev => ({...prev, code: ''}));
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
        validate[name as keyof NewClassForm](value);
    }

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        validate[name as keyof NewClassForm](value);
    }

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // set all touched to true
        const curTouched = {...touched};
        Object.keys(touched).forEach((key) => {
            curTouched[key as keyof NewClassForm] = true;
        })
        setTouched(curTouched);

        // check valid
        const isValid: boolean =
            validate.name(formData.name) &&
            validate.code(formData.code);

        if (!isValid){
            return;
        }

        // submit logic
    }

    const onCancel = () => {
        setFormData({name: '', code: ''});
        setHelperTexts({name: '', code: ''});
        setTouched({name: false, code: false});
        navigate('/classes');
    }

    return (
        <>
            <FHeader/>
            <Container maxWidth={false}
                       sx={{
                           mt: '64px', backgroundColor: '#f0f2f5',
                           minHeight: 'calc(100vh - 64px)', p: 3,
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

                        {/* Headings */}
                        <Typography component={'h1'} variant={'h4'}
                                    sx={{
                                        fontWeight: 'bold',
                                        mb: 1,
                                        color: 'text.primary',
                                        textAlign: 'center'
                                    }}>
                            Thêm lớp học mới
                        </Typography>

                        {/*  Register form  */}
                        <Box component={'form'} sx={{width: '100%'}}
                             onSubmit={onSubmit}
                        >
                            <Typography>Tên lớp học <span style={{color:'#ff0000'}}>*</span></Typography>
                            <TextField fullWidth size={'small'} sx={{my: 1}}
                                       placeholder={"Nhập tên lớp học"}

                                       name={"name"}
                                       value={formData.name}
                                       onChange={onChange}
                                       onBlur={handleBlur}
                                       error={touched.name && Boolean(helperTexts.name)}
                                       helperText={touched.name && helperTexts.name}
                            />

                            <Typography>Mã bảo vệ <span style={{color:'#ff0000'}}>*</span></Typography>
                            <TextField fullWidth size={'small'} sx={{my: 1}}
                                       placeholder={"Nhập mã bảo vệ"}

                                       name={"code"}
                                       value={formData.code}
                                       onChange={onChange}
                                       onBlur={handleBlur}
                                       error={touched.code && Boolean(helperTexts.code)}
                                       helperText={touched.code && helperTexts.code}
                            />

                            {/* Buttons */}
                            <Grid container sx={{mt: 2, mb: 2,
                            display: 'flex', justifyContent: 'center', alignItems: 'center'}} spacing={2}>
                                <Grid size={{xs: 4}}>
                                    <Button
                                        fullWidth variant={'outlined'}
                                        color={'primary'} sx={{fontWeight: '600', borderRadius: 2}}
                                        onClick={onCancel}
                                    >Hủy</Button>
                                </Grid>

                                <Grid size={{xs: 4}}>
                                    <Button
                                        fullWidth variant={'contained'}
                                        color={'primary'} sx={{fontWeight: '600', borderRadius: 2}}
                                        type={'submit'}
                                    >
                                        Tạo mới</Button>
                                </Grid>
                            </Grid>

                        </Box>

                    </Box>

                </Paper>
            </Container>
        </>
    )
}

export default NewClass;