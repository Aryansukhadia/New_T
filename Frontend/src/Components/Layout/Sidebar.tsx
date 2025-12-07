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
import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const Sidebar = ({ isOpen, toggleSidebar, isMobile }: SidebarProps) => {
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
    } else if (userRole === 'cutter') {
      return sidebarItems.cutter;
    } else if (userRole === 'stitcher') {
      return sidebarItems.stitcher;
    } else if (userRole === 'finisher') {
      return sidebarItems.finisher;
    } else if (userRole === 'deliveryBoy') {
      return sidebarItems.deliveryBoy;
    } else if (userRole === 'accountant') {
      return sidebarItems.accountant;
    }
    return [];
  };

  const menuItems = getMenuItemsForRole();

  const isPathActive = (path?: string, hasChildren: boolean = false): boolean => {
    if (!path) return false;

    // For items without children (like Dashboard), only match exact path
    // For items with children, they should only be highlighted if a child is active
    if (!hasChildren && path === '/dashboard') {
      // Dashboard should only be highlighted when exactly on /dashboard
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }

    // For all other paths, use exact match or startsWith for sub-routes
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Auto-open parent menu if any of its children is active
  useEffect(() => {
    const activeParent = menuItems.find((item) => {
      if (item.children && item.children.length > 0) {
        return item.children.some((child) => child.path && isPathActive(child.path));
      }
      return false;
    });

    if (activeParent) {
      setOpenSubmenus({ [activeParent.label]: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleSubmenuToggle = (label: string) => {
    setOpenSubmenus((prev) => {
      const isCurrentlyOpen = prev[label];
      // Close all submenus and toggle only the clicked one
      if (isCurrentlyOpen) {
        // If clicking on an already open submenu, close it
        return {};
      } else {
        // If clicking on a closed submenu, close all others and open this one
        return { [label]: true };
      }
    });
  };

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  const handleMenuItemClick = () => {
    // Close sidebar on mobile after clicking a menu item
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? isOpen : true}
      onClose={isMobile ? toggleSidebar : undefined}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        width: isOpen ? 260 : 80,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isMobile ? 260 : (isOpen ? 260 : 80),
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
          {/* User Info */}
          {userInfo && (
            <Box
              sx={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: (isMobile || isOpen) ? 'block' : 'none',
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
        </Typography>
        {!isMobile && (
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
        )}
      </Box>


      {/* Navigation Menu */}
      <List sx={{ padding: '20px 0', flexGrow: 1 }}>
        {menuItems.map((item, index) => {
          const hasChildren = item.children && item.children.length > 0;
          const isActive = item.path ? isPathActive(item.path, hasChildren) : false;
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
                  onClick={hasChildren ? () => handleSubmenuToggle(item.label) : handleMenuItemClick}
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
                        opacity: (isMobile || isOpen) ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                      },
                    }}
                  />
                  {hasChildren && (isMobile || isOpen) && (
                    <Box sx={{ opacity: (isMobile || isOpen) ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                      {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>

              {/* Render children if they exist */}
              {hasChildren && (
                <Collapse in={isSubmenuOpen && (isMobile || isOpen)} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children?.map((child, childIndex) => {
                      const isChildActive = child.path ? isPathActive(child.path) : false;
                      return (
                        <ListItem key={`${child.label}-${childIndex}`} disablePadding sx={{ margin: '4px 12px 4px 36px' }}>
                          <ListItemButton
                            component={Link}
                            to={child.path || '#'}
                            selected={isChildActive}
                            onClick={handleMenuItemClick}
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
                                  opacity: (isMobile || isOpen) ? 1 : 0,
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
            justifyContent: (isMobile || isOpen) ? 'flex-start' : 'center',
            '&:hover': {
              backgroundColor: 'rgba(220, 53, 69, 0.3)',
              borderColor: 'rgba(220, 53, 69, 0.5)',
            },
          }}
        >
          {(isMobile || isOpen) && (
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

