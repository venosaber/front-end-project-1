import {Box, Button, Container, Typography} from "@mui/material";
import {LogoElement} from "../../components";
import {useNavigate} from "react-router-dom";

export default function Index() {
    const navigate = useNavigate();

    return (
        <Container maxWidth={false}
                   component={"main"}
                   sx={{
                       minHeight: "100vh",
                       display: "flex",
                       justifyContent: "center",
                       alignItems: "center",
                       backgroundColor: "#f0f0f0",
                       p: {xs: 2, md: 4}
                   }}
        >
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
                <LogoElement/>
                <Typography component={"h1"} variant={"h4"} color={'primary'} fontWeight={600} my={1}>
                    BKStar Classroom
                </Typography>
                <Typography component={"h2"} variant={"h5"} fontWeight={600} my={1}>
                    Cung cấp giải pháp học tập một cách hiệu quả
                </Typography>
                <Typography component={"p"} variant={"h6"}>
                    Đa dạng bài tập và đề thi, quản lí theo lớp học.<br/>
                    Làm bài thi trực tuyến, hệ thống chấm bài tự động.
                </Typography>
                <Box sx={{display: 'flex', alignItems: 'center', gap: '20px', my: 2}}>
                    <Button variant={'outlined'}
                            sx={{p: 2, border: '2px solid #0000ff', width: '200px'}}
                            size={'large'}
                            onClick={()=>navigate('/login')}>
                        <Typography variant={'body1'} sx={{color: '#0000ff'}}>Đăng nhập</Typography>
                    </Button>

                    <Button variant={'contained'}
                            sx={{p: 2, border: '2px solid #0000ff', backgroundColor: '#0000ff', width: '200px'}}
                            size={'large'}
                            onClick={()=>navigate('/register')}>
                        <Typography variant={'body1'} sx={{color: '#ffffff'}}>Đăng ký</Typography>
                    </Button>
                </Box>
            </Box>
        </Container>
    )
}