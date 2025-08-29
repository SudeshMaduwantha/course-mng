import React, { useState, useEffect } from 'react';
import { useAuth, PermissionGuard, PERMISSIONS } from './AuthContext';
import { useNotification } from './NotificationSystem';
import { useTheme } from './ThemeProvider';

const ProtectedNavbar = ({ activeTab, setActiveTab }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const { user, logout, hasPermission, ROLES } = useAuth();
  const { success, info } = useNotification();
  const { theme, toggleTheme, isDark } = useTheme();

  // Role-based navigation items
  const getNavItems = () => {
    const items = [];

    // Dashboard - visible to all authenticated users
    if (hasPermission(PERMISSIONS.DASHBOARD_VIEW)) {
      items.push({
        id: 'dashboard',
        label: 'Dashboard',
        icon: '📊',
        description: 'System overview and analytics'
      });
    }

    // Courses - based on permissions
    if (hasPermission(PERMISSIONS.COURSES_VIEW)) {
      items.push({
        id: 'courses',
        label: 'Courses',
        icon: '📚',
        description: 'Manage course catalog'
      });
    }

    // Students - admin and faculty only
    if (hasPermission(PERMISSIONS.STUDENTS_VIEW)) {
      items.push({
        id: 'students',
        label: 'Students',
        icon: '👨‍🎓',
        description: 'Student records and profiles'
      });
    }

    // Registrations - based on permissions
    if (hasPermission(PERMISSIONS.REGISTRATIONS_VIEW)) {
      items.push({
        id: 'registrations',
        label: 'Registrations',
        icon: '📝',
        description: 'Course enrollments'
      });
    }

    // Results - based on permissions
    if (hasPermission(PERMISSIONS.RESULTS_VIEW)) {
      items.push({
        id: 'results',
        label: 'Results',
        icon: '📈',
        description: 'Grades and transcripts'
      });
    }

    return items;
  };

  const navItems = getNavItems();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-menu') && !event.target.closest('.profile-button')) {
        setShowProfileMenu(false);
      }
      if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-btn')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (tabId, tabLabel) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    info(`Navigated to ${tabLabel}`);
  };

  const handleLogout = async () => {
    try {
      const result = logout();
      if (result.success) {
        success('Successfully logged out. See you next time!');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case ROLES.ADMIN: return '#dc3545';
      case ROLES.FACULTY: return '#28a745';
      case ROLES.STUDENT: return '#007bff';
      default: return '#6c757d';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case ROLES.ADMIN: return 'Administrator';
      case ROLES.FACULTY: return 'Faculty';
      case ROLES.STUDENT: return 'Student';
      default: return 'User';
    }
  };

  return (
    <>
      <nav style={{
        ...navbarStyle,
        backgroundColor: theme.colors.surface,
        boxShadow: isScrolled 
          ? '0 4px 20px rgba(0,0,0,0.15)' 
          : '0 2px 10px rgba(0,0,0,0.1)',
        borderBottom: `3px solid ${theme.colors.primary}`,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={navContainerStyle}>
          {/* Enhanced Brand */}
          <div style={brandContainerStyle}>
            <div style={{
              ...brandLogoStyle,
              background: `linear-gradient(135deg, ${theme.colors.primary}, #0056b3)`
            }}>
              🎓
            </div>
            <div style={brandTextStyle}>
              <div style={{
                ...brandTitleStyle,
                color: theme.colors.text
              }}>
                University Course Management
              </div>
              <div style={brandSubtitleStyle}>
                Welcome, {user?.firstName} ({getRoleLabel(user?.role)})
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <ul style={navListStyle} className="desktop-nav">
            {navItems.map(item => (
              <li key={item.id} style={navItemStyle}>
                <button
                  style={{
                    ...navLinkStyle,
                    color: activeTab === item.id ? theme.colors.primary : theme.colors.text,
                    backgroundColor: activeTab === item.id ? theme.colors.light : 'transparent',
                    borderBottom: activeTab === item.id ? `3px solid ${theme.colors.primary}` : 'none',
                    transform: activeTab === item.id ? 'translateY(-2px)' : 'none'
                  }}
                  onClick={() => handleNavClick(item.id, item.label)}
                  title={item.description}
                >
                  <span style={iconStyle}>{item.icon}</span>
                  <span>{item.label}</span>
                  {activeTab === item.id && (
                    <div style={activeIndicatorStyle}></div>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Right Side Actions */}
          <div style={navActionsStyle}>
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              style={{
                ...actionButtonStyle,
                backgroundColor: theme.colors.primary,
                color: 'white'
              }}
              title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Profile Menu */}
            <div style={profileContainerStyle} className="profile-menu">
              <button 
                style={{
                  ...profileButtonStyle,
                  backgroundColor: theme.colors.background,
                  border: `2px solid ${getRoleColor(user?.role)}`
                }}
                onClick={handleProfileClick}
                className="profile-button"
                title="User Profile & Settings"
              >
                <div style={{
                  ...avatarStyle,
                  backgroundColor: getRoleColor(user?.role)
                }}>
                  {user?.avatar || user?.firstName?.charAt(0) || 'U'}
                </div>
                <div style={profileInfoStyle}>
                  <div style={profileNameStyle}>{user?.firstName} {user?.lastName}</div>
                  <div style={{
                    ...profileRoleStyle,
                    color: getRoleColor(user?.role)
                  }}>
                    {getRoleLabel(user?.role)}
                  </div>
                </div>
                <span style={dropdownArrowStyle}>
                  {showProfileMenu ? '▲' : '▼'}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div style={{
                  ...profileDropdownStyle,
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`
                }}>
                  <div style={profileMenuHeaderStyle}>
                    <div style={{
                      ...profileMenuAvatarStyle,
                      backgroundColor: getRoleColor(user?.role)
                    }}>
                      {user?.avatar || user?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div style={{
                        ...profileMenuNameStyle,
                        color: theme.colors.text
                      }}>
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div style={profileMenuEmailStyle}>
                        {user?.email}
                      </div>
                      <div style={{
                        ...profileMenuRoleStyle,
                        backgroundColor: getRoleColor(user?.role)
                      }}>
                        {getRoleLabel(user?.role)}
                      </div>
                    </div>
                  </div>

                  <div style={profileMenuDividerStyle}></div>

                  <div style={profileMenuItemsStyle}>
                    <button style={{
                      ...profileMenuItemStyle,
                      color: theme.colors.text
                    }}>
                      <span style={profileMenuIconStyle}>👤</span>
                      View Profile
                    </button>
                    <button style={{
                      ...profileMenuItemStyle,
                      color: theme.colors.text
                    }}>
                      <span style={profileMenuIconStyle}>⚙️</span>
                      Settings
                    </button>
                    <button style={{
                      ...profileMenuItemStyle,
                      color: theme.colors.text
                    }}>
                      <span style={profileMenuIconStyle}>🔔</span>
                      Notifications
                    </button>
                    
                    {/* Admin-only menu items */}
                    <PermissionGuard permission={PERMISSIONS.SYSTEM_ADMIN}>
                      <div style={profileMenuDividerStyle}></div>
                      <button style={{
                        ...profileMenuItemStyle,
                        color: theme.colors.text
                      }}>
                        <span style={profileMenuIconStyle}>🛠️</span>
                        System Admin
                      </button>
                      <button style={{
                        ...profileMenuItemStyle,
                        color: theme.colors.text
                      }}>
                        <span style={profileMenuIconStyle}>📊</span>
                        Analytics
                      </button>
                    </PermissionGuard>

                    <div style={profileMenuDividerStyle}></div>
                    
                    <button 
                      style={{
                        ...profileMenuItemStyle,
                        color: '#dc3545'
                      }}
                      onClick={handleLogout}
                    >
                      <span style={profileMenuIconStyle}>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              style={{
                ...mobileMenuButtonStyle,
                color: theme.colors.text
              }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-btn"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div style={{
            ...mobileMenuStyle,
            backgroundColor: theme.colors.surface,
            borderTop: `1px solid ${theme.colors.border}`
          }} className="mobile-menu">
            {/* Mobile User Info */}
            <div style={{
              ...mobileUserInfoStyle,
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border
            }}>
              <div style={{
                ...mobileAvatarStyle,
                backgroundColor: getRoleColor(user?.role)
              }}>
                {user?.avatar || user?.firstName?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{
                  ...mobileUserNameStyle,
                  color: theme.colors.text
                }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{
                  ...mobileUserRoleStyle,
                  color: getRoleColor(user?.role)
                }}>
                  {getRoleLabel(user?.role)}
                </div>
              </div>
            </div>

            {/* Mobile Navigation Items */}
            {navItems.map(item => (
              <button
                key={item.id}
                style={{
                  ...mobileNavItemStyle,
                  backgroundColor: activeTab === item.id ? theme.colors.primary : 'transparent',
                  color: activeTab === item.id ? 'white' : theme.colors.text
                }}
                onClick={() => handleNavClick(item.id, item.label)}
              >
                <span style={mobileIconStyle}>{item.icon}</span>
                <div style={mobileTextStyle}>
                  <div style={mobileLabelStyle}>{item.label}</div>
                  <div style={mobileDescStyle}>{item.description}</div>
                </div>
              </button>
            ))}

            {/* Mobile Actions */}
            <div style={mobileActionsStyle}>
              <button
                style={{
                  ...mobileActionButtonStyle,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }}
                onClick={toggleTheme}
              >
                {isDark ? '☀️' : '🌙'} Switch Theme
              </button>
              <button
                style={{
                  ...mobileActionButtonStyle,
                  backgroundColor: '#dc3545',
                  color: 'white'
                }}
                onClick={handleLogout}
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div style={navSpacerStyle}></div>
    </>
  );
};

// Enhanced Styles
const navbarStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  transition: 'all 0.3s ease'
};

const navContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 20px',
  maxWidth: '1400px',
  margin: '0 auto'
};

const brandContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const brandLogoStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  color: 'white',
  boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
};

const brandTextStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const brandTitleStyle = {
  fontSize: '18px',
  fontWeight: '700',
  lineHeight: '1.2',
  margin: 0
};

const brandSubtitleStyle = {
  fontSize: '11px',
  color: 'var(--color-text-secondary)',
  fontWeight: '500',
  marginTop: '2px'
};

const navListStyle = {
  display: 'flex',
  listStyle: 'none',
  gap: '4px',
  margin: 0,
  padding: 0
};

const navItemStyle = {
  margin: 0,
  position: 'relative'
};

const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 18px',
  textDecoration: 'none',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.3s ease',
  borderRadius: '8px',
  position: 'relative',
  minHeight: '44px'
};

const iconStyle = {
  fontSize: '16px'
};

const activeIndicatorStyle = {
  position: 'absolute',
  bottom: '-15px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: 'var(--color-primary)'
};

const navActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const actionButtonStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  transition: 'all 0.2s ease'
};

const profileContainerStyle = {
  position: 'relative'
};

const profileButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  borderRadius: '20px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '14px',
  backgroundColor: 'transparent'
};

const avatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 'bold'
};

const profileInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
};

const profileNameStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--color-text)',
  lineHeight: '1'
};

const profileRoleStyle = {
  fontSize: '11px',
  lineHeight: '1',
  marginTop: '2px',
  fontWeight: '500'
};

const dropdownArrowStyle = {
  fontSize: '10px',
  color: 'var(--color-text-secondary)',
  marginLeft: '4px'
};

const profileDropdownStyle = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '8px',
  minWidth: '280px',
  borderRadius: '12px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  zIndex: 1000
};

const profileMenuHeaderStyle = {
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const profileMenuAvatarStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  fontWeight: 'bold'
};

const profileMenuNameStyle = {
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '4px'
};

const profileMenuEmailStyle = {
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  marginBottom: '8px'
};

const profileMenuRoleStyle = {
  display: 'inline-block',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 'bold',
  color: 'white'
};

const profileMenuDividerStyle = {
  height: '1px',
  backgroundColor: 'var(--color-border)',
  margin: '8px 0'
};

const profileMenuItemsStyle = {
  padding: '8px'
};

const profileMenuItemStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  textAlign: 'left'
};

const profileMenuIconStyle = {
  fontSize: '16px',
  minWidth: '20px'
};

const mobileMenuButtonStyle = {
  display: 'none',
  width: '40px',
  height: '40px',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: '18px',
  borderRadius: '8px'
};

const mobileMenuStyle = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  padding: '12px',
  maxHeight: '80vh',
  overflowY: 'auto'
};

const mobileUserInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  margin: '0 0 16px 0',
  border: '1px solid',
  borderRadius: '12px'
};

const mobileAvatarStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 'bold'
};

const mobileUserNameStyle = {
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1.2'
};

const mobileUserRoleStyle = {
  fontSize: '12px',
  fontWeight: '500',
  marginTop: '2px'
};

const mobileNavItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  margin: '4px 0',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  width: '100%',
  textAlign: 'left'
};

const mobileIconStyle = {
  fontSize: '20px',
  minWidth: '24px'
};

const mobileTextStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1
};

const mobileLabelStyle = {
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1.2'
};

const mobileDescStyle = {
  fontSize: '12px',
  opacity: 0.8,
  marginTop: '2px'
};

const mobileActionsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: '1px solid var(--color-border)'
};

const mobileActionButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px',
  border: '1px solid',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s ease'
};

const navSpacerStyle = {
  height: '76px'
};

// CSS for responsive behavior
const cssStyles = `
@media (max-width: 768px) {
  .desktop-nav {
    display: none !important;
  }
  
  .mobile-menu-btn {
    display: flex !important;
  }
}

@media (min-width: 769px) {
  .mobile-menu-btn {
    display: none !important;
  }
}

/* Hover effects */
nav button:hover {
  transform: translateY(-1px);
}

nav button:active {
  transform: translateY(0);
}

/* Profile menu hover */
.profile-menu button:hover {
  background-color: var(--color-light) !important;
}
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = cssStyles;
  if (!document.head.querySelector('style[data-protected-navbar]')) {
    styleSheet.setAttribute('data-protected-navbar', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default ProtectedNavbar;