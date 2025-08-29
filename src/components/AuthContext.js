import React, { createContext, useContext, useState, useEffect } from 'react';

// Authentication Context
const AuthContext = createContext();

// Custom hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// User roles and permissions
export const ROLES = {
  ADMIN: 'ADMIN',
  FACULTY: 'FACULTY', 
  STUDENT: 'STUDENT'
};

export const PERMISSIONS = {
  // Course Management
  COURSES_VIEW: 'courses.view',
  COURSES_CREATE: 'courses.create',
  COURSES_EDIT: 'courses.edit',
  COURSES_DELETE: 'courses.delete',
  
  // Student Management
  STUDENTS_VIEW: 'students.view',
  STUDENTS_CREATE: 'students.create',
  STUDENTS_EDIT: 'students.edit',
  STUDENTS_DELETE: 'students.delete',
  
  // Registration Management
  REGISTRATIONS_VIEW: 'registrations.view',
  REGISTRATIONS_CREATE: 'registrations.create',
  REGISTRATIONS_DELETE: 'registrations.delete',
  
  // Results Management
  RESULTS_VIEW: 'results.view',
  RESULTS_EDIT: 'results.edit',
  RESULTS_VIEW_ALL: 'results.view_all',
  
  // System Management
  DASHBOARD_VIEW: 'dashboard.view',
  SYSTEM_ADMIN: 'system.admin'
};

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Full access to everything
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.COURSES_CREATE,
    PERMISSIONS.COURSES_EDIT,
    PERMISSIONS.COURSES_DELETE,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_EDIT,
    PERMISSIONS.STUDENTS_DELETE,
    PERMISSIONS.REGISTRATIONS_VIEW,
    PERMISSIONS.REGISTRATIONS_CREATE,
    PERMISSIONS.REGISTRATIONS_DELETE,
    PERMISSIONS.RESULTS_VIEW,
    PERMISSIONS.RESULTS_EDIT,
    PERMISSIONS.RESULTS_VIEW_ALL,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.SYSTEM_ADMIN
  ],
  [ROLES.FACULTY]: [
    // Faculty can manage courses and grades
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.COURSES_CREATE,
    PERMISSIONS.COURSES_EDIT,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.REGISTRATIONS_VIEW,
    PERMISSIONS.RESULTS_VIEW,
    PERMISSIONS.RESULTS_EDIT,
    PERMISSIONS.DASHBOARD_VIEW
  ],
  [ROLES.STUDENT]: [
    // Students can only view their own data
    PERMISSIONS.COURSES_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.REGISTRATIONS_VIEW,
    PERMISSIONS.RESULTS_VIEW
  ]
};

// Mock user data (in real app, this would come from your backend)
const MOCK_USERS = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@university.edu',
    firstName: 'System',
    lastName: 'Administrator',
    role: ROLES.ADMIN,
    avatar: 'A'
  },
  {
    id: 2,
    username: 'faculty',
    password: 'faculty123',
    email: 'faculty@university.edu',
    firstName: 'John',
    lastName: 'Professor',
    role: ROLES.FACULTY,
    avatar: 'J'
  },
  {
    id: 3,
    username: 'student',
    password: 'student123',
    email: 'student@university.edu',
    firstName: 'Jane',
    lastName: 'Student',
    role: ROLES.STUDENT,
    avatar: 'J'
  }
];

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        const storedToken = localStorage.getItem('auth_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock data
      const foundUser = MOCK_USERS.find(
        u => u.username === credentials.username && u.password === credentials.password
      );
      
      if (!foundUser) {
        throw new Error('Invalid username or password');
      }
      
      // Generate mock token
      const token = `mock_token_${foundUser.id}_${Date.now()}`;
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = foundUser;
      
      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('auth_token', token);
      
      // Update state
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all specified permissions
  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) return false;
    return permissions.every(permission => hasPermission(permission));
  };

  // Get all user permissions
  const getUserPermissions = () => {
    if (!user || !user.role) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...profileData };
      
      // Update localStorage
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, validate current password with backend
      const mockUser = MOCK_USERS.find(u => u.id === user.id);
      if (mockUser.password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password in mock data (in real app, send to backend)
      mockUser.password = newPassword;
      
      return { success: true };
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  };

  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    updateProfile,
    changePassword,
    
    // Permissions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    
    // Constants
    ROLES,
    PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protecting routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
      return (
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          <p>Loading...</p>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return null; // Will be handled by the main app to show login
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Component for permission-based rendering
export const PermissionGuard = ({ 
  permission, 
  permissions, 
  requireAll = false, 
  fallback = null, 
  children 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  
  let hasAccess = false;
  
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }
  
  return hasAccess ? children : fallback;
};

// Role-based component
export const RoleGuard = ({ roles, fallback = null, children }) => {
  const { user } = useAuth();
  
  const hasRole = Array.isArray(roles) 
    ? roles.includes(user?.role)
    : user?.role === roles;
  
  return hasRole ? children : fallback;
};

// Styles
const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  gap: '20px'
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #007bff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

export default AuthProvider;