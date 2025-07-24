import {FHeader} from '../../components'
import {Container, Box, Typography, TextField, InputAdornment, Button} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import {CourseGrid} from '../../components';
import type {Course} from '../../utils/types';

import {useState, useEffect, useMemo} from 'react';
import type {ChangeEvent} from 'react';
import {Loading} from '../../components';
import {getMethod} from "../../utils/api.ts";
import {useNavigate} from "react-router-dom";
import {getUserInfo, getValidAccessToken} from "../../router/auth.ts";

function Classes() {
    const navigate = useNavigate();
    const handleAddCourseClick = () => {
        navigate('/class/add');
    }

    const [user, setUser] = useState({name: '', role: ''});
    const displayAddClassButton = user.role === 'teacher'?'inline-flex':'none';
    const [courses, setCourses] = useState<Course[]>([]);

    const [searchStr, setSearchStr] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const filteredCourses: Course[] = useMemo(()=> courses.filter(course => {
        return course.name.toLowerCase().includes(searchStr.toLowerCase());
    }),[courses, searchStr]);

    useEffect(() => {
        const onMounted = async () => {
            const accessToken: string | null = await getValidAccessToken();
            if(!accessToken){
                console.error("No valid access token, redirecting to login page");
                navigate('/login');
                return;
            }

            const {name, role} = getUserInfo(accessToken);
            setUser({name, role});

            try{
                const coursesData: Course[] = await getMethod('/master/class', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                setCourses(coursesData);
            }catch (err) {
                console.error("Error on loading courses: ",err);
            }finally {
                setIsLoading(false);
            }
        }

        onMounted();
    }, []);

    if(isLoading) return <Loading />

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
                            value={searchStr}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchStr(e.target.value)}
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
                                display: displayAddClassButton
                            }}
                        >
                            Thêm lớp học
                        </Button>
                    </Box>
                </Box>

                {/* Course grid */}
                <Box sx={{mt: 3}}>
                    <CourseGrid courses={filteredCourses}/>
                </Box>
            </Container>
        </>
    )
}

export default Classes;