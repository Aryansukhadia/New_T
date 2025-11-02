import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
`;

const MainContent = styled.main<{ sidebarWidth: number }>`
  margin-left: ${props => props.sidebarWidth}px;
  flex: 1;
  padding: 24px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
`;

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarWidth = sidebarOpen ? 260 : 80;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <LayoutContainer>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <MainContent sidebarWidth={sidebarWidth}>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default DashboardLayout;

