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
} from '@mui/material';
import MUICustomBtn from '../Common/MUICustomBtn';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Logout as LogoutIcon,
  Inventory as InventoryIcon,
  ShoppingBag as ShoppingBagIcon,
  Sell as SellIcon,
} from '@mui/icons-material';
import { removeAuthToken, getUserInfo, type LoginResponse } from '../../Services/ApiServices';
import LanguageToggle from '../Common/LanguageToggle';
import { useTranslation } from '../../hooks/useTranslation';

// Define icon mapping for menu items
const getMenuIcon = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType } = {
    FaChartBar: DashboardIcon,
    FaUsers: PeopleIcon,
    FaUserLock: AdminPanelSettingsIcon,
    FaUser: PersonIcon,
    FaChartLine: BarChartIcon,
    FaDollarSign: AttachMoneyIcon,
    FaShoppingCart: ShoppingCartIcon,
    FaBox: InventoryIcon,
    FaShoppingBag: ShoppingBagIcon,
    FaTags: SellIcon,
  };
  return iconMap[iconName] || DashboardIcon;
};

interface MenuItem {
  path: string;
  label: string;
  iconName: string;
  roles: string[];
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userInfo: LoginResponse | null = getUserInfo();
  const userRole = userInfo?.roleName?.toLowerCase() || '';

  // Menu items based on roles
  const menuItems: MenuItem[] = [
    { path: '/dashboard', label: t('dashboard.title'), iconName: 'FaChartBar', roles: ['admin', 'staff', 'accountant'] },
    { path: '/dashboard/users', label: t('dashboard.users'), iconName: 'FaUsers', roles: ['admin'] },
    { path: '/dashboard/roles', label: t('dashboard.roles'), iconName: 'FaUserLock', roles: ['admin'] },
    { path: '/dashboard/customers', label: t('dashboard.customers'), iconName: 'FaUser', roles: ['admin', 'staff'] },
    { path: '/dashboard/product-items', label: t('dashboard.productItems'), iconName: 'FaBox', roles: ['admin', 'staff'] },
    { path: '/dashboard/products', label: t('dashboard.products'), iconName: 'FaShoppingBag', roles: ['admin', 'staff'] },
    { path: '/dashboard/product-variants', label: t('dashboard.productVariants'), iconName: 'FaTags', roles: ['admin', 'staff'] },
    { path: '/dashboard/orders', label: t('dashboard.orders'), iconName: 'FaShoppingCart', roles: ['admin', 'staff'] },
    { path: '/dashboard/reports', label: t('dashboard.reports'), iconName: 'FaChartLine', roles: ['admin', 'accountant'] },
    { path: '/dashboard/financials', label: t('dashboard.financials'), iconName: 'FaDollarSign', roles: ['admin', 'accountant'] },
  ];

  // Filter menu items based on user role
  const allowedMenuItems = menuItems.filter(item =>
    item.roles.some(role => {
      const roleLower = role.toLowerCase();
      const userRoleLower = userRole.toLowerCase();
      // Match exact or check if userRole contains the role name (for "staff members" matching "staff")
      return roleLower === userRoleLower ||
        userRoleLower.includes(roleLower) ||
        roleLower.includes(userRoleLower);
    })
  );

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
            {userInfo.roleName}
          </Typography>
        </Box>
      )}

      {/* Navigation Menu */}
      <List sx={{ padding: '20px 0', flexGrow: 1 }}>
        {allowedMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = getMenuIcon(item.iconName);
          return (
            <ListItem key={item.path} disablePadding sx={{ margin: '4px 12px' }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
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
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
                    minWidth: '24px',
                    justifyContent: 'center',
                  }}
                >
                  <IconComponent />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 400,
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

