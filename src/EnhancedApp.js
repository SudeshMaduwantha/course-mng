import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth, PermissionGuard, PERMISSIONS } from './components/AuthContext';
import { ThemeProvider, EnhancedNavbar, GlobalThemeStyles } from './components/ThemeProvider';
import { NotificationProvider } from './components/NotificationSystem';
import Login from './components/Login';
import ProtectedNavbar from './components/ProtectedNavbar';
import Dashboard from './components/Dashboard';
import CourseManagement from './components/CourseManagement';
import StudentManagement from './components/StudentManagement';
import RegistrationManagement from './components/RegistrationManagement';
import ResultsManagement from './components/ResultsManagement';
import Footer from './components/Footer';

// Protected App Content (Only shown when authenticated)
const ProtectedAppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveComponent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <PermissionGuard 
            permission={PERMISSIONS.DASHBOARD_VIEW}
            fallback={<UnauthorizedAccess />}
          >
            <Dashboard />
          </PermissionGuard>
        );
      case 'courses':
        return (
          <PermissionGuard 
            permission={PERMISSIONS.COURSES_VIEW}
            fallback={<UnauthorizedAccess />}
          >
            <CourseManagement />
          </PermissionGuard>
        );
      case 'students':
        return (
          <PermissionGuard 
            permission={PERMISSIONS.STUDENTS_VIEW}
            fallback={<UnauthorizedAccess />}
          >
            <StudentManagement />
          </PermissionGuard>
        );
      case 'registrations':
        return (
          <PermissionGuard 
            permission={PERMISSIONS.REGISTRATIONS_VIEW}
            fallback={<UnauthorizedAccess />}
          >
            <RegistrationManagement />
          </PermissionGuard>
        );
      case 'results':
        return (
          <PermissionGuard 
            permission={PERMISSIONS.RESULTS_VIEW}
            fallback={<UnauthorizedAccess />}
          >
            <ResultsManagement />
          </PermissionGuard>
        );
      default:
        return (
          <PermissionGuard 
            permission={PERMISSIONS.DASHBOARD_VIEW}
            fallback={<UnauthorizedAccess />}
          >
            <Dashboard />
          </PermissionGuard>
        );
    }
  };

  return (
    <div className="App">
      <GlobalThemeStyles />
      {/* Use ProtectedNavbar instead of EnhancedNavbar for authenticated users */}
      <ProtectedNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <div className="container">
          {renderActiveComponent()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Main App Content that handles authentication state
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show protected app content if authenticated
  return <ProtectedAppContent />;
};

// Unauthorized Access Component
const UnauthorizedAccess = () => {
  const { user } = useAuth();
  
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">🚫</div>
        <h2>Access Denied</h2>
        <p>Sorry, you don't have permission to access this section.</p>
        <p className="user-role">
          Your current role: <strong>{user?.role || 'Unknown'}</strong>
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary padding: 16px 16px"
        >Refresh Page
          
         
        </button>
      </div>
    </div>
  );
};

// Main App Component with all providers
function EnhancedApp() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default EnhancedApp;

const button ={
  background: 'linear-gradient(135deg, #007bff, #0056b3)',
  color: 'white',
  border: 'none',
  boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
  width:'100px',
  height:'50px',
  borderRadius:'10px'
}
