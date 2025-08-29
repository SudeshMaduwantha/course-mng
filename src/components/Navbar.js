import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import { useNotification } from './NotificationSystem';

const EnhancedNavbar = ({ activeTab, setActiveTab }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count
  
  const { theme, toggleTheme, isDark } = useTheme();
  const { info } = useNotification();

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '📊',
      description: 'System overview and analytics'
    },
    { 
      id: 'courses', 
      label: 'Courses', 
      icon: '📚',
      description: 'Manage course catalog'
    },
    { 
      id: 'students', 
      label: 'Students', 
      icon: '👨‍🎓',
      description: 'Student records and profiles'
    },
    { 
      id: 'registrations', 
      label: 'Registrations', 
      icon: '📝',
      description: 'Course enrollments'
    },
    { 
      id: 'results', 
      label: 'Results', 
      icon: '📈',
      description: 'Grades and transcripts'
    }
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (tabId, tabLabel) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    info(`Navigated to ${tabLabel}`);
  };

  const handleProfileClick = () => {
    info('Profile menu - Coming soon!');
  };

  const handleNotificationClick = () => {
    info(`You have ${notifications} new notifications`);
    setNotifications(0);
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
                Academic Excellence Platform
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
            {/* Search Button */}
            <button 
              style={{
                ...actionButtonStyle,
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.border}`
              }}
              title="Global Search"
              onClick={() => info('Global search - Coming soon!')}
            >
              🔍
            </button>

            {/* Notifications */}
            <div style={notificationContainerStyle}>
              <button 
                style={{
                  ...actionButtonStyle,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`
                }}
                title="Notifications"
                onClick={handleNotificationClick}
              >
                🔔
                {notifications > 0 && (
                  <span style={notificationBadgeStyle}>{notifications}</span>
                )}
              </button>
            </div>

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
            <div style={profileContainerStyle}>
              <button 
                style={{
                  ...profileButtonStyle,
                  backgroundColor: theme.colors.background,
                  border: `2px solid ${theme.colors.primary}`
                }}
                onClick={handleProfileClick}
                title="User Profile"
              >
                <div style={avatarStyle}>A</div>
                <div style={profileInfoStyle}>
                  <div style={profileNameStyle}>Admin</div>
                  <div style={profileRoleStyle}>Administrator</div>
                </div>
                <span style={dropdownArrowStyle}>▼</span>
              </button>
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
          }}>
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
  transition: 'all 0.2s ease',
  position: 'relative'
};

const notificationContainerStyle = {
  position: 'relative'
};

const notificationBadgeStyle = {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  backgroundColor: '#dc3545',
  color: 'white',
  borderRadius: '10px',
  fontSize: '10px',
  fontWeight: 'bold',
  padding: '2px 6px',
  minWidth: '16px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
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
  fontSize: '14px'
};

const avatarStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: 'var(--color-primary)',
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
  color: 'var(--color-text-secondary)',
  lineHeight: '1',
  marginTop: '2px'
};

const dropdownArrowStyle = {
  fontSize: '10px',
  color: 'var(--color-text-secondary)',
  marginLeft: '4px'
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
  maxHeight: '400px',
  overflowY: 'auto'
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

const navSpacerStyle = {
  height: '76px' // Adjust based on navbar height
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
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = cssStyles;
  if (!document.head.querySelector('style[data-navbar]')) {
    styleSheet.setAttribute('data-navbar', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default EnhancedNavbar;