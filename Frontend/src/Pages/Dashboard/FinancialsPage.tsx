import { Card, Typography } from '@mui/material';

const FinancialsPage = () => {
  return (
    <Card sx={{ borderRadius: 1.5, p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Financials
      </Typography>
      <Typography variant="body1">Financials page - Admin and Accountant access</Typography>
      {/* TODO: Implement financials functionality */}
    </Card>
  );
};

export default FinancialsPage;

