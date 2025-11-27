import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Box
        component="main"
        sx={{
          flex: 1,
          padding: 3,
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;

