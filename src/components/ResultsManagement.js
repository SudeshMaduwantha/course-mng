import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { useNotification } from './NotificationSystem';
import { useAdvancedSearch, AdvancedSearchBar, FilterPanel, SortableHeader, SearchResultsSummary } from './SearchFilterSystem';
import { useConfirm } from './NotificationSystem';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthContext';

const EnhancedResultsManagement = () => {
  const [registrations, setRegistrations] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [courseReport, setCourseReport] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [gradeData, setGradeData] = useState({ grade: '' });

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
      label: 'Registration Status',
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
      key: 'letterGrade',
      label: 'Letter Grade',
      type: 'select',
      options: [
        { value: 'A', label: 'A (90-100)' },
        { value: 'B', label: 'B (80-89)' },
        { value: 'C', label: 'C (70-79)' },
        { value: 'D', label: 'D (60-69)' },
        { value: 'F', label: 'F (0-59)' }
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
        fetch('http://localhost:8080/api/registrations'),
        fetch('http://localhost:8080/api/students'),
        fetch('http://localhost:8080/api/courses')
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
      error('Failed to load results data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const validateGrade = (grade) => {
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade)) return 'Grade must be a valid number';
    if (numGrade < 0) return 'Grade cannot be negative';
    if (numGrade > 100) return 'Grade cannot exceed 100';
    return null;
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const gradeError = validateGrade(gradeData.grade);
    if (gradeError) {
      warning(gradeError);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/registrations/${selectedRegistration.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grade: parseFloat(gradeData.grade) }),
      });

      if (response.ok) {
        await fetchData();
        setShowGradeModal(false);
        setSelectedRegistration(null);
        setGradeData({ grade: '' });
        
        const studentName = getStudentName(selectedRegistration.student?.id);
        const courseName = getCourseName(selectedRegistration.course?.id);
        success(`Grade ${gradeData.grade} assigned to ${studentName} for ${courseName}`);
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update grade');
      }
    } catch (err) {
      console.error('Error updating grade:', err);
      error(`Failed to update grade: ${err.message}`);
    }
  };

  const handleViewTranscript = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/registrations/transcript/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }
      const data = await response.json();
      setTranscript(data);
      setShowTranscriptModal(true);
      
      const studentName = getStudentName(studentId);
      info(`Viewing transcript for ${studentName}`);
    } catch (err) {
      console.error('Error fetching transcript:', err);
      error('Failed to load student transcript');
    }
  };

  const handleViewCourseReport = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/registrations/course-report/${courseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course report');
      }
      const data = await response.json();
      setCourseReport(data);
      setShowReportModal(true);
      
      const courseName = getCourseName(courseId);
      info(`Viewing grade report for ${courseName}`);
    } catch (err) {
      console.error('Error fetching course report:', err);
      error('Failed to load course grade report');
    }
  };

  const openGradeModal = (registration) => {
    setSelectedRegistration(registration);
    setGradeData({ grade: registration.grade || '' });
    setShowGradeModal(true);
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

  const handleBulkAction = async (action) => {
     switch (action) {
      case 'export':
        exportResults();
        break;
      case 'refresh':
        await fetchData();
        break;
      case 'summary':
        showGradeSummary();
        break;
      case 'bulk-grade':
        handleBulkGrading();
        break;
      default:
        info('Bulk action not implemented yet');
    }
  };

  const exportResults = () => {
    try {
      const csvContent = [
        ['Student ID', 'Student Name', 'Course Code', 'Course Title', 'Status', 'Grade', 'Letter Grade', 'Registration Date'],
        ...filteredData.map(reg => [
          getStudentDetails(reg.student?.id)?.studentId || '',
          getStudentName(reg.student?.id),
          getCourseDetails(reg.course?.id)?.code || '',
          getCourseDetails(reg.course?.id)?.title || '',
          reg.status,
          reg.grade || 'N/A',
          getLetterGrade(reg.grade),
          new Date(reg.registrationDate).toLocaleDateString()
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grade_results_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      success('Grade results exported successfully!');
    } catch (err) {
      error('Failed to export grade results');
    }
  };

  const showGradeSummary = () => {
    const totalRegistrations = registrations.length;
    const gradedCount = registrations.filter(r => r.grade !== null).length;
    const ungradedCount = totalRegistrations - gradedCount;
    const avgGrade = gradedCount > 0 ? 
      registrations.filter(r => r.grade !== null).reduce((sum, r) => sum + r.grade, 0) / gradedCount : 0;
    
    const gradeDistribution = {
      A: registrations.filter(r => r.grade >= 90).length,
      B: registrations.filter(r => r.grade >= 80 && r.grade < 90).length,
      C: registrations.filter(r => r.grade >= 70 && r.grade < 80).length,
      D: registrations.filter(r => r.grade >= 60 && r.grade < 70).length,
      F: registrations.filter(r => r.grade < 60).length
    };

    const summary = `
📊 Grade Summary:
• Total: ${totalRegistrations} registrations
• Graded: ${gradedCount} (${Math.round((gradedCount/totalRegistrations)*100)}%)
• Ungraded: ${ungradedCount} (${Math.round((ungradedCount/totalRegistrations)*100)}%)
• Average: ${avgGrade.toFixed(1)}/100
• Distribution: A:${gradeDistribution.A} B:${gradeDistribution.B} C:${gradeDistribution.C} D:${gradeDistribution.D} F:${gradeDistribution.F}
    `.trim();
    
    info(summary);
  };

  const handleBulkGrading = () => {
    const ungradedCount = registrations.filter(r => r.grade === null).length;
    info(`Bulk grading feature - ${ungradedCount} students need grades. Feature coming soon!`);
  };

  const hasFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  // Statistics calculations
  const stats = {
    total: registrations.length,
    graded: registrations.filter(r => r.grade !== null).length,
    ungraded: registrations.filter(r => r.grade === null).length,
    avgGrade: registrations.filter(r => r.grade !== null).length > 0 
      ? registrations.filter(r => r.grade !== null).reduce((sum, r) => sum + r.grade, 0) / 
        registrations.filter(r => r.grade !== null).length 
      : 0
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <p style={loadingTextStyle}>Loading results...</p>
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
                  ? '📊 View Results' 
                  : '📊 Results Management'
                }
          </h1>
          <p style={subtitleStyle}>
          {user?.role==='STUDENT'
            ? 'View grades, transcripts, and academic performance'
            : 'Manage grades, transcripts, and academic performance'
          }</p>
        </div>

        <div style={headerActionsStyle}>
          {user?.role==='STUDENT' 
                  ? '' 
                  : <>
                  <button 
            className="btn btn-secondary" 
            onClick={() => handleBulkAction('summary')}
            style={actionButtonStyle}
          >
            📈 Summary
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => handleBulkAction('export')}
            style={actionButtonStyle}
          >
            📄 Export Results
          </button>
          <button 
            className="btn btn-warning" 
            onClick={() => handleBulkAction('bulk-grade')}
            style={actionButtonStyle}
          >
            📝 Bulk Grade
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
         
        </div>
      </div>

      {/* Enhanced Search */}
      <AdvancedSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by student name, ID, course code, or title..."
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
          <div style={{...statIconStyle, backgroundColor: '#e3f2fd'}}>📊</div>
          <div>
            <div style={statNumberStyle}>{stats.total}</div>
            <div style={statLabelStyle}>Total Results</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{...statIconStyle, backgroundColor: '#e8f5e8'}}>✅</div>
          <div>
            <div style={statNumberStyle}>{stats.graded}</div>
            <div style={statLabelStyle}>Graded</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{...statIconStyle, backgroundColor: '#fff3e0'}}>⏳</div>
          <div>
            <div style={statNumberStyle}>{stats.ungraded}</div>
            <div style={statLabelStyle}>Pending Grades</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{...statIconStyle, backgroundColor: '#f3e5f5'}}>📈</div>
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
                      <button
                        className="btn btn-secondary"
                        style={transcriptButtonStyle}
                        onClick={() => handleViewTranscript(registration.student?.id)}
                      >
                        📄 Transcript
                      </button>
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
                       {user?.role==='STUDENT' 
                        ? '' 
                        : <button
                        className="btn btn-secondary"
                        style={reportButtonStyle}
                        onClick={() => handleViewCourseReport(registration.course?.id)}
                      >
                        📈 Report
                      </button>
                        }
                            
                    </div>
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
                    <button
                      className="btn btn-primary"
                      onClick={() => openGradeModal(registration)}
                      style={gradeButtonStyle}
                    >
                      {registration.grade ? '✏️ Update' : '➕ Add'} Grade
                    </button>
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
                <h3>No results found</h3>
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
                <div style={noResultsIconStyle}>📊</div>
                <h3>No results available</h3>
                <p>No student registrations found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Grade Modal */}
      {showGradeModal && selectedRegistration && (
        <Modal
          title={
            <div style={modalTitleStyle}>
              <span style={modalIconStyle}>
                {selectedRegistration.grade ? '✏️' : '➕'}
              </span>
              {selectedRegistration.grade ? 'Update Grade' : 'Add Grade'}
            </div>
          }
          onClose={() => setShowGradeModal(false)}
        >
          <div style={gradeModalContentStyle}>
            <div style={studentCourseInfoStyle}>
              <div style={infoRowStyle}>
                <strong>Student:</strong> {getStudentName(selectedRegistration.student?.id)}
              </div>
              <div style={infoRowStyle}>
                <strong>Student ID:</strong> {getStudentDetails(selectedRegistration.student?.id)?.studentId}
              </div>
              <div style={infoRowStyle}>
                <strong>Course:</strong> {getCourseName(selectedRegistration.course?.id)}
              </div>
              <div style={infoRowStyle}>
                <strong>Current Grade:</strong> {selectedRegistration.grade ? selectedRegistration.grade.toFixed(1) : 'Not assigned'}
              </div>
            </div>
            
            <form onSubmit={handleGradeSubmit} style={formStyle}>
              <div className="form-group">
                <label style={labelStyle}>Grade (0-100) *</label>
                <input
                  type="number"
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ grade: e.target.value })}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Enter grade (0-100)"
                  style={inputStyle}
                />
                <small style={helpTextStyle}>
                  Grade will be converted to: {gradeData.grade ? getLetterGrade(parseFloat(gradeData.grade)) : 'N/A'}
                </small>
              </div>

              <div style={gradeScaleStyle}>
                <h4 style={gradeScaleTitleStyle}>📋 Grading Scale</h4>
                <div style={gradeScaleListStyle}>
                  <div style={gradeScaleItemStyle}>A: 90-100 (Excellent)</div>
                  <div style={gradeScaleItemStyle}>B: 80-89 (Good)</div>
                  <div style={gradeScaleItemStyle}>C: 70-79 (Satisfactory)</div>
                  <div style={gradeScaleItemStyle}>D: 60-69 (Needs Improvement)</div>
                  <div style={gradeScaleItemStyle}>F: 0-59 (Unsatisfactory)</div>
                </div>
              </div>

              <div style={modalActionsStyle}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowGradeModal(false)}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={submitButtonStyle}
                >
                  {selectedRegistration.grade ? '💾 Update Grade' : '➕ Add Grade'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Enhanced Transcript Modal */}
      {showTranscriptModal && transcript && (
        <Modal
          title={
            <div style={modalTitleStyle}>
              <span style={modalIconStyle}>📄</span>
              Academic Transcript
            </div>
          }
          onClose={() => setShowTranscriptModal(false)}
        >
          <div style={transcriptContainerStyle}>
            <div style={transcriptHeaderStyle}>
              <h3 style={transcriptNameStyle}>
                {transcript.student.firstName} {transcript.student.lastName}
              </h3>
              <div style={transcriptDetailsStyle}>
                <div style={transcriptDetailStyle}>
                  <strong>Student ID:</strong> {transcript.student.studentId}
                </div>
                <div style={transcriptDetailStyle}>
                  <strong>Program:</strong> {transcript.student.program}
                </div>
                <div style={transcriptDetailStyle}>
                  <strong>Year:</strong> {transcript.student.year}
                </div>
              </div>
            </div>
            
            <div style={transcriptStatsStyle}>
              <div style={statItemStyle}>
                <div style={statValueLargeStyle}>{transcript.gpa}</div>
                <div style={statLabelSmallStyle}>GPA</div>
              </div>
              <div style={statItemStyle}>
                <div style={statValueLargeStyle}>{transcript.totalCourses}</div>
                <div style={statLabelSmallStyle}>Total Courses</div>
              </div>
              <div style={statItemStyle}>
                <div style={statValueLargeStyle}>{transcript.completedCourses}</div>
                <div style={statLabelSmallStyle}>Completed</div>
              </div>
            </div>

            <div style={transcriptTableContainerStyle}>
              <table className="table" style={transcriptTableStyle}>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Grade</th>
                    <th>Letter</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transcript.registrations.map(reg => (
                    <tr key={reg.id}>
                      <td>
                        <div style={transcriptCourseStyle}>
                          <div style={transcriptCourseCodeStyle}>{reg.course.code}</div>
                          <div style={transcriptCourseTitleStyle}>{reg.course.title}</div>
                        </div>
                      </td>
                      <td>{reg.grade ? reg.grade.toFixed(1) : 'N/A'}</td>
                      <td>
                        <span style={{
                          ...transcriptLetterGradeStyle,
                          backgroundColor: getGradeColor(reg.grade)
                        }}>
                          {getLetterGrade(reg.grade)}
                        </span>
                      </td>
                      <td>{reg.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Enhanced Course Report Modal */}
      {showReportModal && courseReport && (
        <Modal
          title={
            <div style={modalTitleStyle}>
              <span style={modalIconStyle}>📈</span>
              Course Grade Report
            </div>
          }
          onClose={() => setShowReportModal(false)}
        >
          <div style={reportContainerStyle}>
            <div style={reportHeaderStyle}>
              <h3 style={reportTitleStyle}>
                {courseReport.course.code} - {courseReport.course.title}
              </h3>
              <div style={reportDetailsStyle}>
                <strong>Credits:</strong> {courseReport.course.credits}
              </div>
            </div>
            
            <div style={reportStatsStyle}>
              <div style={statItemStyle}>
                <div style={statValueLargeStyle}>{courseReport.totalStudents}</div>
                <div style={statLabelSmallStyle}>Total Students</div>
              </div>
              <div style={statItemStyle}>
                <div style={statValueLargeStyle}>{courseReport.gradedStudents}</div>
                <div style={statLabelSmallStyle}>Graded</div>
              </div>
              <div style={statItemStyle}>
                <div style={statValueLargeStyle}>{courseReport.averageGrade}</div>
                <div style={statLabelSmallStyle}>Average Grade</div>
              </div>
            </div>

            <div style={reportTableContainerStyle}>
              <table className="table" style={reportTableStyle}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Grade</th>
                    <th>Letter</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {courseReport.registrations.map(reg => (
                    <tr key={reg.id}>
                      <td>
                        <div style={reportStudentStyle}>
                          <div style={reportStudentNameStyle}>
                            {reg.student.firstName} {reg.student.lastName}
                          </div>
                          <div style={reportStudentIdStyle}>
                            ID: {reg.student.studentId}
                          </div>
                        </div>
                      </td>
                      <td>{reg.grade ? reg.grade.toFixed(1) : 'N/A'}</td>
                      <td>
                        <span style={{
                          ...reportLetterGradeStyle,
                          backgroundColor: getGradeColor(reg.grade)
                        }}>
                          {getLetterGrade(reg.grade)}
                        </span>
                      </td>
                      <td>{reg.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
  gap: '6px'
};

const studentNameStyle = {
  fontWeight: '600',
  color: 'var(--color-text)',
  fontSize: '14px'
};

const studentIdStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)'
};

const transcriptButtonStyle = {
  fontSize: '11px',
  padding: '4px 8px',
  marginTop: '4px'
};

const courseColumnStyle = {
  padding: '16px'
};

const courseInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
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
  fontSize: '13px',
  color: 'var(--color-text)',
  fontWeight: '500'
};

const reportButtonStyle = {
  fontSize: '11px',
  padding: '4px 8px',
  marginTop: '4px'
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
  padding: '16px',
  textAlign: 'center'
};

const gradeDisplayStyle = {
  fontSize: '16px'
};

const gradeValueStyle = {
  fontWeight: 'bold',
  color: 'var(--color-text)'
};

const noGradeStyle = {
  color: 'var(--color-text-secondary)',
  fontStyle: 'italic',
  fontSize: '14px'
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
  width: '140px'
};

const actionsColumnStyle = {
  padding: '16px'
};

const gradeButtonStyle = {
  padding: '8px 12px',
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

// Modal Styles
const modalTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const modalIconStyle = {
  fontSize: '18px'
};

const gradeModalContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const studentCourseInfoStyle = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  padding: '16px'
};

const infoRowStyle = {
  marginBottom: '8px',
  fontSize: '14px',
  color: 'var(--color-text)'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const labelStyle = {
  fontWeight: '600',
  marginBottom: '8px',
  color: 'var(--color-text)',
  display: 'block'
};

const inputStyle = {
  width: '100%',
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

const gradeScaleStyle = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  padding: '16px'
};

const gradeScaleTitleStyle = {
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '12px',
  color: 'var(--color-text)'
};

const gradeScaleListStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '8px'
};

const gradeScaleItemStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)',
  padding: '4px'
};

const modalActionsStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end'
};

const cancelButtonStyle = {
  padding: '10px 20px'
};

const submitButtonStyle = {
  padding: '10px 20px'
};

// Transcript Modal Styles
const transcriptContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const transcriptHeaderStyle = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  padding: '20px'
};

const transcriptNameStyle = {
  margin: '0 0 12px 0',
  color: 'var(--color-text)',
  fontSize: '20px'
};

const transcriptDetailsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '8px'
};

const transcriptDetailStyle = {
  fontSize: '14px',
  color: 'var(--color-text)'
};

const transcriptStatsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px'
};

const statItemStyle = {
  textAlign: 'center',
  padding: '16px',
  backgroundColor: '#e9ecef',
  borderRadius: '8px'
};

const statValueLargeStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: 'var(--color-primary)',
  marginBottom: '4px'
};

const statLabelSmallStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)',
  fontWeight: '600'
};

const transcriptTableContainerStyle = {
  maxHeight: '400px',
  overflowY: 'auto'
};

const transcriptTableStyle = {
  margin: 0,
  fontSize: '14px'
};

const transcriptCourseStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const transcriptCourseCodeStyle = {
  fontWeight: '600',
  fontSize: '13px'
};

const transcriptCourseTitleStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)'
};

const transcriptLetterGradeStyle = {
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 'bold',
  color: 'white'
};

// Report Modal Styles
const reportContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const reportHeaderStyle = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  padding: '20px'
};

const reportTitleStyle = {
  margin: '0 0 12px 0',
  color: 'var(--color-text)',
  fontSize: '18px'
};

const reportDetailsStyle = {
  fontSize: '14px',
  color: 'var(--color-text)'
};

const reportStatsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px'
};

const reportTableContainerStyle = {
  maxHeight: '400px',
  overflowY: 'auto'
};

const reportTableStyle = {
  margin: 0,
  fontSize: '14px'
};

const reportStudentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const reportStudentNameStyle = {
  fontWeight: '600',
  fontSize: '13px'
};

const reportStudentIdStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)'
};

const reportLetterGradeStyle = {
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 'bold',
  color: 'white'
};

export default EnhancedResultsManagement;