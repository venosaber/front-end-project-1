import type {Course, Member} from "../../utils/types";
import {
    Box,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";

interface MembersContentProps {
    course: Course
}

export default function MembersContent({course}: MembersContentProps) {
    // swapping to have teachers at the head of the array
    const members: Member[] = course.users;
    members.sort((a, b) => {
        if (a.role === "teacher" && b.role === "student") {
            return -1;
        } else if (a.role === "student" && b.role === "teacher") {
            return 1;
        } else {
            return 0;
        }
    });

    return (
        <Box sx={{mt: 3, overflowY: 'auto'}}>
            <TableContainer component={Paper} elevation={0} sx={{p: 2}}>
                <Typography variant="h6" fontWeight="bold" sx={{mb: 1}} color={'primary'}>
                    Danh sách thành viên
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{fontWeight: 'bold', color: '#666'}}>NO.</TableCell>
                            <TableCell sx={{fontWeight: 'bold', color: '#666'}}>HỌ TÊN</TableCell>
                            <TableCell sx={{fontWeight: 'bold', color: '#666'}}>VỊ TRÍ</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {members.map((member: Member, index: number) => (
                            <TableRow
                                key={member.id}
                                sx={index % 2 !== 0 ? {} : {backgroundColor: '#f0f0f0'}}
                            >
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={member.role === "student"?"Học sinh":"Giáo viên"}
                                        size="small"
                                        sx={{
                                            backgroundColor: member.role === 'teacher' ? 'rgba(255, 118, 117, 0.5)' : 'rgb(46, 204, 113)',
                                            color: 'white',
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    {member.role === 'teacher' && (
                                        <Chip
                                            icon={<KeyIcon/>}
                                            size="small"
                                            sx={{backgroundColor: '#f9ca24', color: '#fff'}}
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

function KeyIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
                d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}