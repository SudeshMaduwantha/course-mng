import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { useNotification } from './NotificationSystem';
import { useAdvancedSearch, AdvancedSearchBar, FilterPanel, SortableHeader, SearchResultsSummary } from './SearchFilterSystem';
import { useConfirm } from './NotificationSystem';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthContext';

const EnhancedCourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    credits: ''
  });

  // Enhanced hooks
  const { success, error, warning, info } = useNotification();
  const { confirm, ConfirmComponent } = useConfirm();
  const { theme } = useTheme();
  const {user, hasPermission} =useAuth();

  // Advanced search configuration
  const searchableFields = ['title', 'code', 'description'];
  const filterConfig = [
    {
      key: 'credits',
      label: 'Credits',
      type: 'range',
      options: []
    },
    {
      key: 'title',
      label: 'Title Contains',
      type: 'text',
      options: []
    },
    {
      key: 'code',
      label: 'Course Code',
      type: 'select',
      options: [
        { value: 'CS', label: 'Computer Science (CS)' },
        { value: 'MATH', label: 'Mathematics (MATH)' },
        { value: 'ENG', label: 'Engineering (ENG)' },
        { value: 'BUS', label: 'Business (BUS)' },
        { value: 'SCI', label: 'Science (SCI)' }
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
  } = useAdvancedSearch(courses, searchableFields);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/courses');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCourses(data);
      success(`Loaded ${data.length} courses successfully`);
    } catch (err) {
      console.error('Error fetching courses:', err);
      error('Failed to load courses. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.code.trim()) {
      warning('Please fill in all required fields');
      return;
    }

    try {
      const url = editingCourse 
        ? `http://localhost:8080/api/courses/${editingCourse.id}`
        : 'http://localhost:8080/api/courses';
      
      const method = editingCourse ? 'PUT' : 'POST';
      
      const courseData = {
        ...formData,
        credits: formData.credits ? parseInt(formData.credits) : null,
        title: formData.title.trim(),
        code: formData.code.trim().toUpperCase()
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        await fetchCourses();
        setShowModal(false);
        setEditingCourse(null);
        resetForm();
        success(
          editingCourse 
            ? `Course "${courseData.code}" updated successfully!` 
            : `Course "${courseData.code}" created successfully!`
        );
      } else {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to save course');
      }
    } catch (err) {
      console.error('Error saving course:', err);
      error(`Failed to ${editingCourse ? 'update' : 'create'} course: ${err.message}`);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      code: course.code || '',
      description: course.description || '',
      credits: course.credits || ''
    });
    setShowModal(true);
    info(`Editing course: ${course.code}`);
  };

  const handleDelete = async (course) => {
    const confirmed = await confirm({
      title: 'Delete Course',
      message: `Are you sure you want to delete "${course.code} - ${course.title}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete Course',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        const response = await fetch(`http://localhost:8080/api/courses/${course.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchCourses();
          success(`Course "${course.code}" deleted successfully`);
        } else {
          throw new Error('Failed to delete course');
        }
      } catch (err) {
        console.error('Error deleting course:', err);
        error(`Failed to delete course: ${err.message}`);
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
    setFormData({ title: '', code: '', description: '', credits: '' });
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    resetForm();
    setShowModal(true);
  };

  const handleBulkAction = async (action) => {
    switch (action) {
      case 'export':
        exportCourses();
        break;
      case 'refresh':
        await fetchCourses();
        break;
      default:
        info('Bulk action not implemented yet');
    }
  };

  const exportCourses = () => {
    try {
      const csvContent = [
        ['Code', 'Title', 'Credits', 'Description'],
        ...filteredData.map(course => [
          course.code,
          course.title,
          course.credits || '',
          course.description || ''
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `courses_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      success('Courses exported successfully!');
    } catch (err) {
      error('Failed to export courses');
    }
  };

  const hasFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <p style={loadingTextStyle}>Loading courses...</p>
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
                  ? '📚 View Courses' 
                  : '📚 Course Management'
                }
          </h1>
          <p style={subtitleStyle}>
            {user?.role==='STUDENT' 
                  ? 'View your academic course catalog' 
                  : 'Manage your academic course catalog'
                }
          </p>
        </div>
        <div style={headerActionsStyle}>
          {user?.role==='STUDENT' 
                  ? '' 
                  : <>
                    <button 
            className="btn btn-secondary" 
            onClick={() => handleBulkAction('export')}
            style={actionButtonStyle}
          >
            📊 Export CSV
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
            ➕ Add New Course
          </button>
                  </>
                }
          
        </div>
      </div>

      {/* Enhanced Search */}
      <AdvancedSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search courses by title, code, or description..."
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
        totalResults={courses.length}
        filteredResults={filteredData.length}
        searchTerm={searchTerm}
        hasFilters={hasFilters}
      />

      {/* Enhanced Statistics Cards */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <div style={statIconStyle}>📚</div>
          <div>
            <div style={statNumberStyle}>{courses.length}</div>
            <div style={statLabelStyle}>Total Courses</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle}>🔍</div>
          <div>
            <div style={statNumberStyle}>{filteredData.length}</div>
            <div style={statLabelStyle}>Filtered Results</div>
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={statIconStyle}>📊</div>
          <div>
            <div style={statNumberStyle}>
              {courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + (c.credits || 0), 0) / courses.length) : 0}
            </div>
            <div style={statLabelStyle}>Avg Credits</div>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div style={tableContainerStyle}>
        <table className="table" style={tableStyle}>
          <thead>
            <tr>
              <SortableHeader 
                title="Code" 
                sortKey="code" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <SortableHeader 
                title="Title" 
                sortKey="title" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <SortableHeader 
                title="Credits" 
                sortKey="credits" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              <SortableHeader 
                title="Description" 
                sortKey="description" 
                currentSort={sortConfig} 
                onSort={handleSort} 
              />
              {user?.role==='STUDENT' 
                  ? '' 
                  : <th style={actionsHeaderStyle}>Actions</th>
                }
              
            </tr>
          </thead>
          <tbody>
            {filteredData.map(course => (
              <tr key={course.id} style={tableRowStyle}>
                <td style={codeColumnStyle}>
                  <span style={codeBadgeStyle}>{course.code}</span>
                </td>
                <td style={titleColumnStyle}>
                  <div style={titleTextStyle}>{course.title}</div>
                </td>
                <td style={creditsColumnStyle}>
                  <span style={creditsBadgeStyle}>
                    {course.credits ? `${course.credits} credits` : 'N/A'}
                  </span>
                </td>
                <td style={descriptionColumnStyle}>
                  <div style={descriptionTextStyle}>
                    {course.description 
                      ? (course.description.length > 60 
                          ? course.description.substring(0, 60) + '...' 
                          : course.description)
                      : 'No description available'
                    }
                  </div>
                </td>
                <td style={actionsColumnStyle}>
                  <div style={actionButtonsStyle}>
                    {user?.role==='STUDENT' 
                  ? '' 
                  : <>
                  <button
                      className="btn btn-warning"
                      onClick={() => handleEdit(course)}
                      style={editButtonStyle}
                      title="Edit course"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(course)}
                      style={deleteButtonStyle}
                      title="Delete course"
                    >
                      🗑️ Delete
                    </button>
                  </>
                }
                    
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div style={noResultsStyle}>
            {searchTerm || hasFilters ? (
              <div style={noResultsContentStyle}>
                <div style={noResultsIconStyle}>🔍</div>
                <h3>No courses found</h3>
                <p>No courses match your search criteria.</p>
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
               
                <div style={noResultsIconStyle}>📚</div>
                <h3>No courses available</h3>
                <p>
                 {user?.role==='STUDENT' 
                  ? '' 
                  : 'Start by adding your first course.'
                }</p>
                {user?.role==='STUDENT' 
                  ? '' 
                  :<button 
                  onClick={openCreateModal} 
                  className="btn btn-primary"
                  style={addFirstButtonStyle}
                >
                  Add First Course
                </button>
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
              <span style={modalIconStyle}>
                {editingCourse ? '✏️' : '➕'}
              </span>
              {editingCourse ? `Edit Course: ${editingCourse.code}` : 'Add New Course'}
            </div>
          }
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} style={formStyle}>
            <div className="form-group">
              <label style={labelStyle}>Course Code *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="e.g., CS101, MATH201"
                style={inputStyle}
                maxLength="10"
              />
              <small style={helpTextStyle}>Course code should be unique and descriptive</small>
            </div>

            <div className="form-group">
              <label style={labelStyle}>Course Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Introduction to Computer Science"
                style={inputStyle}
                maxLength="100"
              />
            </div>

            <div className="form-group">
              <label style={labelStyle}>Credits</label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleInputChange}
                placeholder="e.g., 3"
                min="1"
                max="6"
                style={inputStyle}
              />
              <small style={helpTextStyle}>Typical range: 1-6 credits</small>
            </div>

            <div className="form-group">
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide a detailed description of the course content, objectives, and prerequisites..."
                style={textareaStyle}
                rows="4"
                maxLength="500"
              />
              <small style={helpTextStyle}>
                {formData.description.length}/500 characters
              </small>
            </div>

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
                {editingCourse ? '💾 Update Course' : '➕ Create Course'}
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
  backgroundColor: '#f8f9fa',
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

const codeColumnStyle = {
  padding: '16px',
  fontWeight: '600'
};

const codeBadgeStyle = {
  padding: '6px 12px',
  backgroundColor: '#e3f2fd',
  color: '#1976d2',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const titleColumnStyle = {
  padding: '16px'
};

const titleTextStyle = {
  fontWeight: '500',
  color: 'var(--color-text)'
};

const creditsColumnStyle = {
  padding: '16px'
};

const creditsBadgeStyle = {
  padding: '4px 8px',
  backgroundColor: '#f1f8e9',
  color: '#558b2f',
  borderRadius: '12px',
  fontSize: '12px'
};

const descriptionColumnStyle = {
  padding: '16px',
  maxWidth: '300px'
};

const descriptionTextStyle = {
  fontSize: '14px',
  lineHeight: '1.4',
  color: 'var(--color-text-secondary)'
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

const labelStyle = {
  fontWeight: '600',
  marginBottom: '8px',
  color: 'var(--color-text)'
};

const inputStyle = {
  padding: '12px',
  border: '2px solid var(--color-border)',
  borderRadius: '8px',
  fontSize: '14px',
  transition: 'border-color 0.3s'
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: '100px',
  fontFamily: 'inherit'
};

const helpTextStyle = {
  fontSize: '12px',
  color: 'var(--color-text-secondary)',
  marginTop: '4px'
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

export default EnhancedCourseManagement;