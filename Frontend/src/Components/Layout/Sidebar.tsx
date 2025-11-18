import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Button,
  Collapse,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import MUICustomBtn from '../Common/MUICustomBtn';
import { removeAuthToken, getUserInfo, type LoginResponse } from '../../Services/ApiServices';
import LanguageToggle from '../Common/LanguageToggle';
import { useTranslation } from '../../hooks/useTranslation';
import { sidebarItems, type MenuItem } from '../Common/Sidebar/SidebarItems';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userInfo: LoginResponse | null = getUserInfo();
  const userRole = userInfo?.role?.toLowerCase() || '';
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

  // Get menu items based on user role - exact match only
  const getMenuItemsForRole = (): MenuItem[] => {
    if (userRole === 'superadmin') {
      return sidebarItems.superAdmin;
    } else if (userRole === 'admin') {
      return sidebarItems.admin;
    } else if (userRole === 'subadmin') {
      return sidebarItems.subAdmin;
    }
    return [];
  };

  const menuItems = getMenuItemsForRole();

  const handleSubmenuToggle = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isPathActive = (path?: string): boolean => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? 260 : 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isOpen ? 260 : 80,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          color: 'white',
          borderRight: 'none',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          padding: '0px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          minHeight: '60px',
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 700,
            color: 'white',
            whiteSpace: 'nowrap',
            flexGrow: 1,
          }}
        >
          {isOpen ? 'Tailor' : 'T'}
        </Typography>
        <MUICustomBtn
          onClick={toggleSidebar}
          tooltip={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          variant="text"
          sx={{
            color: 'white',
            minWidth: 'auto',
            padding: '8px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </MUICustomBtn>
      </Box>

      {/* User Info */}
      {userInfo && (
        <Box
          sx={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: isOpen ? 'block' : 'none',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              marginBottom: '4px',
            }}
          >
            {userInfo.fullName}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px',
            }}
          >
            {userInfo.role}
          </Typography>
        </Box>
      )}

      {/* Navigation Menu */}
      <List sx={{ padding: '20px 0', flexGrow: 1 }}>
        {menuItems.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const isActive = item.path ? isPathActive(item.path) : false;
          const IconComponent = item.icon;

          // For items with children, check if any child is active
          const hasActiveChild = hasChildren
            ? item.children?.some((child) => child.path && isPathActive(child.path))
            : false;

          const isSubmenuOpen = openSubmenus[item.label] || false;

          return (
            <Box key={`${item.label}-${index}`}>
              <ListItem disablePadding sx={{ margin: '4px 12px' }}>
                <ListItemButton
                  component={hasChildren ? 'div' : Link}
                  to={hasChildren ? undefined : item.path}
                  selected={isActive || hasActiveChild}
                  onClick={hasChildren ? () => handleSubmenuToggle(item.label) : undefined}
                  sx={{
                    borderRadius: 2,
                    padding: '12px 16px',
                    gap: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(102, 126, 234, 0.2)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.3)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                    },
                  }}
                >
                  {IconComponent && (
                    <ListItemIcon
                      sx={{
                        color: isActive || hasActiveChild ? 'white' : 'rgba(255, 255, 255, 0.7)',
                        minWidth: '24px',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent />
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '14px',
                        fontWeight: isActive || hasActiveChild ? 600 : 400,
                        whiteSpace: 'nowrap',
                        opacity: isOpen ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                      },
                    }}
                  />
                  {hasChildren && isOpen && (
                    <Box sx={{ opacity: isOpen ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                      {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>

              {/* Render children if they exist */}
              {hasChildren && (
                <Collapse in={isSubmenuOpen && isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children?.map((child, childIndex) => {
                      const isChildActive = child.path ? isPathActive(child.path) : false;
                      return (
                        <ListItem key={`${child.label}-${childIndex}`} disablePadding sx={{ margin: '4px 12px 4px 36px' }}>
                          <ListItemButton
                            component={Link}
                            to={child.path || '#'}
                            selected={isChildActive}
                            sx={{
                              borderRadius: 2,
                              padding: '10px 16px',
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(102, 126, 234, 0.3)',
                                },
                              },
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                              },
                            }}
                          >
                            <ListItemText
                              primary={child.label}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontSize: '13px',
                                  fontWeight: isChildActive ? 600 : 400,
                                  whiteSpace: 'nowrap',
                                  opacity: isOpen ? 1 : 0,
                                  transition: 'opacity 0.3s ease',
                                },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>

      {/* Language Toggle */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '80px',
          left: '12px',
          right: '12px',
        }}
      >
        <LanguageToggle />
      </Box>

      {/* Logout Button */}
      <Box sx={{ position: 'absolute', bottom: '20px', left: '12px', right: '12px' }}>
        <Button
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            color: 'white',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            borderRadius: 2,
            justifyContent: isOpen ? 'flex-start' : 'center',
            '&:hover': {
              backgroundColor: 'rgba(220, 53, 69, 0.3)',
              borderColor: 'rgba(220, 53, 69, 0.5)',
            },
          }}
        >
          {isOpen && (
            <Typography variant="body2" sx={{ marginLeft: 1 }}>
              {t('common.logout') || 'Logout'}
            </Typography>
          )}
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

