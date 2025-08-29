import React, { useState } from 'react';

// Authentication Context (simplified version - use your full version)
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const ROLES = {
  ADMIN: 'ADMIN',
  FACULTY: 'FACULTY', 
  STUDENT: 'STUDENT'
};

const PERMISSIONS = {
  COURSES_VIEW: 'courses.view',
  COURSES_CREATE: 'courses.create',
  COURSES_EDIT: 'courses.edit',
  COURSES_DELETE: 'courses.delete',
  STUDENTS_VIEW: 'students.view',
  STUDENTS_CREATE: 'students.create',
  STUDENTS_EDIT: 'students.edit',
  STUDENTS_DELETE: 'students.delete',
  REGISTRATIONS_VIEW: 'registrations.view',
  REGISTRATIONS_CREATE: 'registrations.create',
  REGISTRATIONS_DELETE: 'registrations.delete',
  RESULTS_VIEW: 'results.view',
  RESULTS_EDIT: 'results.edit',
  RESULTS_VIEW_ALL: 'results.view_all',
  DASHBOARD_VIEW: 'dashboard.view',
  SYSTEM_ADMIN: 'system.admin'
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.COURSES_VIEW, PERMISSIONS.COURSES_CREATE, PERMISSIONS.COURSES_EDIT, PERMISSIONS.COURSES_DELETE,
    PERMISSIONS.STUDENTS_VIEW, PERMISSIONS.STUDENTS_CREATE, PERMISSIONS.STUDENTS_EDIT, PERMISSIONS.STUDENTS_DELETE,
    PERMISSIONS.REGISTRATIONS_VIEW, PERMISSIONS.REGISTRATIONS_CREATE, PERMISSIONS.REGISTRATIONS_DELETE,
    PERMISSIONS.RESULTS_VIEW, PERMISSIONS.RESULTS_EDIT, PERMISSIONS.RESULTS_VIEW_ALL,
    PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.SYSTEM_ADMIN
  ],
  [ROLES.FACULTY]: [
    PERMISSIONS.COURSES_VIEW, PERMISSIONS.COURSES_CREATE, PERMISSIONS.COURSES_EDIT,
    PERMISSIONS.STUDENTS_VIEW, PERMISSIONS.REGISTRATIONS_VIEW,
    PERMISSIONS.RESULTS_VIEW, PERMISSIONS.RESULTS_EDIT, PERMISSIONS.DASHBOARD_VIEW
  ],
  [ROLES.STUDENT]: [
    PERMISSIONS.COURSES_VIEW, PERMISSIONS.REGISTRATIONS_VIEW, PERMISSIONS.RESULTS_VIEW
  ]
};

const MOCK_USERS = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@university.edu', firstName: 'System', lastName: 'Administrator', role: ROLES.ADMIN, avatar: 'A' },
  { id: 2, username: 'faculty', password: 'faculty123', email: 'faculty@university.edu', firstName: 'John', lastName: 'Professor', role: ROLES.FACULTY, avatar: 'J' },
  { id: 3, username: 'student', password: 'student123', email: 'student@university.edu', firstName: 'Jane', lastName: 'Student', role: ROLES.STUDENT, avatar: 'J' }
];

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = MOCK_USERS.find(
        u => u.username === credentials.username && u.password === credentials.password
      );
      
      if (!foundUser) {
        throw new Error('Invalid username or password');
      }
      
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    return { success: true };
  };

  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  const value = {
    user, loading, isAuthenticated, login, logout, hasPermission, ROLES, PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const PermissionGuard = ({ permission, fallback = null, children }) => {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? children : fallback;
};

// Theme Provider
const ThemeContext = React.createContext();

const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  
  const lightTheme = {
    colors: {
      primary: '#007bff',
      background: '#f8f9fa',
      surface: '#ffffff',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#dee2e6',
      light: '#e3f2fd'
    }
  };
  
  const darkTheme = {
    colors: {
      primary: '#007bff',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      border: '#404040',
      light: '#2c3e50'
    }
  };
  
  const theme = isDark ? darkTheme : lightTheme;
  const toggleTheme = () => setIsDark(!isDark);
  
  const value = { theme, isDark, toggleTheme };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Notification System
const NotificationContext = React.createContext();

const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };
  
  const success = (message) => addNotification('success', message);
  const error = (message) => addNotification('error', message);
  const info = (message) => addNotification('info', message);
  
  const value = { success, error, info };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '500',
              minWidth: '300px',
              backgroundColor: notification.type === 'success' ? '#28a745' : 
                              notification.type === 'error' ? '#dc3545' : '#007bff'
            }}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Enhanced Components
const EnhancedDashboard = ({ onNavigate }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  return (
    <div style={{ padding: '20px', backgroundColor: theme.colors.background, minHeight: '80vh' }}>
      <h2 style={{ color: theme.colors.text, marginBottom: '20px' }}>📊 Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: theme.colors.surface, 
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{ color: theme.colors.text }}>Welcome, {user?.firstName}!</h3>
          <p style={{ color: theme.colors.textSecondary }}>Your role: {user?.role}</p>
          <button onClick={() => onNavigate('courses')} style={{
            padding: '10px 20px',
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Go to Courses
          </button>
        </div>
        <div style={{ 
          padding: '20px', 
          backgroundColor: theme.colors.surface, 
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <h3 style={{ color: theme.colors.text }}>Quick Stats</h3>
          <p style={{ color: theme.colors.textSecondary }}>Total Courses: 25</p>
          <p style={{ color: theme.colors.textSecondary }}>Active Students: 150</p>
        </div>
      </div>
    </div>
  );
};

const EnhancedCourseManagement = () => {
  const { theme } = useTheme();
  const { hasPermission } = useAuth();
  
  return (
    <div style={{ padding: '20px', backgroundColor: theme.colors.background, minHeight: '80vh' }}>
      <h2 style={{ color: theme.colors.text }}>📚 Course Management</h2>
      <div style={{ marginTop: '20px' }}>
        <PermissionGuard permission={PERMISSIONS.COURSES_CREATE}>
          <button style={{
            padding: '10px 20px',
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '10px'
          }}>
            Add New Course
          </button>
        </PermissionGuard>
        <div style={{ 
          marginTop: '20px',
          padding: '20px',
          backgroundColor: theme.colors.surface,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <p style={{ color: theme.colors.text }}>Course list would appear here...</p>
          <p style={{ color: theme.colors.textSecondary }}>
            Can create courses: {hasPermission(PERMISSIONS.COURSES_CREATE) ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    </div>
  );
};

const EnhancedStudentManagement = () => {
  const { theme } = useTheme();
  
  return (
    <div style={{ padding: '20px', backgroundColor: theme.colors.background, minHeight: '80vh' }}>
      <h2 style={{ color: theme.colors.text }}>👨‍🎓 Student Management</h2>
      <div style={{ 
        marginTop: '20px',
        padding: '20px',
        backgroundColor: theme.colors.surface,
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <p style={{ color: theme.colors.text }}>Student records would appear here...</p>
      </div>
    </div>
  );
};

const EnhancedRegistrationManagement = () => {
  const { theme } = useTheme();
  
  return (
    <div style={{ padding: '20px', backgroundColor: theme.colors.background, minHeight: '80vh' }}>
      <h2 style={{ color: theme.colors.text }}>📝 Registration Management</h2>
      <div style={{ 
        marginTop: '20px',
        padding: '20px',
        backgroundColor: theme.colors.surface,
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <p style={{ color: theme.colors.text }}>Registration records would appear here...</p>
      </div>
    </div>
  );
};

const EnhancedResultsManagement = () => {
  const { theme } = useTheme();
  
  return (
    <div style={{ padding: '20px', backgroundColor: theme.colors.background, minHeight: '80vh' }}>
      <h2 style={{ color: theme.colors.text }}>📈 Results Management</h2>
      <div style={{ 
        marginTop: '20px',
        padding: '20px',
        backgroundColor: theme.colors.surface,
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`
      }}>
        <p style={{ color: theme.colors.text }}>Student results would appear here...</p>
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useNotification();
  const { theme, toggleTheme, isDark } = useTheme();

  const demoCredentials = [
    { role: 'Administrator', username: 'admin', password: 'admin123' },
    { role: 'Faculty', username: 'faculty', password: 'faculty123' },
    { role: 'Student', username: 'student', password: 'student123' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(formData);
      if (result.success) {
        success(`Welcome back, ${result.user.firstName}!`);
      }
    } catch (err) {
      error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (credentials) => {
    setIsLoading(true);
    try {
      const result = await login(credentials);
      if (result.success) {
        success(`Welcome, ${result.user.firstName}!`);
      }
    } catch (err) {
      error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: theme.colors.surface,
        padding: '40px',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        border: `1px solid ${theme.colors.border}`
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: theme.colors.text, margin: '0 0 10px 0' }}>🎓 University Login</h1>
          <button onClick={toggleTheme} style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px'
          }}>
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${theme.colors.border}`,
                borderRadius: '8px',
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: `2px solid ${theme.colors.border}`,
                borderRadius: '8px',
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div>
          <h3 style={{ color: theme.colors.text, textAlign: 'center', marginBottom: '15px' }}>
            Demo Accounts
          </h3>
          {demoCredentials.map((cred, index) => (
            <div key={index} style={{
              marginBottom: '10px',
              padding: '15px',
              backgroundColor: theme.colors.background,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div>
                  <div style={{ color: theme.colors.text, fontWeight: '600' }}>
                    {cred.role}
                  </div>
                  <div style={{ color: theme.colors.textSecondary, fontSize: '14px' }}>
                    {cred.username} / {cred.password}
                  </div>
                </div>
                <button
                  onClick={() => quickLogin(cred)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: theme.colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Login
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Protected Navbar
const ProtectedNavbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, hasPermission } = useAuth();
  const { success } = useNotification();
  const { theme, toggleTheme, isDark } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', permission: PERMISSIONS.DASHBOARD_VIEW },
    { id: 'courses', label: 'Courses', icon: '📚', permission: PERMISSIONS.COURSES_VIEW },
    { id: 'students', label: 'Students', icon: '👨‍🎓', permission: PERMISSIONS.STUDENTS_VIEW },
    { id: 'registrations', label: 'Registrations', icon: '📝', permission: PERMISSIONS.REGISTRATIONS_VIEW },
    { id: 'results', label: 'Results', icon: '📈', permission: PERMISSIONS.RESULTS_VIEW }
  ].filter(item => hasPermission(item.permission));

  const handleLogout = () => {
    logout();
    success('Successfully logged out!');
  };

  return (
    <nav style={{
      backgroundColor: theme.colors.surface,
      borderBottom: `1px solid ${theme.colors.border}`,
      padding: '10px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <h2 style={{ color: theme.colors.text, margin: 0 }}>🎓 University</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === item.id ? theme.colors.primary : theme.colors.textSecondary,
                fontWeight: activeTab === item.id ? '600' : '400',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: activeTab === item.id ? theme.colors.light : 'transparent'
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={toggleTheme} style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px'
        }}>
          {isDark ? '☀️' : '🌙'}
        </button>
        <span style={{ color: theme.colors.text }}>
          {user?.firstName} ({user?.role})
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

// Main App Content
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActiveComponent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <PermissionGuard permission={PERMISSIONS.DASHBOARD_VIEW} fallback={<UnauthorizedAccess />}>
            <EnhancedDashboard onNavigate={setActiveTab} />
          </PermissionGuard>
        );
      case 'courses':
        return (
          <PermissionGuard permission={PERMISSIONS.COURSES_VIEW} fallback={<UnauthorizedAccess />}>
            <EnhancedCourseManagement />
          </PermissionGuard>
        );
      case 'students':
        return (
          <PermissionGuard permission={PERMISSIONS.STUDENTS_VIEW} fallback={<UnauthorizedAccess />}>
            <EnhancedStudentManagement />
          </PermissionGuard>
        );
      case 'registrations':
        return (
          <PermissionGuard permission={PERMISSIONS.REGISTRATIONS_VIEW} fallback={<UnauthorizedAccess />}>
            <EnhancedRegistrationManagement />
          </PermissionGuard>
        );
      case 'results':
        return (
          <PermissionGuard permission={PERMISSIONS.RESULTS_VIEW} fallback={<UnauthorizedAccess />}>
            <EnhancedResultsManagement />
          </PermissionGuard>
        );
      default:
        return (
          <PermissionGuard permission={PERMISSIONS.DASHBOARD_VIEW} fallback={<UnauthorizedAccess />}>
            <EnhancedDashboard onNavigate={setActiveTab} />
          </PermissionGuard>
        );
    }
  };

  return (
    <div>
      <ProtectedNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>{renderActiveComponent()}</main>
    </div>
  );
};

// Unauthorized Access Component
const UnauthorizedAccess = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      backgroundColor: theme.colors.background,
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
      <h2 style={{ color: theme.colors.text }}>Access Denied</h2>
      <p style={{ color: theme.colors.textSecondary }}>
        Sorry, you don't have permission to access this section.
      </p>
      <p style={{ color: theme.colors.textSecondary }}>
        Your current role: <strong>{user?.role || 'Unknown'}</strong>
      </p>
    </div>
  );
};

// Main App Component
const CompleteAuthApp = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default CompleteAuthApp;