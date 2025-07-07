import {type FocusEvent, type FormEvent, useEffect, useState} from 'react';
import type {ChangeEvent} from 'react';
import {Box, Button, Grid, InputAdornment, Paper, TextField, Typography} from '@mui/material';
import {Add as AddIcon, Description as DescriptionIcon, Search as SearchIcon} from '@mui/icons-material';
import type {ExamGroup, Course} from '../../utils/types';
import {styled} from "@mui/material/styles";

import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type {PickerValue} from "@mui/x-date-pickers/internals";
import {getMethod, postMethod} from "../../utils/api.ts";
import {toast} from "react-toastify";
import {getValidAccessToken} from "../../router/auth.ts";
import {useNavigate} from "react-router-dom"

interface ExamsContentProps {
    course: Course
}

interface ExamGroupForm {
    name: string,
    awaitTime: string,
    startTime: string
}

export default function ExamsContent({course}: ExamsContentProps) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const [isOpenDialog, setIsOpenDialog] = useState(false);

    // Handle search input change
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleCreateTest = () => {
        setIsOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setIsOpenDialog(false);
        setFormData({name: '', awaitTime: '', startTime: ''});

    }

    /*************** form & validation *****************/
    const [formData, setFormData] = useState<ExamGroupForm>({
        name: '',
        awaitTime: '',
        startTime: ''
    });

    const [helperTexts, setHelperTexts] = useState({
        name: '',
        awaitTime: '',
        startTime: ''
    });

    const [touched, setTouched] = useState({
        name: false,
        awaitTime: false,
        startTime: false
    });

    const validate = {
        name: (value: string) => {
            if (!value) {
                setHelperTexts(prev => ({...prev, name: 'Vui lòng nhập tên bài thi!'}));
                return false;
            }
            setHelperTexts(prev => ({...prev, name: ''}));
            return true;
        },

        awaitTime: (value: string) => {
            if (!value) {
                setHelperTexts(prev => ({...prev, awaitTime: 'Vui lòng nhập thời gian!'}));
                return false;
            }

            if (isNaN(Number(value))) {
                setHelperTexts(prev => ({...prev, awaitTime: 'Phải nhập giá trị số!'}));
                return false;
            }

            setHelperTexts(prev => ({...prev, awaitTime: ''}));
            return true;
        },

        startTime: (value: string) => {
            if (!value) {
                setHelperTexts(prev => ({...prev, startTime: 'Vui lòng nhập thời gian bắt đầu!'}));
                return false;
            }

            setHelperTexts(prev => ({...prev, startTime: ''}));
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
        validate[name as keyof ExamGroupForm](value);
    }

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        validate[name as keyof ExamGroupForm](value);
    }

    const onChangeStartTime = (newValue: PickerValue) => {
        setFormData({
            ...formData,
            startTime: newValue?.format('YYYY-MM-DD') ?? ''
        })

        validate.startTime(newValue?.format('YYYY-MM-DD') ?? '');
    }

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // set all touched to true
        const curTouched = {...touched};
        Object.keys(touched).forEach((key: string) => {
            curTouched[key as keyof ExamGroupForm] = true;
        })
        setTouched(curTouched);

        // check valid
        const isValid: boolean =
            validate.name(formData.name) &&
            validate.awaitTime(formData.awaitTime) &&
            validate.startTime(formData.startTime);

        if (!isValid) return;

        // submit logic
        const payload = {
            name: formData.name,
            class_id: course.id,
            start_time: formData.startTime,
            await_time: Number(formData.awaitTime) * 60,
            is_once: true,
            is_save_local: true
        }
        const accessToken: string | null = await getValidAccessToken();
        const response = await postMethod('/exam_group', payload,{
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        if(!response){
            toast.error('Tạo bài thi thất bại, hãy thử lại!');
        }else{
            toast.success('Tạo bài thi thành công!');
            handleCloseDialog();
            setFormData({name: '', awaitTime: '', startTime: ''});
            await onMounted();
        }
    }

    const [examGroups, setExamGroups] = useState<ExamGroup[]>([]);
    const openExamGroups: ExamGroup[] = examGroups.filter(examGroup => new Date(examGroup.start_time) <= new Date());
    const notOpenExamGroups: ExamGroup[] = examGroups.filter(examGroup => new Date(examGroup.start_time) > new Date());
    const onMounted = async ()=> {
        const accessToken: string | null = await getValidAccessToken();
        if(!accessToken){
            console.error("No valid access token, redirecting to login page");
            navigate('/login');
            return;
        }
        const examGroupsData: ExamGroup[] = await getMethod(`/exam_group?class_id=${course.id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        setExamGroups(examGroupsData);
    }

    useEffect(() => {
        onMounted();
    }, []);

    return (
        <>
            <Box sx={{p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
                {/* Header with search and create button */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                }}>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        Danh sách Bài thi
                    </Typography>

                    <Box sx={{display: 'flex', gap: 2}}>
                        <TextField
                            placeholder="Tìm kiếm"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action"/>
                                    </InputAdornment>
                                ),
                                sx: {
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#90caf9',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#42a5f5',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#42a5f5',
                                    },
                                },
                            }}
                            sx={{width: 300, backgroundColor: "#fff"}}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon/>}
                            onClick={handleCreateTest}
                        >
                            Tạo bài thi
                        </Button>
                    </Box>
                </Box>

                {/* Active Tests Section */}
                <Box sx={{mb: 4}}>
                    <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        color="primary"
                        sx={{mb: 2}}
                    >
                        Bài thi đang diễn ra
                    </Typography>

                    <ExamGroupsGrid examGroups={openExamGroups}/>

                </Box>

                {/* Not Active Tests Section */}
                <Box>
                    <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        color="primary"
                        sx={{mb: 2}}
                    >
                        Bài thi chưa bắt đầu
                    </Typography>

                    <ExamGroupsGrid examGroups={notOpenExamGroups}/>

                </Box>
            </Box>

            {/* Dark transparent overlay */}
            <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                zIndex: 1000,

                display: isOpenDialog ? 'block' : 'none'
            }}
                 onClick={handleCloseDialog}
            />

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

                display: isOpenDialog ? 'block' : 'none'
            }}>
                <Typography variant="h5" component="h2" sx={{
                    fontWeight: 'bold',
                    mb: 1
                }}>
                    Tạo bài thi mới
                </Typography>

                {/*  Exam group creation form  */}
                <Box component={'form'} sx={{width: '100%'}}
                     onSubmit={onSubmit}
                >
                    <Typography>Tên bài thi <span style={{color: "#ff0000"}}>*</span></Typography>
                    <TextField fullWidth size={'small'} sx={{my: 1}}
                               placeholder={"Nhập tên bài thi"}

                               name={"name"}
                               value={formData.name}
                               onChange={onChange}
                               onBlur={handleBlur}
                               error={touched.name && Boolean(helperTexts.name)}
                               helperText={touched.name && helperTexts.name}
                    />

                    <Typography>Thời gian giữa các bài thi (phút)
                        <span style={{color: "#ff0000"}}> *</span></Typography>
                    <TextField fullWidth size={'small'} sx={{my: 1}}
                               placeholder={"Nhập thời gian"}

                               name={"awaitTime"}
                               value={formData.awaitTime}
                               onChange={onChange}
                               onBlur={handleBlur}
                               error={touched.awaitTime && Boolean(helperTexts.awaitTime)}
                               helperText={touched.awaitTime && helperTexts.awaitTime}
                    />

                    <Typography>Thời gian bắt đầu <span style={{color: "#ff0000"}}>*</span></Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            name={"startTime"}
                            value={formData.startTime ? dayjs(formData.startTime, 'YYYY-MM-DD') : null}
                            onChange={onChangeStartTime}
                            // CSS to look like TextField
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    error: touched.startTime && Boolean(helperTexts.startTime),
                                    helperText: touched.startTime && helperTexts.startTime,
                                    sx: {my: 1}
                                }
                            }}
                        />
                    </LocalizationProvider>

                    {/* Buttons */}
                    <Grid container sx={{mt: 2, mb: 2}} spacing={2}>

                        <Grid size={{xs: 6}}>
                            <Button
                                fullWidth variant={'contained'}
                                color={'primary'}
                                type={'submit'}
                            >
                                Tạo mới</Button>
                        </Grid>

                        <Grid size={{xs: 6}}>
                            <Button
                                fullWidth variant={'outlined'}
                                color={'primary'}
                                onClick={handleCloseDialog}
                            >Hủy</Button>
                        </Grid>

                    </Grid>

                </Box>

            </Box>
        </>
    );
}

function ExamGroupsGrid({examGroups}: { examGroups: ExamGroup[] }) {
    const Item = styled(Paper)(({theme}) => ({
        backgroundColor: '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: (theme.vars ?? theme).palette.text.secondary,
        ...theme.applyStyles('dark', {
            backgroundColor: '#1A2027',
        }),
    }));

    return (
        <>
            <Grid container spacing={2}>
                {examGroups.length === 0 && (<>0</>)}
                {examGroups.map((examGroup: ExamGroup) => (
                    <Grid size={{xs: 12, md: 6, lg: 4}} key={examGroup.id} sx={{borderLeft: '5px solid #0000ff'}}>
                        <Item>
                            <Paper elevation={0}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '20px',
                                        p: 2,
                                        mr: 2
                                    }}
                                >
                                    <DescriptionIcon
                                        sx={{
                                            fontSize: 48,
                                            color: '#3498db'
                                        }}
                                    />

                                    <Box>
                                        <Typography variant='body1' fontWeight="medium" textAlign="left"
                                                    sx={{mb: 1}}>
                                            {examGroup.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary"
                                                    fontWeight={'medium'}>
                                            Ngày bắt đầu: {examGroup.start_time}
                                        </Typography>
                                    </Box>
                                </Box>

                            </Paper>
                        </Item>
                    </Grid>
                ))}
            </Grid>
        </>
    )
}