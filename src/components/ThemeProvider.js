import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme Context
const ThemeContext = createContext();

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme configurations
const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#333333',
      textSecondary: '#666666',
      border: '#dee2e6',
      shadow: '0 2px 10px rgba(0,0,0,0.1)'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#0d6efd',
      secondary: '#6c757d',
      success: '#198754',
      warning: '#fd7e14',
      danger: '#dc3545',
      info: '#0dcaf0',
      light: '#f8f9fa',
      dark: '#212529',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      textSecondary: '#aaaaaa',
      border: '#404040',
      shadow: '0 2px 10px rgba(0,0,0,0.3)'
    }
  }
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Apply theme to CSS variables
  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Update body class for theme-specific styles
    document.body.className = `theme-${currentTheme}`;
    
    // Save to localStorage
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const value = {
    theme: themes[currentTheme],
    currentTheme,
    toggleTheme,
    setTheme,
    isLight: currentTheme === 'light',
    isDark: currentTheme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Toggle Button Component
export const ThemeToggle = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={toggleButtonStyle}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

// Enhanced Navbar with Theme Toggle
export const EnhancedNavbar = ({ activeTab, setActiveTab }) => {
  const { theme } = useTheme();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'students', label: 'Students', icon: '👨‍🎓' },
    { id: 'registrations', label: 'Registrations', icon: '📝' },
    { id: 'results', label: 'Results', icon: '📈' }
  ];

  return (
    <nav style={{
      ...navbarStyle,
      backgroundColor: theme.colors.surface,
      borderBottom: `3px solid ${theme.colors.primary}`,
      boxShadow: theme.colors.shadow
    }}>
      <div style={navContainerStyle}>
        <div style={{
          ...brandStyle,
          color: theme.colors.primary
        }}>
          <h2>🎓 University Course Management</h2>
        </div>
        
        <ul style={navListStyle}>
          {navItems.map(item => (
            <li key={item.id} style={navItemStyle}>
              <button
                style={{
                  ...navLinkStyle,
                  color: activeTab === item.id ? theme.colors.primary : theme.colors.text,
                  backgroundColor: activeTab === item.id ? theme.colors.light : 'transparent',
                  borderBottom: activeTab === item.id ? `3px solid ${theme.colors.primary}` : 'none'
                }}
                onClick={() => setActiveTab(item.id)}
              >
                <span style={iconStyle}>{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div style={navActionsStyle}>
          <ThemeToggle />
          <button style={{
            ...actionButtonStyle,
            backgroundColor: theme.colors.primary,
            color: 'white'
          }}>
            👤 Profile
          </button>
        </div>
      </div>
    </nav>
  );
};

// CSS Variables Integration Component
export const GlobalThemeStyles = () => {
  return (
    <style jsx global>{`
      :root {
        --color-primary: #007bff;
        --color-background: #ffffff;
        --color-surface: #f8f9fa;
        --color-text: #333333;
        --color-border: #dee2e6;
        --color-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }

      body {
        background-color: var(--color-background);
        color: var(--color-text);
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      .theme-dark {
        --color-primary: #0d6efd;
        --color-background: #121212;
        --color-surface: #1e1e1e;
        --color-text: #ffffff;
        --color-border: #404040;
        --color-shadow: 0 2px 10px rgba(0,0,0,0.3);
      }

      .container {
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        box-shadow: var(--color-shadow);
      }

      .table {
        background-color: var(--color-surface);
        color: var(--color-text);
      }

      .table th {
        background-color: var(--color-background);
        border-bottom: 1px solid var(--color-border);
      }

      .table td {
        border-bottom: 1px solid var(--color-border);
      }

      .btn {
        transition: all 0.3s ease;
      }

      .modal-content {
        background-color: var(--color-surface);
        color: var(--color-text);
        border: 1px solid var(--color-border);
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        background-color: var(--color-background);
        color: var(--color-text);
        border: 2px solid var(--color-border);
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        border-color: var(--color-primary);
        background-color: var(--color-surface);
      }

      .search-input {
        background-color: var(--color-background);
        color: var(--color-text);
        border: 2px solid var(--color-border);
      }

      .page-header {
        border-bottom: 2px solid var(--color-border);
      }

      .loading {
        color: var(--color-text);
      }
    `}</style>
  );
};

// Styles
const toggleButtonStyle = {
  background: 'none',
  border: '2px solid var(--color-border)',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  fontSize: '18px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease'
};

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
  padding: '0 20px',
  maxWidth: '1200px',
  margin: '0 auto'
};

const brandStyle = {
  fontSize: '18px',
  fontWeight: '600'
};

const navListStyle = {
  display: 'flex',
  listStyle: 'none',
  gap: '0',
  margin: 0,
  padding: 0
};

const navItemStyle = {
  margin: 0
};

const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '15px 20px',
  textDecoration: 'none',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.3s ease',
  borderRadius: '0'
};

const iconStyle = {
  fontSize: '16px'
};

const navActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px'
};

const actionButtonStyle = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.3s ease'
};

export default ThemeProvider;