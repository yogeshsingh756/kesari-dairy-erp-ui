import { Typography, Box, Card, CardContent } from "@mui/material";

export default function Dashboard() {
  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>Dashboard</Typography>
      <Box display="flex" flexWrap="wrap" gap={3}>
        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Typography variant="h6">Users</Typography>
            <Typography variant="h4">0</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Typography variant="h6">Roles</Typography>
            <Typography variant="h4">0</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 300px' }}>
          <CardContent>
            <Typography variant="h6">Permissions</Typography>
            <Typography variant="h4">0</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
