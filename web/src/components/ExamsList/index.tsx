import type {Exam} from "../../utils/types";
import {Box, Button, Grid, Typography} from "@mui/material";

export default function ExamsList({exams, handleEditExam}:
                                  {
                                      exams: Exam[], handleEditExam: (examId: number) => void
                                  }) {
    return (
        <Grid container spacing={2} sx={{my: 3}}>
            {
                exams.map((exam: Exam) => (
                    <Grid key={exam.id} size={{xs: 12, sm: 6, lg: 4}}>
                        <Box sx={{border: '1px dotted #0000ff', borderRadius: '8px', p: 1, backgroundColor: '#ffffff'}}>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                <Typography sx={{
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: 'calc(100% - 50px)' // limit width
                                }}>
                                    Đề bài: {exam.name}
                                </Typography>
                                <Button onClick={() => handleEditExam(exam.id!)}>Sửa</Button>
                            </Box>

                            <Typography>Mã đề: {exam.code}</Typography>
                            <Typography>Thời gian làm bài: {exam.total_time / 60} phút</Typography>
                            <Typography>Số câu hỏi: {exam.number_of_question}</Typography>
                        </Box>
                    </Grid>
                ))
            }

        </Grid>
    )
}