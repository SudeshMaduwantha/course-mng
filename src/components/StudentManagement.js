import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { useNotification } from './NotificationSystem';
import { useAdvancedSearch, AdvancedSearchBar, FilterPanel, SortableHeader, SearchResultsSummary } from './SearchFilterSystem';
import { useConfirm } from './NotificationSystem';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthContext';

const EnhancedStudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    program: '',
    year: ''
  });

  // Enhanced hooks
  const { success, error, warning, info } = useNotification();
  const { confirm, ConfirmComponent } = useConfirm();
  const { theme } = useTheme();
  const {user, hasPermission} =useAuth();

  // Advanced search configuration
  const searchableFields = ['firstName', 'lastName', 'studentId', 'email', 'program'];
  const filterConfig = [
    {
      key: 'program',
      label: 'Program',
      type: 'select',
      options: [
        { value: 'Computer Science', label: 'Computer Science' },
        { value: 'Information Technology', label: 'Information Technology' },
        { value: 'Software Engineering', label: 'Software Engineering' },
        { value: 'Data Science', label: 'Data Science' },
        { value: 'Cybersecurity', label: 'Cybersecurity' }
      ]
    },
    {
      key: 'year',
      label: 'Academic Year',
      type: 'select',
      options: [
        { value: 1, label: '1st Year' },
        { value: 2, label: '2nd Year' },
        { value: 3, label: '3rd Year' },
        { value: 4, label: '4th Year' }
      ]
    },
    {
      key: 'ageRange',
      label: 'Age Range',
      type: 'range',
      options: []
    },
    {
      key: 'email',
      label: 'Email Domain',
      type: 'select',
      options: [
        { value: '@university.edu', label: 'University Email' },
        { value: '@gmail.com', label: 'Gmail' },
        { value: '@yahoo.com', label: 'Yahoo' },
        { value: '@outlook.com', label: 'Outlook' }
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
  } = useAdvancedSearch(students, searchableFields);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/students');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStudents(data);
      success(`Loaded ${data.length} students successfully`);
    } catch (err) {
      console.error('Error fetching students:', err);
      error('Failed to load students. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.studentId.trim()) errors.push('Student ID is required');
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.phoneNumber.trim()) errors.push('Phone number is required');
    if (!formData.program) errors.push('Program is required');
    if (!formData.year) errors.push('Academic year is required');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    // Phone validation
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      errors.push('Please enter a valid phone number');
    }

    // Check for duplicate student ID (only for new students)
    if (!editingStudent && students.find(s => s.studentId === formData.studentId.trim())) {
      errors.push('Student ID already exists');
    }

    // Check for duplicate email
    const existingEmailStudent = students.find(s => s.email === formData.email.trim());
    if (existingEmailStudent && (!editingStudent || existingEmailStudent.id !== editingStudent.id)) {
      errors.push('Email address already exists');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      warning(`Please fix the following errors: ${validationErrors.join(', ')}`);
      return;
    }

    try {
      const url = editingStudent 
        ? `http://localhost:8080/api/students/${editingStudent.id}`
        : 'http://localhost:8080/api/students';
      
      const method = editingStudent ? 'PUT' : 'POST';
      
      const studentData = {
        ...formData,
        year: parseInt(formData.year),
        studentId: formData.studentId.trim().toUpperCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim()
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (response.ok) {
        await fetchStudents();
        setShowModal(false);
        setEditingStudent(null);
        resetForm();
        success(
          editingStudent 
            ? `Student "${studentData.firstName} ${studentData.lastName}" updated successfully!` 
            : `Student "${studentData.firstName} ${studentData.lastName}" created successfully!`
        );
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to save student');
      }
    } catch (err) {
      console.error('Error saving student:', err);
      error(`Failed to ${editingStudent ? 'update' : 'create'} student: ${err.message}`);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId || '',
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phoneNumber: student.phoneNumber || '',
      dateOfBirth: student.dateOfBirth || '',
      program: student.program || '',
      year: student.year || ''
    });
    setShowModal(true);
    info(`Editing student: ${student.firstName} ${student.lastName}`);
  };

  const handleDelete = async (student) => {
    const confirmed = await confirm({
      title: 'Delete Student',
      message: `Are you sure you want to delete "${student.firstName} ${student.lastName}" (${student.studentId})? This action cannot be undone and will remove all associated registrations.`,
      type: 'danger',
      confirmText: 'Delete Student',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        const response = await fetch(`http://localhost:8080/api/students/${student.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchStudents();
          success(`Student "${student.firstName} ${student.lastName}" deleted successfully`);
        } else {
          throw new Error('Failed to delete student');
        }
      } catch (err) {
        console.error('Error deleting student:', err);
        error(`Failed to delete student: ${err.message}`);
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
    setFormData({
      studentId: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      program: '',
      year: ''
    });
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    resetForm();
    setShowModal(true);
  };

  const handleBulkAction = async (action) => {
    switch (action) {
      case 'export':
        exportStudents();
        break;
      case 'refresh':
        await fetchStudents();
        break;
      case 'summary':
        showStudentSummary();
        break;
      case 'generate-ids':
        generateStudentIds();
        break;
      default:
        info('Bulk action not implemented yet');
    }
  };

  const exportStudents = () => {
    try {
      const csvContent = [
        ['Student ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Program', 'Year', 'Date of Birth'],
        ...filteredData.map(student => [
          student.studentId,
          student.firstName,
          student.lastName,
          student.email,
          student.phoneNumber,
          student.program,
          student.year,
          student.dateOfBirth || ''
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      success('Students exported successfully!');
    } catch (err) {
      error('Failed to export students');
    }
  };

  const showStudentSummary = () => {
    const totalStudents = students.length;
    const programCounts = students.reduce((acc, student) => {
      acc[student.program] = (acc[student.program] || 0) + 1;
      return acc;
    }, {});
    
    const yearCounts = students.reduce((acc, student) => {
      acc[student.year] = (acc[student.year] || 0) + 1;
      return acc;
    }, {});

    const summary = `Total: ${totalStudents} | Programs: ${Object.entries(programCounts)
      .map(([prog, count]) => `${prog}: ${count}`)
      .join(', ')} | Years: ${Object.entries(yearCounts)
      .map(([year, count]) => `Year ${year}: ${count}`)
      .join(', ')}`;
    
    info(summary);
  };

  const generateStudentIds = () => {
    const currentYear = new Date().getFullYear();
    const nextId = students.length > 0 
      ? Math.max(...students.map(s => parseInt(s.studentId.slice(-3)) || 0)) + 1
      : 1;
    
    const newId = `ST${currentYear}${nextId.toString().padStart(3, '0')}`;
    
    setFormData(prev => ({
      ...prev,
      studentId: newId
    }));
    
    info(`Generated student ID: ${newId}`);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const hasFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  // Statistics calculations
  const stats = {
    total: students.length,
    programs: [...new Set(students.map(s => s.program))].length,
    avgAge: students.filter(s => s.dateOfBirth).length > 0 
      ? Math.round(students
          .filter(s => s.dateOfBirth)
          .reduce((sum, s) => sum + calculateAge(s.dateOfBirth), 0) / 
          students.filter(s => s.dateOfBirth).length)
      : 0,
    recentAdmissions: students.filter(s => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return new Date(s.createdDate || 0) > sixMonthsAgo;
    }).length
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <p style={loadingTextStyle}>Loading students...</p>
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
                  ? '👨‍🎓 Registered Students' 
                  : '👨‍🎓 Student Management'
                }
          </h1>
          <p style={subtitleStyle}>
            {user?.role==='STUDENT' 
                  ? 'View your records and academic information' 
                  : 'Manage student records and academic information'
                }
          </p>
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
          <button 
            className="btn btn-primary" 
            onClick={openCreateModal}
            style={primaryButtonStyle}
          >
            ➕ Add New Student
          </button>
                  </>
                }

         
        </div>
      </div>

      {/* Enhanced Search */}
      <AdvancedSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search students by name, ID, email, or program..."
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
        totalResults={students.length}
        filteredResults={filteredData.length}
        searchTerm={searchTerm}
        hasFilters={hasFilters}
      />

      {/* Enhanced Statistics Cards */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={{...statIconStyle, backgroundColor: '#e3f2fd'}}>👨‍🎓</div>
          <div>
            <div style={statNumberStyle}>{stats.total}</div>
            <div style={statLabelStyle}>Total Students</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{...statIconStyle, backgroundColor: '#e8f5e8'}}>📚</div>
          <div>
            <div style={statNumberStyle}>{stats.programs}</div>
            <div style={statLabelStyle}>Academic Programs</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{...statIconStyle, backgroundColor: '#fff3e0'}}>🎂</div>
          <div>
            <div style={statNumberStyle}>{stats.avgAge || 'N/A'}</div>
            <div style={statLabelStyle}>Average Age</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{...statIconStyle, backgroundColor: '#f3e5f5'}}>⭐</div>
          <div>
            <div style={statNumberStyle}>{filteredData.length}</div>
            <div style={statLabelStyle}>Filtered Results</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div style={tableContainerStyle}>
        <table className="table" style={tableStyle}>
          <thead>
            <tr>
              <SortableHeader 
                title="Student ID" 
                sortKey="studentId" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <SortableHeader 
                title="Name" 
                sortKey="lastName" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <th>Contact Information</th>
              <SortableHeader 
                title="Program" 
                sortKey="program" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <SortableHeader 
                title="Year" 
                sortKey="year" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <th>Age</th>
              { user?.role !== 'STUDENT' && user?.role !== 'FACULTY' && (
                   
                  <th style={actionsHeaderStyle}>Actions</th>
                )
                }
              
            </tr>
          </thead>
          <tbody>
            {filteredData.map(student => {
              const age = calculateAge(student.dateOfBirth);
              
              return (
                <tr key={student.id} style={tableRowStyle}>
                  <td style={studentIdColumnStyle}>
                    <span style={studentIdBadgeStyle}>
                      {student.studentId}
                    </span>
                  </td>
                  <td style={nameColumnStyle}>
                    <div style={nameInfoStyle}>
                      <div style={fullNameStyle}>
                        {student.firstName} {student.lastName}
                      </div>
                    </div>
                  </td>
                  <td style={contactColumnStyle}>
                    <div style={contactInfoStyle}>
                      <div style={emailStyle}>
                        📧 {student.email}
                      </div>
                      <div style={phoneStyle}>
                        📱 {student.phoneNumber}
                      </div>
                    </div>
                  </td>
                  <td style={programColumnStyle}>
                    <div style={programInfoStyle}>
                      <span style={programBadgeStyle}>
                        {student.program}
                      </span>
                    </div>
                  </td>
                  <td style={yearColumnStyle}>
                    <span style={yearBadgeStyle}>
                      Year {student.year}
                    </span>
                  </td>
                  <td style={ageColumnStyle}>
                    <div style={ageDisplayStyle}>
                      {age ? (
                        <span style={ageValueStyle}>{age} years</span>
                      ) : (
                        <span style={noAgeStyle}>N/A</span>
                      )}
                    </div>
                  </td>
                {user?.role !== 'STUDENT' && user?.role !== 'FACULTY' && (
                  <td style={actionsColumnStyle}>
                    <div style={actionButtonsStyle}>
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEdit(student)}
                        style={editButtonStyle}
                        title="Edit student"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(student)}
                        style={deleteButtonStyle}
                        title="Delete student"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                )}
                 
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
                <h3>No students found</h3>
                <p>No students match your search criteria.</p>
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
                <div style={noResultsIconStyle}>👨‍🎓</div>
                <h3>No students available</h3>
                <p>Start by adding your first student.</p>
                <button 
                  onClick={openCreateModal} 
                  className="btn btn-primary"
                  style={addFirstButtonStyle}
                >
                  Add First Student
                </button>
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
              <span style={modalIconStyle}>
                {editingStudent ? '✏️' : '➕'}
              </span>
              {editingStudent ? `Edit Student: ${editingStudent.firstName} ${editingStudent.lastName}` : 'Add New Student'}
            </div>
          }
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={formRowStyle}>
              <div className="form-group" style={formGroupStyle}>
                <label style={labelStyle}>Student ID *</label>
                <div style={inputWithButtonStyle}>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., ST2024001"
                    style={inputStyle}
                    maxLength="20"
                  />
                  <button
                    type="button"
                    onClick={() => handleBulkAction('generate-ids')}
                    style={generateButtonStyle}
                    title="Generate ID"
                  >
                    🎲
                  </button>
                </div>
                <small style={helpTextStyle}>Unique identifier for the student</small>
              </div>
            </div>

            <div style={formRowStyle}>
              <div className="form-group" style={formGroupHalfStyle}>
                <label style={labelStyle}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="First Name"
                  style={inputStyle}
                  maxLength="50"
                />
              </div>
              <div className="form-group" style={formGroupHalfStyle}>
                <label style={labelStyle}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Last Name"
                  style={inputStyle}
                  maxLength="50"
                />
              </div>
            </div>

            <div className="form-group">
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="student@university.edu"
                style={inputStyle}
                maxLength="100"
              />
              <small style={helpTextStyle}>University or personal email address</small>
            </div>

            <div style={formRowStyle}>
              <div className="form-group" style={formGroupHalfStyle}>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="+1234567890"
                  style={inputStyle}
                  maxLength="20"
                />
              </div>
              <div className="form-group" style={formGroupHalfStyle}>
                <label style={labelStyle}>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  style={inputStyle}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div style={formRowStyle}>
              <div className="form-group" style={formGroupHalfStyle}>
                <label style={labelStyle}>Academic Program *</label>
                <select
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  required
                  style={selectStyle}
                >
                  <option value="">Select Program</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>
              <div className="form-group" style={formGroupHalfStyle}>
                <label style={labelStyle}>Academic Year *</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  style={selectStyle}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            {/* Student Preview */}
            {formData.firstName && formData.lastName && (
              <div style={previewStyle}>
                <h4 style={previewTitleStyle}>👤 Student Preview</h4>
                <div style={previewContentStyle}>
                  <div style={previewItemStyle}>
                    <strong>Full Name:</strong> {formData.firstName} {formData.lastName}
                  </div>
                  <div style={previewItemStyle}>
                    <strong>Student ID:</strong> {formData.studentId || 'Not set'}
                  </div>
                  <div style={previewItemStyle}>
                    <strong>Program:</strong> {formData.program || 'Not selected'} 
                    {formData.year && ` - Year ${formData.year}`}
                  </div>
                  {formData.dateOfBirth && (
                    <div style={previewItemStyle}>
                      <strong>Age:</strong> {calculateAge(formData.dateOfBirth) || 'Unknown'} years
                    </div>
                  )}
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
              >
                {editingStudent ? '💾 Update Student' : '➕ Create Student'}
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

const studentIdColumnStyle = {
  padding: '16px'
};

const studentIdBadgeStyle = {
  padding: '6px 12px',
  backgroundColor: '#e3f2fd',
  color: '#1976d2',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const nameColumnStyle = {
  padding: '16px'
};

const nameInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const fullNameStyle = {
  fontWeight: '600',
  color: 'var(--color-text)',
  fontSize: '15px'
};

const contactColumnStyle = {
  padding: '16px'
};

const contactInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const emailStyle = {
  fontSize: '13px',
  color: 'var(--color-text-secondary)'
};

const phoneStyle = {
  fontSize: '13px',
  color: 'var(--color-text-secondary)'
};

const programColumnStyle = {
  padding: '16px'
};

const programInfoStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const programBadgeStyle = {
  padding: '4px 8px',
  backgroundColor: '#f1f8e9',
  color: '#558b2f',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500',
  textAlign: 'center'
};

const yearColumnStyle = {
  padding: '16px',
  textAlign: 'center'
};

const yearBadgeStyle = {
  padding: '4px 8px',
  backgroundColor: '#fff3e0',
  color: '#f57c00',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const ageColumnStyle = {
  padding: '16px',
  textAlign: 'center'
};

const ageDisplayStyle = {
  fontSize: '14px'
};

const ageValueStyle = {
  fontWeight: '500',
  color: 'var(--color-text)'
};

const noAgeStyle = {
  color: 'var(--color-text-secondary)',
  fontStyle: 'italic'
};

const actionsHeaderStyle = {
  width: '160px'
};

const actionsColumnStyle = {
  padding: '16px'
};

const actionButtonsStyle = {
  display: 'flex',
  gap: '8px'
};

const editButtonStyle = {
  padding: '6px 12px',
  fontSize: '12px',
  borderRadius: '6px'
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

const formRowStyle = {
  display: 'flex',
  gap: '16px'
};

const formGroupStyle = {
  flex: 1
};

const formGroupHalfStyle = {
  flex: 1
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

const selectStyle = {
  width: '100%',
  padding: '12px',
  border: '2px solid var(--color-border)',
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: 'var(--color-background)',
  color: 'var(--color-text)',
  transition: 'border-color 0.3s'
};

const inputWithButtonStyle = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center'
};

const generateButtonStyle = {
  padding: '12px',
  border: '2px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'all 0.2s'
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

export default EnhancedStudentManagement;