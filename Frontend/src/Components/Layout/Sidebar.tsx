import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { removeAuthToken, getUserInfo, type LoginResponse } from '../../Services/ApiServices';
import {
  FaChartBar,
  FaUsers,
  FaUserLock,
  FaUser,
  FaRuler,
  FaChartLine,
  FaDollarSign,
  FaShoppingCart,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import type { IconType } from 'react-icons';

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  width: ${props => props.isOpen ? '260px' : '80px'};
  height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  position: fixed;
  left: 0;
  top: 0;
  transition: width 0.3s ease;
  overflow-x: hidden;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
`;

const SidebarHeader = styled.div`
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 20px;
  padding: 8px;
  margin-left: auto;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const UserInfo = styled.div<{ isOpen: boolean }>`
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const UserName = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
`;

const UserRole = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 20px 0;
  margin: 0;
`;

const NavItem = styled.li<{ isActive: boolean; isOpen: boolean }>`
  margin: 4px 12px;
  
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    color: ${props => props.isActive ? '#fff' : 'rgba(255, 255, 255, 0.7)'};
    text-decoration: none;
    border-radius: 8px;
    background: ${props => props.isActive ? 'rgba(102, 126, 234, 0.2)' : 'transparent'};
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: ${props => props.isActive ? '600' : '400'};
    
    &:hover {
      background: ${props => props.isActive ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
      color: #fff;
    }
  }
`;

const NavIcon = styled.span`
  font-size: 20px;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const NavText = styled.span<{ isOpen: boolean }>`
  white-space: nowrap;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const LogoutButton = styled.button`
  position: absolute;
  bottom: 20px;
  left: 12px;
  right: 12px;
  padding: 12px 16px;
  background: rgba(220, 53, 69, 0.2);
  color: #fff;
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(220, 53, 69, 0.3);
    border-color: rgba(220, 53, 69, 0.5);
  }
`;

interface MenuItem {
  path: string;
  label: string;
  icon: IconType;
  roles: string[];
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo: LoginResponse | null = getUserInfo();
  const userRole = userInfo?.roleName?.toLowerCase() || '';

  // Menu items based on roles
  const menuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: FaChartBar, roles: ['admin', 'staff members', 'staff', 'accountant'] },
    { path: '/dashboard/users', label: 'Users', icon: FaUsers, roles: ['admin'] },
    { path: '/dashboard/roles', label: 'Roles', icon: FaUserLock, roles: ['admin'] },
    { path: '/dashboard/customers', label: 'Customers', icon: FaUser, roles: ['admin', 'staff members', 'staff'] },
    { path: '/dashboard/measurements', label: 'Measurements', icon: FaRuler, roles: ['admin', 'staff members', 'staff'] },
    { path: '/dashboard/reports', label: 'Reports', icon: FaChartLine, roles: ['admin', 'accountant'] },
    { path: '/dashboard/financials', label: 'Financials', icon: FaDollarSign, roles: ['admin', 'accountant'] },
    { path: '/dashboard/orders', label: 'Orders', icon: FaShoppingCart, roles: ['admin', 'staff members', 'staff'] },
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
    <SidebarContainer isOpen={isOpen}>
      <SidebarHeader>
        <Logo>{isOpen ? 'Tailor' : 'T'}</Logo>
        <ToggleButton onClick={toggleSidebar}>
          {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </ToggleButton>
      </SidebarHeader>

      {userInfo && (
        <UserInfo isOpen={isOpen}>
          <UserName>{userInfo.fullName}</UserName>
          <UserRole>{userInfo.roleName}</UserRole>
        </UserInfo>
      )}

      <NavList>
        {allowedMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          return (
            <NavItem key={item.path} isActive={isActive} isOpen={isOpen}>
              <Link to={item.path}>
                <NavIcon>
                  <IconComponent />
                </NavIcon>
                <NavText isOpen={isOpen}>{item.label}</NavText>
              </Link>
            </NavItem>
          );
        })}
      </NavList>

      <LogoutButton onClick={handleLogout}>
        <NavIcon>
          <FaSignOutAlt />
        </NavIcon>
        <NavText isOpen={isOpen}>Logout</NavText>
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;

