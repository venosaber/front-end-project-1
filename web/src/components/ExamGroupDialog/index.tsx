import {Box, Button, Grid, TextField, Typography} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {type ChangeEvent, type FocusEvent, type FormEvent, useState, useEffect} from "react";
import type {PickerValue} from "@mui/x-date-pickers/internals";
import {getValidAccessToken} from "../../router/auth.ts";
import {deleteMethod, postMethod, putMethod} from "../../utils/api.ts";
import {toast} from "react-toastify";
import type {ExamGroup} from "../../utils/types";
import {useNavigate} from "react-router-dom";

interface ExamGroupDialogProps {
    courseId: number,
    isOpenDialog: boolean,
    setIsOpenDialog: (isOpenDialog: boolean) => void,
    isDeleting: boolean,
    setIsDeleting: (isDeleting: boolean) => void,
    examGroup?: ExamGroup,
    onMounted: () => void,
}

interface ExamGroupForm {
    name: string,
    awaitTime: string,
    startTime: string
}

export default function ExamGroupDialog({
                                            courseId,
                                            isOpenDialog,
                                            setIsOpenDialog,
                                            isDeleting,
                                            setIsDeleting,
                                            examGroup,
                                            onMounted
                                        }: ExamGroupDialogProps) {
    const isEditMode: boolean = examGroup !== undefined;
    const navigate = useNavigate();

    const handleCloseDialog = () => {
        setIsOpenDialog(false);
    }

    /*************** form & validation *****************/
    const [formData, setFormData] = useState<ExamGroupForm>({
        name: '',
        awaitTime: '',
        startTime: ''
    });

    useEffect(() => {
        setFormData({
            name: examGroup?.name ?? '',
            awaitTime: examGroup ? String(examGroup.await_time / 60) : '',
            startTime: examGroup?.start_time ?? ''
        })
    }, [examGroup])

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
            class_id: courseId,
            start_time: formData.startTime,
            await_time: Number(formData.awaitTime) * 60,
            is_once: true,
            is_save_local: true
        }
        const accessToken: string | null = await getValidAccessToken();
        let response;
        if (!isEditMode) {
            response = await postMethod('/exam_group', payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
        } else {
            response = await putMethod(`/exam_group/${examGroup?.id}`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
        }
        if (!response) {
            toast.error('Tạo bài thi thất bại, hãy thử lại!');
        } else {
            toast.success('Tạo bài thi thành công!');
            handleCloseDialog();
            setFormData({name: '', awaitTime: '', startTime: ''});
            onMounted();    // update the UI
        }
    }

    const onDelete = async () => {
        const accessToken: string | null = await getValidAccessToken();
        const response = await deleteMethod(`/exam_group/${examGroup?.id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        setIsDeleting(false);
        handleCloseDialog();
        if (!response) {
            toast.error('Có lỗi khi xóa! Hãy thử lại!');
        } else {
            toast.success('Xóa thành công! ');
            navigate(`/class/${courseId}/exam`);
        }
    }

    return (
        <>
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
                    {isDeleting
                        ? "Xóa bài thi"
                        : isEditMode
                            ? "Chỉnh sửa bài thi"
                            : "Tạo bài thi mới"}
                </Typography>

                {/*  Exam group creation form  */}
                <Box component={'form'} sx={{width: '100%'}}
                     onSubmit={onSubmit}
                     display={!isDeleting ? 'block' : 'none'}
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
                                {isEditMode ? "Chỉnh sửa" : "Tạo mới"}
                            </Button>
                        </Grid>

                        <Grid size={{xs: 6}}>
                            <Button
                                fullWidth variant={'outlined'}
                                color={'primary'}
                                onClick={handleCloseDialog}
                            >
                                Hủy
                            </Button>
                        </Grid>

                    </Grid>

                </Box>

                {/*  Exam group deletion form  */}
                <Box sx={{width: '100%'}}
                     display={isDeleting ? 'block' : 'none'}
                >
                    <Typography>Bạn có chắc chắn muốn xóa bài thi này không?</Typography>
                    {/* Buttons */}
                    <Grid container sx={{mt: 2, mb: 2}} spacing={2}>

                        <Grid size={{xs: 6}}>
                            <Button
                                fullWidth variant={'contained'}
                                color={'error'}
                                onClick={onDelete}
                            >
                                Xóa
                            </Button>
                        </Grid>

                        <Grid size={{xs: 6}}>
                            <Button
                                fullWidth variant={'outlined'}
                                color={'primary'}
                                onClick={() => {
                                    setIsDeleting(false);
                                    handleCloseDialog();
                                    }
                                }
                            >
                                Hủy
                            </Button>
                        </Grid>

                    </Grid>

                </Box>

            </Box>
        </>
    )
}