import {useState} from 'react';
import type {ChangeEvent} from 'react';
import {Box, Button, Grid, InputAdornment, Paper, TextField, Typography} from '@mui/material';
import {Add as AddIcon, Description as DescriptionIcon, Search as SearchIcon} from '@mui/icons-material';
import type {Test} from '../utils';
import {styled} from "@mui/material/styles";

interface TestsContentProps {
  tests: Test[]
}

export default function TestsContent({tests}: TestsContentProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search input change
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle create test button click
  const handleCreateTest = () => {
    console.log("Create new test");
  };

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
          fontWeight="medium"
          color="primary"
          sx={{mb: 2}}
        >
          Bài thi đang diễn ra
        </Typography>

        <Grid container spacing={2}>
          {tests.map((test: Test) => (
            <Grid size={{xs: 12, md: 6, lg: 4}} key={test.id} sx={{borderLeft: '5px solid #0000ff'}}>
              <Item>
                <Paper elevation={0} sx={{borderRadius: 2}}>
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
                      <Typography variant='body1' fontWeight="medium" textAlign="left" sx={{mb: 1}}>
                        {test.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={'medium'}>
                        Ngày bắt đầu: {test.date.split(' ')[0]}
                      </Typography>
                    </Box>
                  </Box>

                </Paper>
              </Item>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Pending Tests Section */}
      <Box>
        <Typography
          variant="subtitle1"
          fontWeight="medium"
          color="primary"
          sx={{mb: 2}}
        >
          Bài thi chưa bắt đầu
        </Typography>

      </Box>
    </Box>
  );
}
