import type {StudentResultGroup, ExamResult} from "../../utils/types";
import {Grid, Box, Button, Typography} from "@mui/material";
import {AvatarDefault} from "..";

interface ResultGroupsListProps {
    studentResultGroups: StudentResultGroup[],
    numberOfExams: number,
    handleMark: (studentID: number)=> void
}

export default function ResultGroupsList({studentResultGroups, numberOfExams, handleMark}
                          : ResultGroupsListProps) {
    const countCompleted = (studentResultGroup: StudentResultGroup) => {
        return studentResultGroup.results.length;
    }

    // if a student's results group has at least one exam which has at least one answered question that has not been marked,
    // that student's results group has to be remarked
    const isWaitingForRemark = (studentResultGroup: StudentResultGroup) => {
        for(let i = 0; i < studentResultGroup.results.length; i++){
            const examResult: ExamResult = studentResultGroup.results[i];
            for(let j = 0; j < examResult.answers.length; j++){
                // answered but not marked
                if(examResult.answers[j].is_correct === null && examResult.answers[j].answer !== null){
                    return true;
                }
            }
        }
        return false;
    };

    return (
        <Grid container spacing={2} sx={{my: 3}}>
            {
                studentResultGroups.map(studentResult => (
                    <Grid key={studentResult.id} size={{xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Box sx={{border: '1px solid #0000ff', borderRadius: '8px', p: 2, backgroundColor: '#ffffff'}}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                mb: '10px'
                            }}>
                                <AvatarDefault fullName={studentResult.name} />
                                <Box>
                                    <Typography variant={'body1'} sx={{fontWeight: 600}}>
                                        {studentResult.name}
                                    </Typography>
                                    <Typography variant={'body2'}>
                                        {studentResult.email}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant={'body1'} color={'primary'}>
                                    Số đề đã hoàn thành: {countCompleted(studentResult)}/{numberOfExams}
                                </Typography>

                                <Typography variant={'body1'}>
                                    Trạng thái:
                                    {
                                        isWaitingForRemark(studentResult) ?
                                            <span style={{color: '#ff0000', marginLeft: 10}}>Chờ chấm lại</span> :
                                            <span style={{color: '#008000', marginLeft: 10}}>Đã chấm xong</span>
                                    }
                                </Typography>
                            </Box>

                            <Box sx={{textAlign: 'center', mt: '20px'}}>
                                <Button variant={'contained'} color={'success'} size={'large'}
                                        onClick={()=>handleMark(studentResult.id)}
                                >
                                    Chi tiết
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                ))
            }
        </Grid>
    )
}