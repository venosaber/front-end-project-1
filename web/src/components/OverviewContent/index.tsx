import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  ContentCopy as ContentCopyIcon,
  NotificationsOutlined as NotificationIcon
} from '@mui/icons-material';
import AssignmentIcon from "@mui/icons-material/Assignment";
import {styled} from "@mui/material/styles";
import PeopleIcon from "@mui/icons-material/People";
import type {Member, Test} from "../../utils/types"

interface OverviewContentProps {
  teacherName: string,
  className: string,
  members: Member[],
  tests: Test[]
}

export default function OverviewContent({className, teacherName, members, tests}: OverviewContentProps) {
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
      <Box sx={{display: 'flex', justifyContent: 'space-around', gap: '20px', alignItems: 'flex-start'}}>
        <Box sx={{flexGrow: 1}}>
          {/* Header section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              backgroundColor: '#3498db',
              color: 'white'
            }}>

            <Box>
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{mb: 1}}>
                  <AssignmentIcon sx={{mr: 1, verticalAlign: 'middle'}}/>
                  {className}
                </Typography>

                <Typography variant="body1" sx={{opacity: 0.9}}>
                  Giáo viên: {teacherName}
                </Typography>

                <Box sx={{display: 'flex', alignItems: 'flex-end', mt: 2, gap: '10px'}}>
                  <Typography variant="body1" sx={{opacity: 0.9}}>
                    Chia sẻ lớp học
                  </Typography>

                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon/>}
                    size="small"
                    sx={{
                      mt: 1,
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white',
                      }
                    }}
                  >
                    <Typography variant='caption' sx={{opacity: 0.9}}>
                      Sao chép liên kết
                    </Typography>
                  </Button>

                </Box>

              </Box>

            </Box>

          </Paper>

          {/* Statistics section */}
          <Grid container spacing={2}>
            < Grid size={6}>
              <Item>
                <Paper elevation={0} sx={{p: 2, borderRadius: 2}}>
                  <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <PeopleIcon sx={{color: '#3498db', mr: 2, fontSize: 48}}/>
                    <Typography variant="h5" fontWeight="medium">
                      {members.length} Thành Viên
                    </Typography>
                  </Box>
                </Paper>
              </Item>
            </Grid>

            < Grid size={6}>
              <Item>
                <Paper elevation={0} sx={{p: 2, borderRadius: 2}}>
                  <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <PeopleIcon sx={{color: '#3498db', mr: 2, fontSize: 48}}/>
                    <Typography variant="h5" fontWeight="medium">
                      {tests.length} Bài Kiểm Tra
                    </Typography>
                  </Box>
                </Paper>
              </Item>
            </Grid>
          </Grid>

          {/* Members section */}
          {
            MembersContent(members)
          }
        </Box>

        {/* Recent Activity section */}
        <Box sx={{
          width: 320, flexShrink: 0, borderLeft: '1px solid #e0e0e0',
          p: 3, backgroundColor: '#fff', borderRadius: 3,
          display: {xs: 'none', lg: 'block'}
        }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            <NotificationIcon sx={{verticalAlign: 'middle', mr: 1}}/>
            Hoạt động gần đây
          </Typography>

          <List>
            {tests.reverse().map((test: Test) => (
              <ListItem key={test.id} sx={{px: 0, py: 1}}>
                <ListItemIcon sx={{minWidth: 40}}>
                  <Avatar
                    src={`https://i.pravatar.cc/150?img=${test.id}`}
                    sx={{width: 32, height: 32}}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      Bài thi <Typography component="span" color="primary"
                                          fontWeight="medium">{test.name}</Typography> vừa
                      được tải lên
                    </Typography>
                  }
                  secondary={
                    <Box sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
                      <ClockIcon sx={{fontSize: 14, mr: 0.5, color: 'text.secondary'}}/>
                      <Typography variant="caption" color="text.secondary">
                        {test.date}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))
            }
          </List>

        </Box>
      </Box>
    </>
  )
}

function MembersContent(members: Member[]) {
  return (
    <Box sx={{mt: 3}}>
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
                sx={index % 2 !== 0 ? {} : {backgroundColor: '#f5f9fc'}}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{member.name}</TableCell>
                <TableCell>
                  <Chip
                    label={member.role === 'teacher' ? 'Giáo viên': 'Học sinh'}
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
                      icon={<KeyIcon />}
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" >
      <path
        d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}