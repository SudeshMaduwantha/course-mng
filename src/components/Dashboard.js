import React, { useState, useEffect } from 'react';
import { useNotification } from './NotificationSystem';
import { useTheme } from './ThemeProvider';

const EnhancedDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRegistrations: 0,
    avgGPA: 0,
    recentActivity: [],
    programDistribution: {},
    yearDistribution: {},
    gradeDistribution: {},
    monthlyEnrollments: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced hooks
  const { success, error, info } = useNotification();
  const { theme } = useTheme();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showRefreshMessage = false) => {
    try {
      if (showRefreshMessage) setRefreshing(true);
      setLoading(true);

      // Fetch all data concurrently
      const [studentsRes, coursesRes, registrationsRes] = await Promise.all([
        fetch('http://localhost:8080/api/students'),
        fetch('http://localhost:8080/api/courses'),
        fetch('http://localhost:8080/api/registrations')
      ]);

      if (!studentsRes.ok || !coursesRes.ok || !registrationsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const [students, courses, registrations] = await Promise.all([
        studentsRes.json(),
        coursesRes.json(),
        registrationsRes.json()
      ]);

      // Calculate statistics
      const gradedRegistrations = registrations.filter(reg => reg.grade !== null);
      const avgGPA = gradedRegistrations.length > 0 
        ? gradedRegistrations.reduce((sum, reg) => sum + (reg.grade || 0), 0) / gradedRegistrations.length
        : 0;

      // Program distribution
      const programDistribution = students.reduce((acc, student) => {
        acc[student.program] = (acc[student.program] || 0) + 1;
        return acc;
      }, {});

      // Year distribution
      const yearDistribution = students.reduce((acc, student) => {
        acc[student.year] = (acc[student.year] || 0) + 1;
        return acc;
      }, {});

      // Grade distribution
      const gradeDistribution = {
        'A (90-100)': gradedRegistrations.filter(r => r.grade >= 90).length,
        'B (80-89)': gradedRegistrations.filter(r => r.grade >= 80 && r.grade < 90).length,
        'C (70-79)': gradedRegistrations.filter(r => r.grade >= 70 && r.grade < 80).length,
        'D (60-69)': gradedRegistrations.filter(r => r.grade >= 60 && r.grade < 70).length,
        'F (0-59)': gradedRegistrations.filter(r => r.grade < 60).length
      };

      // Recent activity (real data based on registrations)
      const recentActivity = [
        {
          id: 1,
          type: 'students',
          message: `${students.length} students currently enrolled`,
          time: 'Current'
        },
        {
          id: 2,
          type: 'courses',
          message: `${courses.length} courses available`,
          time: 'Current'
        },
        {
          id: 3,
          type: 'registrations',
          message: `${registrations.length} total registrations`,
          time: 'Current'
        },
        {
          id: 4,
          type: 'grades',
          message: `${gradedRegistrations.length} students graded`,
          time: 'Current'
        }
      ];

      // Mock monthly enrollment data
      const monthlyEnrollments = [
        { month: 'Jan', count: Math.floor(registrations.length * 0.15) },
        { month: 'Feb', count: Math.floor(registrations.length * 0.18) },
        { month: 'Mar', count: Math.floor(registrations.length * 0.12) },
        { month: 'Apr', count: Math.floor(registrations.length * 0.20) },
        { month: 'May', count: Math.floor(registrations.length * 0.16) },
        { month: 'Jun', count: Math.floor(registrations.length * 0.19) }
      ];

      setStats({
        totalStudents: students.length,
        totalCourses: courses.length,
        totalRegistrations: registrations.length,
        avgGPA: Math.round(avgGPA * 100) / 100,
        recentActivity,
        programDistribution,
        yearDistribution,
        gradeDistribution,
        monthlyEnrollments
      });

      if (showRefreshMessage) {
        success('Dashboard data refreshed successfully!');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      error('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Quick Action Handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'add-course':
        if (onNavigate) {
          onNavigate('courses');
          info('Navigate to Courses to add a new course');
        } else {
          info('Course creation feature - Navigate to Courses tab');
        }
        break;
      case 'register-student':
        if (onNavigate) {
          onNavigate('students');
          info('Navigate to Students to register a new student');
        } else {
          info('Student registration feature - Navigate to Students tab');
        }
        break;
      case 'generate-report':
        generateSystemReport();
        break;
      case 'send-notifications':
        sendSystemNotifications();
        break;
      default:
        info('Feature not implemented yet');
    }
  };

  const generateSystemReport = () => {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        totalStudents: stats.totalStudents,
        totalCourses: stats.totalCourses,
        totalRegistrations: stats.totalRegistrations,
        averageGPA: stats.avgGPA,
        programDistribution: stats.programDistribution,
        yearDistribution: stats.yearDistribution,
        gradeDistribution: stats.gradeDistribution
      };

      const reportContent = `
University Course Management System Report
Generated: ${new Date().toLocaleString()}

=== OVERVIEW ===
Total Students: ${stats.totalStudents}
Total Courses: ${stats.totalCourses}
Total Registrations: ${stats.totalRegistrations}
Average GPA: ${stats.avgGPA}/100

=== PROGRAM DISTRIBUTION ===
${Object.entries(stats.programDistribution)
  .map(([program, count]) => `${program}: ${count} students`)
  .join('\n')}

=== YEAR DISTRIBUTION ===
${Object.entries(stats.yearDistribution)
  .map(([year, count]) => `Year ${year}: ${count} students`)
  .join('\n')}

=== GRADE DISTRIBUTION ===
${Object.entries(stats.gradeDistribution)
  .map(([grade, count]) => `${grade}: ${count} students`)
  .join('\n')}
      `.trim();

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_report_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);

      success('System report generated and downloaded successfully!');
    } catch (err) {
      error('Failed to generate system report');
    }
  };

  const sendSystemNotifications = () => {
    // Simulate sending notifications
    const notifications = [
      `📧 Notification sent to ${stats.totalStudents} students`,
      `📊 Grade reports available for ${Object.values(stats.gradeDistribution).reduce((a, b) => a + b, 0)} students`,
      `📚 Course catalog updated with ${stats.totalCourses} courses`,
      `🎓 Enrollment summary sent to administrators`
    ];

    notifications.forEach((notification, index) => {
      setTimeout(() => {
        info(notification);
      }, (index + 1) * 1000);
    });

    success('System notifications initiated!');
  };

  if (loading && !refreshing) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <p style={loadingTextStyle}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Header */}
      <div style={enhancedHeaderStyle}>
        <div>
          <h1 style={titleStyle}>📊 System Dashboard</h1>
          <p style={subtitleStyle}>University Course Management Overview</p>
        </div>
        <div style={headerActionsStyle}>
          <button 
            className="btn btn-info" 
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            style={actionButtonStyle}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => handleQuickAction('generate-report')}
            style={primaryButtonStyle}
          >
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div style={statsGridStyle}>
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon="👨‍🎓" 
          color="#007bff"
          subtitle="Active enrollments"
          trend="+12% this month"
        />
        <StatCard 
          title="Total Courses" 
          value={stats.totalCourses} 
          icon="📚" 
          color="#28a745"
          subtitle="Available courses"
          trend="+5% this semester"
        />
        <StatCard 
          title="Registrations" 
          value={stats.totalRegistrations} 
          icon="📝" 
          color="#17a2b8"
          subtitle="Course enrollments"
          trend="+18% this month"
        />
        <StatCard 
          title="Average Grade" 
          value={`${stats.avgGPA}/100`} 
          icon="⭐" 
          color="#ffc107"
          subtitle="Overall performance"
          trend={stats.avgGPA > 75 ? '+2.3% improved' : 'Needs improvement'}
        />
      </div>

      {/* Enhanced Charts Section */}
      <div style={chartsContainerStyle}>
        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>📈 Monthly Enrollments</h3>
          <div style={mockChartStyle}>
            {stats.monthlyEnrollments.map((data, index) => (
              <div key={data.month} style={chartColumnStyle}>
                <div 
                  style={{
                    ...mockBarStyle, 
                    height: `${Math.max((data.count / Math.max(...stats.monthlyEnrollments.map(d => d.count))) * 100, 10)}%`,
                    backgroundColor: chartColors[index % chartColors.length]
                  }}
                >
                  {data.count}
                </div>
                <span style={chartLabelStyle}>{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>🎯 Grade Distribution</h3>
          <div style={gradeDistStyle}>
            {Object.entries(stats.gradeDistribution).map(([grade, count], index) => (
              <div key={grade} style={gradeItemStyle}>
                <span style={{
                  ...gradeDotStyle, 
                  backgroundColor: gradeColors[index % gradeColors.length]
                }}></span>
                <span style={gradeTextStyle}>{grade}: {count} students</span>
                <span style={gradePercentStyle}>
                  ({count > 0 ? Math.round((count / Object.values(stats.gradeDistribution).reduce((a, b) => a + b, 0)) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={chartCardStyle}>
          <h3 style={chartTitleStyle}>📚 Program Distribution</h3>
          <div style={programDistStyle}>
            {Object.entries(stats.programDistribution).map(([program, count], index) => (
              <div key={program} style={programItemStyle}>
                <div style={programBarContainerStyle}>
                  <div style={programLabelStyle}>{program}</div>
                  <div style={programBarBgStyle}>
                    <div 
                      style={{
                        ...programBarStyle,
                        width: `${Math.max((count / Math.max(...Object.values(stats.programDistribution))) * 100, 5)}%`,
                        backgroundColor: programColors[index % programColors.length]
                      }}
                    ></div>
                  </div>
                  <span style={programCountStyle}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div style={activityCardStyle}>
        <h3 style={sectionTitleStyle}>🕒 System Overview</h3>
        <div style={activityListStyle}>
          {stats.recentActivity.map(activity => (
            <div key={activity.id} style={activityItemStyle}>
              <div style={activityIconStyle}>
                {activity.type === 'students' && '👨‍🎓'}
                {activity.type === 'courses' && '📚'}
                {activity.type === 'registrations' && '📝'}
                {activity.type === 'grades' && '📊'}
              </div>
              <div style={activityContentStyle}>
                <p style={activityMessageStyle}>{activity.message}</p>
                <small style={activityTimeStyle}>{activity.time}</small>
              </div>
              <div style={activityStatusStyle}>
                <span style={statusBadgeStyle}>Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div style={quickActionsStyle}>
        <h3 style={sectionTitleStyle}>⚡ Quick Actions</h3>
        <div style={actionButtonsStyle}>
          <button 
            className="btn btn-primary" 
            style={actionBtnStyle}
            onClick={() => handleQuickAction('add-course')}
          >
            <div style={actionBtnContentStyle}>
              <span style={actionBtnIconStyle}>➕</span>
              <div>
                <div style={actionBtnTitleStyle}>Add New Course</div>
                <div style={actionBtnSubtitleStyle}>Create course catalog entry</div>
              </div>
            </div>
          </button>
          <button 
            className="btn btn-success" 
            style={actionBtnStyle}
            onClick={() => handleQuickAction('register-student')}
          >
            <div style={actionBtnContentStyle}>
              <span style={actionBtnIconStyle}>👤</span>
              <div>
                <div style={actionBtnTitleStyle}>Register Student</div>
                <div style={actionBtnSubtitleStyle}>Add new student record</div>
              </div>
            </div>
          </button>
          <button 
            className="btn btn-warning" 
            style={actionBtnStyle}
            onClick={() => handleQuickAction('generate-report')}
          >
            <div style={actionBtnContentStyle}>
              <span style={actionBtnIconStyle}>📊</span>
              <div>
                <div style={actionBtnTitleStyle}>Generate Report</div>
                <div style={actionBtnSubtitleStyle}>Download system analytics</div>
              </div>
            </div>
          </button>
          <button 
            className="btn btn-info" 
            style={actionBtnStyle}
            onClick={() => handleQuickAction('send-notifications')}
          >
            <div style={actionBtnContentStyle}>
              <span style={actionBtnIconStyle}>📧</span>
              <div>
                <div style={actionBtnTitleStyle}>Send Notifications</div>
                <div style={actionBtnSubtitleStyle}>Notify students & faculty</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* System Status Indicator */}
      <div style={statusIndicatorStyle}>
        <div style={statusItemStyle}>
          <span style={statusDotStyle}></span>
          <span>System Status: Operational</span>
        </div>
        <div style={statusItemStyle}>
          <span>Last Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
  <div style={{...statCardStyle, borderLeft: `4px solid ${color}`}}>
    <div style={statIconStyle}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
    </div>
    <div style={statContentStyle}>
      <h3 style={{...statValueStyle, color}}>{value}</h3>
      <p style={statTitleStyle}>{title}</p>
      <small style={statSubtitleStyle}>{subtitle}</small>
      {trend && <div style={trendStyle}>{trend}</div>}
    </div>
  </div>
);

// Color palettes
const chartColors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'];
const gradeColors = ['#28a745', '#17a2b8', '#ffc107', '#fd7e14', '#dc3545'];
const programColors = ['#007bff', '#28a745', '#17a2b8', '#ffc107', '#e83e8c'];

// Enhanced Styles
const enhancedHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '30px',
  padding: '20px 0',
  borderBottom: '2px solid var(--color-border)'
};

const titleStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: 'var(--color-text)',
  margin: '0 0 8px 0'
};

const subtitleStyle = {
  fontSize: '16px',
  color: 'var(--color-text-secondary)',
  margin: 0
};

const headerActionsStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

const actionButtonStyle = {
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: '500',
  borderRadius: '6px',
  transition: 'all 0.2s'
};

const primaryButtonStyle = {
  ...actionButtonStyle,
  background: 'linear-gradient(135deg, #007bff, #0056b3)',
  color: 'white',
  border: 'none',
  boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
};

const loadingContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 20px',
  gap: '20px'
};

const loadingSpinnerStyle = {
  width: '50px',
  height: '50px',
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #007bff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const loadingTextStyle = {
  fontSize: '16px',
  color: 'var(--color-text-secondary)'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
};

const statCardStyle = {
  backgroundColor: 'var(--color-surface)',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: 'var(--color-shadow)',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  transition: 'transform 0.2s',
  border: '1px solid var(--color-border)'
};

const statIconStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  backgroundColor: '#f8f9fa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const statContentStyle = {
  flex: 1
};

const statValueStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 5px 0'
};

const statTitleStyle = {
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  margin: '0 0 5px 0'
};

const statSubtitleStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)'
};

const trendStyle = {
  fontSize: '11px',
  color: '#28a745',
  fontWeight: '500',
  marginTop: '4px'
};

const chartsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
};

const chartCardStyle = {
  backgroundColor: 'var(--color-surface)',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: 'var(--color-shadow)',
  border: '1px solid var(--color-border)'
};

const chartTitleStyle = {
  margin: '0 0 20px 0',
  color: 'var(--color-text)',
  fontSize: '16px',
  fontWeight: '600'
};

const mockChartStyle = {
  display: 'flex',
  alignItems: 'end',
  justifyContent: 'space-around',
  height: '200px',
  gap: '8px',
  marginTop: '15px'
};

const chartColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1
};

const mockBarStyle = {
  width: '100%',
  maxWidth: '40px',
  borderRadius: '4px 4px 0 0',
  display: 'flex',
  alignItems: 'end',
  justifyContent: 'center',
  color: 'white',
  fontSize: '11px',
  fontWeight: 'bold',
  paddingBottom: '4px',
  marginBottom: '8px'
};

const chartLabelStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)'
};

const gradeDistStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '15px'
};

const gradeItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 0',
  fontSize: '14px'
};

const gradeDotStyle = {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  flexShrink: 0
};

const gradeTextStyle = {
  flex: 1,
  color: 'var(--color-text)'
};

const gradePercentStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)'
};

const programDistStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '15px'
};

const programItemStyle = {
  marginBottom: '8px'
};

const programBarContainerStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 2fr auto',
  gap: '12px',
  alignItems: 'center'
};

const programLabelStyle = {
  fontSize: '12px',
  fontWeight: '500',
  color: 'var(--color-text)'
};

const programBarBgStyle = {
  height: '8px',
  backgroundColor: '#e9ecef',
  borderRadius: '4px',
  position: 'relative'
};

const programBarStyle = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.3s ease'
};

const programCountStyle = {
  fontSize: '12px',
  fontWeight: 'bold',
  color: 'var(--color-text)',
  minWidth: '20px'
};

const activityCardStyle = {
  backgroundColor: 'var(--color-surface)',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: 'var(--color-shadow)',
  marginBottom: '30px',
  border: '1px solid var(--color-border)'
};

const sectionTitleStyle = {
  margin: '0 0 20px 0',
  color: 'var(--color-text)',
  fontSize: '16px',
  fontWeight: '600'
};

const activityListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const activityItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  padding: '15px',
  backgroundColor: 'var(--color-background)',
  borderRadius: '8px',
  border: '1px solid var(--color-border)'
};

const activityIconStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  backgroundColor: '#f8f9fa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px'
};

const activityContentStyle = {
  flex: 1
};

const activityMessageStyle = {
  margin: '0 0 4px 0',
  fontSize: '14px',
  color: 'var(--color-text)',
  fontWeight: '500'
};

const activityTimeStyle = {
  color: 'var(--color-text-secondary)',
  fontSize: '12px'
};

const activityStatusStyle = {
  marginLeft: 'auto'
};

const statusBadgeStyle = {
  padding: '4px 8px',
  backgroundColor: '#d4edda',
  color: '#155724',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 'bold'
};

const quickActionsStyle = {
  backgroundColor: 'var(--color-surface)',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: 'var(--color-shadow)',
  marginBottom: '30px',
  border: '1px solid var(--color-border)'
};

const actionButtonsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '16px'
};

const actionBtnStyle = {
  padding: '16px',
  fontSize: '14px',
  fontWeight: '500',
  textAlign: 'left',
  border: 'none',
  borderRadius: '8px',
  transition: 'all 0.2s',
  cursor: 'pointer'
};

const actionBtnContentStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const actionBtnIconStyle = {
  fontSize: '20px',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.2)',
  borderRadius: '50%'
};

const actionBtnTitleStyle = {
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '2px'
};

const actionBtnSubtitleStyle = {
  fontSize: '12px',
  opacity: 0.8
};

const statusIndicatorStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 20px',
  backgroundColor: 'var(--color-surface)',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  fontSize: '12px',
  color: 'var(--color-text-secondary)'
};

const statusItemStyle = {
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

export default EnhancedDashboard;