import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { useNotification } from './NotificationSystem';
import { useAdvancedSearch, AdvancedSearchBar, FilterPanel, SortableHeader, SearchResultsSummary } from './SearchFilterSystem';
import { useConfirm } from './NotificationSystem';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthContext';
import {API_BASE_URL} from '../../.env';

const EnhancedRegistrationManagement = () => {
  const [registrations, setRegistrations] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: ''
  });

  // Enhanced hooks
  const { success, error, warning, info } = useNotification();
  const { confirm, ConfirmComponent } = useConfirm();
  const { theme } = useTheme();
  const {user, hasPermission} =useAuth();

  // Advanced search configuration
  const searchableFields = ['student.firstName', 'student.lastName', 'student.studentId', 'course.code', 'course.title'];
  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ENROLLED', label: 'Enrolled' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'DROPPED', label: 'Dropped' },
        { value: 'WITHDRAWN', label: 'Withdrawn' }
      ]
    },
    {
      key: 'gradeStatus',
      label: 'Grade Status',
      type: 'select',
      options: [
        { value: 'graded', label: 'Graded' },
        { value: 'ungraded', label: 'Not Graded' },
        { value: 'pending', label: 'Pending Review' }
      ]
    },
    {
      key: 'gradeRange',
      label: 'Grade Range',
      type: 'range',
      options: []
    },
    {
      key: 'program',
      label: 'Student Program',
      type: 'select',
      options: [
        { value: 'Computer Science', label: 'Computer Science' },
        { value: 'Information Technology', label: 'Information Technology' },
        { value: 'Software Engineering', label: 'Software Engineering' },
        { value: 'Data Science', label: 'Data Science' },
        { value: 'Cybersecurity', label: 'Cybersecurity' }
      ]
    }
  ];

  const {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    sortConfig,
    handleSort,
    filteredData
  } = useAdvancedSearch(registrations, searchableFields);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regResponse, studResponse, courseResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/registrations`),
        fetch(`${API_BASE_URL}/api/students`),
        fetch(`${API_BASE_URL}/api/courses`)
      ]);

      if (!regResponse.ok || !studResponse.ok || !courseResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [regData, studData, courseData] = await Promise.all([
        regResponse.json(),
        studResponse.json(),
        courseResponse.json()
      ]);

      setRegistrations(regData);
      setStudents(studData);
      setCourses(courseData);
      success(`Loaded ${regData.length} registrations successfully`);
    } catch (err) {
      console.error('Error fetching data:', err);
      error('Failed to load registration data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.studentId || !formData.courseId) {
      warning('Please select both a student and a course');
      return;
    }

    // Check for existing enrollment
    const existingEnrollment = registrations.find(reg => 
      reg.student?.id === parseInt(formData.studentId) && 
      reg.course?.id === parseInt(formData.courseId)
    );

    if (existingEnrollment) {
      warning('Student is already enrolled in this course');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/registrations/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: parseInt(formData.studentId),
          courseId: parseInt(formData.courseId)
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowModal(false);
        resetForm();
        
        const student = students.find(s => s.id === parseInt(formData.studentId));
        const course = courses.find(c => c.id === parseInt(formData.courseId));
        success(`${student?.firstName} ${student?.lastName} enrolled in ${course?.code} successfully!`);
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Enrollment failed');
      }
    } catch (err) {
      console.error('Error enrolling student:', err);
      error(`Failed to enroll student: ${err.message}`);
    }
  };

  const handleDelete = async (registration) => {
    const studentName = getStudentName(registration.student?.id);
    const courseName = getCourseName(registration.course?.id);
    
    const confirmed = await confirm({
      title: 'Remove Registration',
      message: `Are you sure you want to remove ${studentName} from ${courseName}? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Remove Registration',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/registrations/${registration.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchData();
          success(`${studentName} removed from ${courseName} successfully`);
        } else {
          throw new Error('Failed to remove registration');
        }
      } catch (err) {
        console.error('Error deleting registration:', err);
        error(`Failed to remove registration: ${err.message}`);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({ studentId: '', courseId: '' });
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getStudentDetails = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student || null;
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.title}` : 'Unknown Course';
  };

  const getCourseDetails = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course || null;
  };

  const getLetterGrade = (grade) => {
    if (!grade) return 'N/A';
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  };

  const getGradeColor = (grade) => {
    if (!grade) return '#6c757d';
    if (grade >= 90) return '#28a745';
    if (grade >= 80) return '#17a2b8';
    if (grade >= 70) return '#ffc107';
    if (grade >= 60) return '#fd7e14';
    return '#dc3545';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ENROLLED': return { bg: '#d4edda', color: '#155724' };
      case 'COMPLETED': return { bg: '#d1ecf1', color: '#0c5460' };
      case 'DROPPED': return { bg: '#f8d7da', color: '#721c24' };
      case 'WITHDRAWN': return { bg: '#fff3cd', color: '#856404' };
      default: return { bg: '#e2e3e5', color: '#495057' };
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleBulkAction = async (action) => {
    switch (action) {
      case 'export':
        exportRegistrations();
        break;
      case 'refresh':
        await fetchData();
        break;
      case 'summary':
        showRegistrationSummary();
        break;
      default:
        info('Bulk action not implemented yet');
    }
  };

  const exportRegistrations = () => {
    try {
      const csvContent = [
        ['Student ID', 'Student Name', 'Course Code', 'Course Title', 'Status', 'Grade', 'Registration Date'],
        ...filteredData.map(reg => [
          getStudentDetails(reg.student?.id)?.studentId || '',
          getStudentName(reg.student?.id),
          getCourseDetails(reg.course?.id)?.code || '',
          getCourseDetails(reg.course?.id)?.title || '',
          reg.status,
          reg.grade || 'N/A',
          new Date(reg.registrationDate).toLocaleDateString()
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      success('Registrations exported successfully!');
    } catch (err) {
      error('Failed to export registrations');
    }
  };

  const showRegistrationSummary = () => {
    const totalRegistrations = registrations.length;
    const enrolledCount = registrations.filter(r => r.status === 'ENROLLED').length;
    const completedCount = registrations.filter(r => r.status === 'COMPLETED').length;
    const gradedCount = registrations.filter(r => r.grade !== null).length;
    
    info(`Summary: ${totalRegistrations} total registrations, ${enrolledCount} enrolled, ${completedCount} completed, ${gradedCount} graded`);
  };

  const hasFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  // Statistics calculations
  const stats = {
    total: registrations.length,
    enrolled: registrations.filter(r => r.status === 'ENROLLED').length,
    completed: registrations.filter(r => r.status === 'COMPLETED').length,
    graded: registrations.filter(r => r.grade !== null).length,
    avgGrade: registrations.filter(r => r.grade !== null).reduce((sum, r) => sum + r.grade, 0) / 
              registrations.filter(r => r.grade !== null).length || 0
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <p style={loadingTextStyle}>Loading registrations...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Header */}
      <div style={enhancedHeaderStyle}>
        <div>
          <h1 style={titleStyle}>
            {user?.role==='STUDENT' 
                  ? '📝 View Registrations' 
                  : '📝 Registration Management'
                }
          </h1>
          <p style={subtitleStyle}>
          {user?.role==='STUDENT'
            ? 'View your course enrollments and track progress'
            : 'Manage student course enrollments and track progress'
          }
           </p>   
        </div>

        
        <div style={headerActionsStyle}>
           {user?.role==='STUDENT'
            ? ''
            : 
              <>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleBulkAction('summary')}
                  style={actionButtonStyle}
                >
                  📊 Summary
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleBulkAction('export')}
                  style={actionButtonStyle}
                >
                  📄 Export CSV
                </button>
                <button 
                  className="btn btn-info" 
                  onClick={() => handleBulkAction('refresh')}
                  style={actionButtonStyle}
                >
                  🔄 Refresh
                </button>
              </>
            
          
        }
         {user?.role==='STUDENT'
            ? ''
            :  <button 
            className="btn btn-primary" 
            onClick={openCreateModal}
            style={primaryButtonStyle}
          >
            ➕ Enroll Student
          </button>
         }
        </div>      
      </div>

      {/* Enhanced Search */}
      <AdvancedSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder={
          user?.role === 'STUDENT' 
            ? "Search your course enrollments..."
            : "Search by student name, ID, course code, or title..."
        }
      />

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        filterConfig={filterConfig}
        isOpen={filterPanelOpen}
        onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
      />

      {/* Results Summary */}
      <SearchResultsSummary
        totalResults={registrations.length}
        filteredResults={filteredData.length}
        searchTerm={searchTerm}
        hasFilters={hasFilters}
      />

      {/* Enhanced Statistics Cards */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={{...statIconStyle, backgroundColor: '#e3f2fd'}}>📝</div>
          <div>
            <div style={statNumberStyle}>{stats.total}</div>
            <div style={statLabelStyle}>{user?.role === 'STUDENT' ? 'Your Registrations' : 'Total Registrations'}
            </div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{...statIconStyle, backgroundColor: '#e8f5e8'}}>✅</div>
          <div>
            <div style={statNumberStyle}>{stats.enrolled}</div>
            <div style={statLabelStyle}>Currently Enrolled</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{...statIconStyle, backgroundColor: '#fff3e0'}}>🎓</div>
          <div>
            <div style={statNumberStyle}>{stats.completed}</div>
            <div style={statLabelStyle}>Completed Courses</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{...statIconStyle, backgroundColor: '#f3e5f5'}}>📊</div>
          <div>
            <div style={statNumberStyle}>{stats.avgGrade.toFixed(1)}</div>
            <div style={statLabelStyle}>Average Grade</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div style={tableContainerStyle}>
        <table className="table" style={tableStyle}>
          <thead>
            <tr>
              <SortableHeader 
                title="Student" 
                sortKey="student.lastName" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <SortableHeader 
                title="Course" 
                sortKey="course.code" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <SortableHeader 
                title="Registration Date" 
                sortKey="registrationDate" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <SortableHeader 
                title="Status" 
                sortKey="status" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <SortableHeader 
                title="Grade" 
                sortKey="grade" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <th>Letter Grade</th>
               {user?.role==='STUDENT'
                ? ''
                : <th style={actionsHeaderStyle}>Actions</th>
               }
               
              
            </tr>
          </thead>
          <tbody>
            {filteredData.map(registration => {
              const student = getStudentDetails(registration.student?.id);
              const course = getCourseDetails(registration.course?.id);
              const statusColors = getStatusColor(registration.status);
              
              return (
                <tr key={registration.id} style={tableRowStyle}>
                  <td style={studentColumnStyle}>
                    <div style={studentInfoStyle}>
                      <div style={studentNameStyle}>
                        {getStudentName(registration.student?.id)}
                      </div>
                      <div style={studentIdStyle}>
                        ID: {student?.studentId || 'N/A'}
                      </div>
                      <div style={studentProgramStyle}>
                        {student?.program || 'Unknown Program'}
                      </div>
                    </div>
                  </td>
                  <td style={courseColumnStyle}>
                    <div style={courseInfoStyle}>
                      <div style={courseCodeStyle}>
                        <span style={courseBadgeStyle}>
                          {course?.code || 'N/A'}
                        </span>
                      </div>
                      <div style={courseTitleStyle}>
                        {course?.title || 'Unknown Course'}
                      </div>
                      <div style={courseCreditsStyle}>
                        {course?.credits ? `${course.credits} credits` : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td style={dateColumnStyle}>
                    {new Date(registration.registrationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td style={statusColumnStyle}>
                    <span style={{
                      ...statusBadgeStyle,
                      backgroundColor: statusColors.bg,
                      color: statusColors.color
                    }}>
                      {registration.status}
                    </span>
                  </td>
                  <td style={gradeColumnStyle}>
                    <div style={gradeDisplayStyle}>
                      {registration.grade ? (
                        <span style={gradeValueStyle}>{registration.grade.toFixed(1)}</span>
                      ) : (
                        <span style={noGradeStyle}>Not Graded</span>
                      )}
                    </div>
                  </td>
                  <td style={letterGradeColumnStyle}>
                    <span style={{
                      ...letterGradeBadgeStyle,
                      backgroundColor: getGradeColor(registration.grade)
                    }}>
                      {getLetterGrade(registration.grade)}
                    </span>
                  </td>
                  {user?.role==='STUDENT' 
                  ? '' 
                  : <td style={actionsColumnStyle}>
                    <div style={actionButtonsStyle}>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(registration)}
                        style={deleteButtonStyle}
                        title="Remove registration"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </td>
                  }
                  
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div style={noResultsStyle}>
            {searchTerm || hasFilters ? (
              <div style={noResultsContentStyle}>
                <div style={noResultsIconStyle}>🔍</div>
                <h3>No registrations found</h3>
               
                <p>No registrations match your search criteria.</p>
                <button 
                  onClick={clearFilters} 
                  className="btn btn-secondary"
                  style={clearFiltersButtonStyle}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div style={noResultsContentStyle}>
                <div style={noResultsIconStyle}>📝</div>
                <h3>No registrations available</h3>
                 <p>
                  {user?.role === 'STUDENT' 
                    ? 'You have no course registrations yet.'
                    : 'Start by enrolling students in courses.'
                  }
                </p>
                 {user?.role==='STUDENT'
                  ? ''
                  : <>
                    <button 
                  onClick={openCreateModal} 
                  className="btn btn-primary"
                  style={addFirstButtonStyle}
                >
                  Enroll First Student
                </button>
                  </>
                 }
                
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <Modal
          title={
            <div style={modalTitleStyle}>
              <span style={modalIconStyle}>👨‍🎓</span>
              Enroll Student in Course
            </div>
          }
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} style={formStyle}>
            <div className="form-group">
              <label style={labelStyle}>Student *</label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                style={selectStyle}
              >
                <option value="">Select a student...</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.studentId} - {student.firstName} {student.lastName} ({student.program})
                  </option>
                ))}
              </select>
              <small style={helpTextStyle}>Choose the student to enroll</small>
            </div>

            <div className="form-group">
              <label style={labelStyle}>Course *</label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                required
                style={selectStyle}
              >
                <option value="">Select a course...</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.title} ({course.credits} credits)
                  </option>
                ))}
              </select>
              <small style={helpTextStyle}>Choose the course for enrollment</small>
            </div>

            {/* Enrollment Preview */}
            {formData.studentId && formData.courseId && (
              <div style={previewStyle}>
                <h4 style={previewTitleStyle}>📋 Enrollment Preview</h4>
                <div style={previewContentStyle}>
                  <div style={previewItemStyle}>
                    <strong>Student:</strong> {getStudentName(parseInt(formData.studentId))}
                  </div>
                  <div style={previewItemStyle}>
                    <strong>Course:</strong> {getCourseName(parseInt(formData.courseId))}
                  </div>
                  <div style={previewItemStyle}>
                    <strong>Date:</strong> {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            <div style={modalActionsStyle}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                style={cancelButtonStyle}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={submitButtonStyle}
                disabled={!formData.studentId || !formData.courseId}
              >
                👨‍🎓 Enroll Student
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirmation Component */}
      <ConfirmComponent />
    </div>
  );
};

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
  alignItems: 'center',
  flexWrap: 'wrap'
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

const statsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
};

const statCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  padding: '20px',
  backgroundColor: 'var(--color-surface)',
  borderRadius: '12px',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--color-shadow)'
};

const statIconStyle = {
  fontSize: '28px',
  padding: '12px',
  borderRadius: '50%'
};

const statNumberStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'var(--color-primary)'
};

const statLabelStyle = {
  fontSize: '14px',
  color: 'var(--color-text-secondary)'
};

const tableContainerStyle = {
  backgroundColor: 'var(--color-surface)',
  borderRadius: '12px',
  overflow: 'hidden',
  border: '1px solid var(--color-border)',
  boxShadow: 'var(--color-shadow)'
};

const tableStyle = {
  margin: 0
};

const tableRowStyle = {
  transition: 'background-color 0.2s'
};

const studentColumnStyle = {
  padding: '16px'
};

const studentInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const studentNameStyle = {
  fontWeight: '600',
  color: 'var(--color-text)'
};

const studentIdStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)'
};

const studentProgramStyle = {
  fontSize: '12px',
  color: '#007bff',
  fontWeight: '500'
};

const courseColumnStyle = {
  padding: '16px'
};

const courseInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const courseCodeStyle = {
  marginBottom: '4px'
};

const courseBadgeStyle = {
  padding: '4px 8px',
  backgroundColor: '#e3f2fd',
  color: '#1976d2',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const courseTitleStyle = {
  fontWeight: '500',
  color: 'var(--color-text)'
};

const courseCreditsStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)'
};

const dateColumnStyle = {
  padding: '16px',
  fontSize: '14px'
};

const statusColumnStyle = {
  padding: '16px'
};

const statusBadgeStyle = {
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const gradeColumnStyle = {
  padding: '16px'
};

const gradeDisplayStyle = {
  textAlign: 'center'
};

const gradeValueStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: 'var(--color-text)'
};

const noGradeStyle = {
  fontSize: '14px',
  color: 'var(--color-text-secondary)',
  fontStyle: 'italic'
};

const letterGradeColumnStyle = {
  padding: '16px',
  textAlign: 'center'
};

const letterGradeBadgeStyle = {
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: 'white'
};

const actionsHeaderStyle = {
  width: '120px'
};

const actionsColumnStyle = {
  padding: '16px'
};

const actionButtonsStyle = {
  display: 'flex',
  gap: '8px'
};

const deleteButtonStyle = {
  padding: '6px 12px',
  fontSize: '12px',
  borderRadius: '6px'
};

const noResultsStyle = {
  padding: '60px 20px',
  textAlign: 'center'
};

const noResultsContentStyle = {
  maxWidth: '400px',
  margin: '0 auto'
};

const noResultsIconStyle = {
  fontSize: '48px',
  marginBottom: '20px'
};

const clearFiltersButtonStyle = {
  marginTop: '16px'
};

const addFirstButtonStyle = {
  marginTop: '16px'
};

const modalTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const modalIconStyle = {
  fontSize: '18px'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const labelStyle = {
  fontWeight: '600',
  marginBottom: '8px',
  color: 'var(--color-text)'
};

const selectStyle = {
  padding: '12px',
  border: '2px solid var(--color-border)',
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: 'var(--color-background)',
  color: 'var(--color-text)',
  transition: 'border-color 0.3s'
};

const helpTextStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)',
  marginTop: '4px'
};

const previewStyle = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '16px'
};

const previewTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '12px',
  color: 'var(--color-text)'
};

const previewContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const previewItemStyle = {
  fontSize: '14px',
  color: 'var(--color-text)'
};

const modalActionsStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '20px'
};

const cancelButtonStyle = {
  padding: '10px 20px'
};

const submitButtonStyle = {
  padding: '10px 20px'
};

export default EnhancedRegistrationManagement;