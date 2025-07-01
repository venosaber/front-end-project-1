import {FHeader} from '../../components'
import {Container, Box, Typography, TextField, InputAdornment, Button} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {CourseGrid} from '../../components';
import type {Course} from '../../utils/types';

import {useState, useEffect} from 'react';
import {Loading} from '../../components';
import {useAuthGuard} from "../../utils/useAuthGuard.ts";
import {getMethod} from "../../utils/api.ts";
import {useNavigate} from "react-router-dom";

function Classes() {
    const navigate = useNavigate();
    const handleAddCourseClick = () => {
        navigate('/class/add');
    }

    const [courses, setCourses] = useState<Course[]>([]);

    // always get the newest accessToken
    const {loading, accessToken} = useAuthGuard();
    useEffect(() => {
        const onMounted = async () => {
            try{
                const coursesData: Course[] = await getMethod('/master/class', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                setCourses(coursesData);
            }catch (err) {
                console.error("Error on loading courses: ",err);
            }
        }

        if(!loading) onMounted();
    }, [loading, accessToken]);

    if(loading) return <Loading />

    return (
        <>
            <FHeader/>
            <Container maxWidth={false}
                       sx={{
                           mt: '64px', backgroundColor: '#f0f2f5',
                           minHeight: 'calc(100vh - 64px)', p: 3
                       }}>

                {/* Page title & controls */}
                <Box sx={{display: {md: 'flex'}, alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                    <Typography variant="h5" component="h1" gutterBottom sx={{fontWeight: 'bold', color: '#333'}}>
                        Danh sách lớp học
                    </Typography>

                    <Box sx={{ml: 'auto', mr: 2, my: 2, minWidth: '300px'}}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Tìm kiếm"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                },
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{color: 'action.active'}}/>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </Box>

                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon/>}
                            onClick={handleAddCourseClick}
                            sx={{
                                backgroundColor: '#f7c32e',
                                color: '#333',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                '&:hover': {
                                    backgroundColor: '#e0b028',
                                },
                            }}
                        >
                            Thêm lớp học
                        </Button>
                    </Box>
                </Box>

                {/* Course grid */}
                <Box sx={{mt: 3}}>
                    <CourseGrid courses={courses}/>
                </Box>
            </Container>
        </>
    )
}

export default Classes;