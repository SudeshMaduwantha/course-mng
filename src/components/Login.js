import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationSystem';
import { useTheme } from './ThemeProvider';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useNotification();
  const { theme, toggleTheme, isDark } = useTheme();

  // Demo credentials for easy testing
  const demoCredentials = [
    { role: 'Administrator', username: 'admin', password: 'admin123' },
    { role: 'Faculty', username: 'faculty', password: 'faculty123' },
    { role: 'Student', username: 'student', password: 'student123' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      error('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(formData);
      if (result.success) {
        success(`Welcome back, ${result.user.firstName}!`);
      }
    } catch (err) {
      error(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (credentials) => {
    setFormData({
      username: credentials.username,
      password: credentials.password
    });
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
      ...containerStyle,
      backgroundColor: theme.colors.background
    }}>
      {/* Background Pattern */}
      <div style={backgroundPatternStyle}></div>
      
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        style={{
          ...themeToggleStyle,
          backgroundColor: theme.colors.surface,
          color: theme.colors.text
        }}
        title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div style={loginCardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={logoStyle}>🎓</div>
          <h1 style={{
            ...titleStyle,
            color: theme.colors.text
          }}>
            University Course Management
          </h1>
          <p style={{
            ...subtitleStyle,
            color: theme.colors.textSecondary
          }}>
            Sign in to access your academic dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={{
              ...labelStyle,
              color: theme.colors.text
            }}>
              Username
            </label>
            <div style={inputContainerStyle}>
              <span style={inputIconStyle}>👤</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                style={{
                  ...inputStyle,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }}
                required
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <label style={{
              ...labelStyle,
              color: theme.colors.text
            }}>
              Password
            </label>
            <div style={inputContainerStyle}>
              <span style={inputIconStyle}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                style={{
                  ...inputStyle,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={passwordToggleStyle}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={optionsStyle}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={checkboxStyle}
              />
              <span style={{
                color: theme.colors.textSecondary
              }}>
                Remember me
              </span>
            </label>
            <button
              type="button"
              style={{
                ...forgotPasswordStyle,
                color: theme.colors.primary
              }}
            >
              Forgot password?
            </button> 
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...loginButtonStyle,
              backgroundColor: isLoading ? '#ccc' : theme.colors.primary,
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? (
              <div style={buttonLoadingStyle}>
                <div style={buttonSpinnerStyle}></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={demoSectionStyle}>
          <h3 style={{
            ...demoTitleStyle,
            color: theme.colors.text
          }}>
            🎯 Demo Credentials
          </h3>
          <p style={{
            ...demoDescStyle,
            color: theme.colors.textSecondary
          }}>
            Click to fill form or login directly:
          </p>
          
          <div style={demoButtonsStyle}>
            {demoCredentials.map((cred, index) => (
              <div key={index} style={demoItemStyle}>
                <div style={{
                  ...demoInfoStyle,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }}>
                  <div style={demoRoleStyle}>
                    <span style={demoIconStyle}>
                      {cred.role === 'Administrator' ? '👑' : 
                       cred.role === 'Faculty' ? '👩‍🏫' : '👨‍🎓'}
                    </span>
                    <strong style={{
                      color: theme.colors.text
                    }}>
                      {cred.role}
                    </strong>
                  </div>
                  <div style={{
                    ...demoCredStyle,
                    color: theme.colors.textSecondary
                  }}>
                    {cred.username} / {cred.password}
                  </div>
                  <div style={demoActionsStyle}>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin(cred)}
                      style={{
                        ...fillButtonStyle,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: theme.colors.border
                      }}
                    >
                      Fill Form
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLogin(cred)}
                      style={{
                        ...quickLoginButtonStyle,
                        backgroundColor: theme.colors.primary
                      }}
                      disabled={isLoading}
                    >
                      Quick Login
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <p style={{
            ...footerTextStyle,
            color: theme.colors.textSecondary
          }}>
            © 2024 University Course Management System
          </p>
          <div style={footerLinksStyle}>
            <button style={{
              ...footerLinkStyle,
              color: theme.colors.textSecondary
            }}>
              Privacy Policy
            </button>
            <span style={{
              color: theme.colors.textSecondary
            }}>
              •
            </span>
            <button style={{
              ...footerLinkStyle,
              color: theme.colors.textSecondary
            }}>
              Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  position: 'relative',
  overflow: 'hidden'
};

const backgroundPatternStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `
    radial-gradient(circle at 20% 80%, rgba(0, 123, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(40, 167, 69, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 193, 7, 0.1) 0%, transparent 50%)
  `,
  zIndex: -1
};

const themeToggleStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  border: '2px solid var(--color-border)',
  cursor: 'pointer',
  fontSize: '20px',
  transition: 'all 0.3s ease',
  zIndex: 10
};

const loginCardStyle = {
  backgroundColor: 'var(--color-surface)',
  borderRadius: '20px',
  padding: '40px',
  width: '100%',
  maxWidth: '480px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  border: '1px solid var(--color-border)',
  backdropFilter: 'blur(10px)'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '40px'
};

const logoStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '20px',
  backgroundColor: '#007bff',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '40px',
  margin: '0 auto 20px',
  boxShadow: '0 10px 30px rgba(0, 123, 255, 0.3)'
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  lineHeight: '1.3'
};

const subtitleStyle = {
  fontSize: '16px',
  margin: 0,
  lineHeight: '1.5'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const labelStyle = {
  fontSize: '14px',
  fontWeight: '600'
};

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const inputIconStyle = {
  position: 'absolute',
  left: '16px',
  fontSize: '18px',
  zIndex: 1
};

const inputStyle = {
  width: '100%',
  padding: '16px 16px 16px 50px',
  border: '2px solid',
  borderRadius: '12px',
  fontSize: '16px',
  transition: 'all 0.3s ease'
};

const passwordToggleStyle = {
  position: 'absolute',
  right: '16px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '18px',
  padding: '4px'
};

const optionsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '14px'
};

const checkboxStyle = {
  margin: 0
};

const forgotPasswordStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  textDecoration: 'underline'
};

const loginButtonStyle = {
  padding: '16px',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  color: 'white',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px'
};

const buttonLoadingStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const buttonSpinnerStyle = {
  width: '16px',
  height: '16px',
  border: '2px solid rgba(255,255,255,0.3)',
  borderTop: '2px solid white',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const demoSectionStyle = {
  marginTop: '40px',
  padding: '24px 0',
  borderTop: '1px solid var(--color-border)'
};

const demoTitleStyle = {
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  textAlign: 'center'
};

const demoDescStyle = {
  fontSize: '14px',
  textAlign: 'center',
  margin: '0 0 20px 0'
};

const demoButtonsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const demoItemStyle = {
  width: '100%'
};

const demoInfoStyle = {
  padding: '16px',
  border: '1px solid',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const demoRoleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '16px'
};

const demoIconStyle = {
  fontSize: '20px'
};

const demoCredStyle = {
  fontSize: '13px',
  fontFamily: 'monospace',
  padding: '4px 8px',
  backgroundColor: 'rgba(0,0,0,0.05)',
  borderRadius: '4px'
};

const demoActionsStyle = {
  display: 'flex',
  gap: '8px'
};

const fillButtonStyle = {
  flex: 1,
  padding: '8px 16px',
  border: '1px solid',
  borderRadius: '8px',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const quickLoginButtonStyle = {
  flex: 1,
  padding: '8px 16px',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  color: 'white',
  transition: 'all 0.2s ease'
};

const footerStyle = {
  marginTop: '40px',
  padding: '20px 0',
  borderTop: '1px solid var(--color-border)',
  textAlign: 'center'
};

const footerTextStyle = {
  fontSize: '12px',
  margin: '0 0 8px 0'
};

const footerLinksStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px'
};

const footerLinkStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '12px',
  textDecoration: 'underline'
};

export default Login;