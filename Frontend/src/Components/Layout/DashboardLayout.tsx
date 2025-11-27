import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // lg = 1024px
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Close sidebar on mobile by default when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />
      <Box
        component="main"
        sx={{
          flex: 1,
          transition: 'margin-left 0.3s ease',
          minWidth: 0,
          overflow: 'auto',
          width: '100%',
        }}
      >
        {isMobile && (
          <Box sx={{ mb: 2 }}>
            <IconButton
              onClick={toggleSidebar}
              sx={{
                color: 'primary.main',
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;

