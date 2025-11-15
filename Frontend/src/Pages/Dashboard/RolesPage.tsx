import { Card, Typography } from '@mui/material';

const RolesPage = () => {
  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Roles Management
      </Typography>
      <Typography variant="body1">Roles management page - Admin access only</Typography>
      {/* TODO: Implement roles list, create, edit, delete */}
    </Card>
  );
};

export default RolesPage;

