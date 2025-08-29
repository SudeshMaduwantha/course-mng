import React from 'react';
import { useTheme } from './ThemeProvider';
import { useNotification } from './NotificationSystem';

const Footer = () => {
  const { theme } = useTheme();
  const { info, success } = useNotification();

  const currentYear = new Date().getFullYear();

  const handleLinkClick = (linkName) => {
    info(`${linkName} - Coming soon!`);
  };

  const handleSocialClick = (platform) => {
    success(`Connect with us on ${platform}!`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      success(`Newsletter subscription successful for ${email}!`);
      e.target.reset();
    }
  };

  return (
    <footer style={{
      ...footerStyle,
      backgroundColor: theme.colors.dark,
      borderTop: `1px solid ${theme.colors.border}`
    }}>
      {/* Main Footer Content */}
      <div style={footerContainerStyle}>
        <div style={footerContentStyle}>
          
          {/* University Info Section */}
          <div style={footerSectionStyle}>
            <div style={footerLogoSectionStyle}>
              <div style={footerLogoStyle}>🎓</div>
              <div>
                <h3 style={footerTitleStyle}>University Course Management</h3>
                <p style={footerDescriptionStyle}>
                  Empowering academic excellence through innovative technology solutions.
                  Streamlining education management for the digital age.
                </p>
              </div>
            </div>
            
            {/* Contact Info */}
            <div style={contactInfoStyle}>
              <div style={contactItemStyle}>
                <span style={contactIconStyle}>📍</span>
                <span>Colombo/3</span>
              </div>
              <div style={contactItemStyle}>
                <span style={contactIconStyle}>📞</span>
                <span>+94 713172922</span>
              </div>
              <div style={contactItemStyle}>
                <span style={contactIconStyle}>📧</span>
                <span>kumaras-ct19058@edu.kln.ac.lk</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div style={footerSectionStyle}>
            <h4 style={sectionTitleStyle}>Quick Links</h4>
            <ul style={linkListStyle}>
              <li>
                <button 
                  style={footerLinkStyle}
                  onClick={() => handleLinkClick('Academic Calendar')}
                >
                  📅 Academic Calendar
                </button>
              </li>
              <li>
                <button 
                  style={footerLinkStyle}
                  onClick={() => handleLinkClick('Student Portal')}
                >
                  👨‍🎓 Student Portal
                </button>
              </li>
              <li>
                <button 
                  style={footerLinkStyle}
                  onClick={() => handleLinkClick('Faculty Resources')}
                >
                  👩‍🏫 Faculty Resources
                </button>
              </li>
              <li>
                <button 
                  style={footerLinkStyle}
                  onClick={() => handleLinkClick('Library Services')}
                >
                  📚 Library Services
                </button>
              </li>
              <li>
                <button 
                  style={footerLinkStyle}
                  onClick={() => handleLinkClick('IT Support')}
                >
                  💻 IT Support
                </button>
              </li>
            </ul>
          </div>

          {/* Academic Services */}
          <div style={footerSectionStyle}>
            <h4 style={sectionTitleStyle}>Academic Services</h4>
            <ul style={linkListStyle}>
              <li>
                <button 
                  style={footerLinkStyle}
                  onClick={() => handleLinkClick('Course Registration')}
                >
                  📝 Course Registration
                </button>
              </li>
              <li>
                <button 
                  style={footerLinkStyle}
                  onClick={() => handleLinkClick('Grade Reports')}
                >
                  📊 Grade Reports
                </button>
              </li>
              <li>
                <button 
                  style={footerLinkStyle}
                  onClick={() => handleLinkClick('Transcript Services')}
                >
                  📄 Transcript Services
                </button>
              </li>
              <li>
                <button 
                  style={footerLinkStyle}
                  onClick={() => handleLinkClick('Academic Advising')}
                >
                  🎯 Academic Advising
                </button>
              </li>
              <li>
                <button 
                  style={footerLinkStyle}
                  onClick={() => handleLinkClick('Career Services')}
                >
                  💼 Career Services
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div style={footerSectionStyle}>
            <h4 style={sectionTitleStyle}>Stay Connected</h4>
            
            {/* Newsletter Signup */}
            <div style={newsletterSectionStyle}>
              <p style={newsletterDescStyle}>
                Get updates on academic news and system announcements
              </p>
              <form onSubmit={handleNewsletterSubmit} style={newsletterFormStyle}>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  style={newsletterInputStyle}
                  required
                />
                <button type="submit" style={newsletterButtonStyle}>
                  Subscribe
                </button>
              </form>
            </div>

            {/* Social Media Links */}
            <div style={socialSectionStyle}>
              <h5 style={socialTitleStyle}>Follow Us</h5>
              <div style={socialLinksStyle}>
                <button 
                  style={socialButtonStyle}
                  onClick={() => handleSocialClick('Facebook')}
                  title="Facebook"
                >
                  📘
                </button>
                <button 
                  style={socialButtonStyle}
                  onClick={() => handleSocialClick('Twitter')}
                  title="Twitter"
                >
                  🐦
                </button>
                <button 
                  style={socialButtonStyle}
                  onClick={() => handleSocialClick('LinkedIn')}
                  title="LinkedIn"
                >
                  💼
                </button>
                <button 
                  style={socialButtonStyle}
                  onClick={() => handleSocialClick('Instagram')}
                  title="Instagram"
                >
                  📷
                </button>
                <button 
                  style={socialButtonStyle}
                  onClick={() => handleSocialClick('YouTube')}
                  title="YouTube"
                >
                  📺
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div style={{
        ...footerBottomStyle,
        borderTop: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background
      }}>
        <div style={footerBottomContainerStyle}>
          <div style={copyrightStyle}>
            <p style={copyrightTextStyle}>
              © {currentYear} University Course Management System. All rights reserved.
            </p>
            <p style={developedByStyle}>
              Developed ❤️ CT/2019/058 Kumarasiri.P.G.S.M
            </p>
          </div>
          
          <div style={footerLinksStyle}>
            <button 
              style={bottomLinkStyle}
              onClick={() => handleLinkClick('Privacy Policy')}
            >
              Privacy Policy
            </button>
            <span style={separatorStyle}>•</span>
            <button 
              style={bottomLinkStyle}
              onClick={() => handleLinkClick('Terms of Service')}
            >
              Terms of Service
            </button>
            <span style={separatorStyle}>•</span>
            <button 
              style={bottomLinkStyle}
              onClick={() => handleLinkClick('Accessibility')}
            >
              Accessibility
            </button>
            <span style={separatorStyle}>•</span>
            <button 
              style={bottomLinkStyle}
              onClick={() => handleLinkClick('Contact Us')}
            >
              Contact Us
            </button>
          </div>

          {/* System Status */}
          <div style={systemStatusStyle}>
            <div style={statusIndicatorStyle}>
              <span style={statusDotStyle}></span>
              <span style={statusTextStyle}>All Systems Operational</span>
            </div>
            <div style={lastUpdatedStyle}>
              Last Updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Styles
const footerStyle = {
  marginTop: 'auto',
  width: '100%'
};

const footerContainerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '60px 20px 40px'
};

const footerContentStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '40px'
};

const footerSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const footerLogoSectionStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  marginBottom: '20px'
};

const footerLogoStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  backgroundColor: '#007bff',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  flexShrink: 0
};

const footerTitleStyle = {
  color: 'white',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 12px 0',
  lineHeight: '1.3'
};

const footerDescriptionStyle = {
  color: '#aaa',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: 0
};

const contactInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const contactItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#ccc',
  fontSize: '14px'
};

const contactIconStyle = {
  fontSize: '16px',
  minWidth: '20px'
};

const sectionTitleStyle = {
  color: 'white',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px 0'
};

const linkListStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const footerLinkStyle = {
  color: '#ccc',
  textDecoration: 'none',
  fontSize: '14px',
  transition: 'color 0.3s ease',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  padding: '4px 0'
};

const newsletterSectionStyle = {
  marginBottom: '24px'
};

const newsletterDescStyle = {
  color: '#aaa',
  fontSize: '14px',
  marginBottom: '16px',
  lineHeight: '1.4'
};

const newsletterFormStyle = {
  display: 'flex',
  gap: '8px'
};

const newsletterInputStyle = {
  flex: 1,
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #555',
  backgroundColor: '#333',
  color: 'white',
  fontSize: '14px'
};

const newsletterButtonStyle = {
  padding: '12px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background-color 0.3s ease'
};

const socialSectionStyle = {
  marginTop: '24px'
};

const socialTitleStyle = {
  color: 'white',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px 0'
};

const socialLinksStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
};

const socialButtonStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  backgroundColor: '#333',
  border: '1px solid #555',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  transition: 'all 0.3s ease'
};

const footerBottomStyle = {
  padding: '24px 0'
};

const footerBottomContainerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '0 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '20px'
};

const copyrightStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const copyrightTextStyle = {
  color: '#999',
  fontSize: '14px',
  margin: 0
};

const developedByStyle = {
  color: '#666',
  fontSize: '12px',
  margin: 0
};

const footerLinksStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap'
};

const bottomLinkStyle = {
  color: '#999',
  textDecoration: 'none',
  fontSize: '13px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  transition: 'color 0.3s ease'
};

const separatorStyle = {
  color: '#666',
  fontSize: '12px'
};

const systemStatusStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '8px'
};

const statusIndicatorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const statusDotStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: '#28a745',
  animation: 'pulse 2s infinite'
};

const statusTextStyle = {
  color: '#28a745',
  fontSize: '12px',
  fontWeight: '500'
};

const lastUpdatedStyle = {
  color: '#666',
  fontSize: '11px'
};

// CSS Animations
const cssStyles = `
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
}

/* Hover effects */
footer button:hover {
  color: #007bff !important;
  transform: translateY(-1px);
}

footer .social-button:hover {
  background-color: #007bff !important;
  border-color: #007bff !important;
  transform: translateY(-2px);
}

footer .newsletter-button:hover {
  background-color: #0056b3 !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr !important;
    text-align: center;
  }
  
  .footer-bottom-container {
    flex-direction: column !important;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
  }
  
  .system-status {
    align-items: center !important;
  }
}

@media (max-width: 480px) {
  .footer-links {
    flex-direction: column;
    gap: 8px !important;
  }
  
  .separator {
    display: none !important;
  }
}
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = cssStyles;
  if (!document.head.querySelector('style[data-footer]')) {
    styleSheet.setAttribute('data-footer', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default Footer;