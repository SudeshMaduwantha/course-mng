import React, { useState, useMemo, useCallback } from 'react';

// Advanced Search Hook
export const useAdvancedSearch = (data, searchableFields) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => {
        return searchableFields.some(field => {
          const value = getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply custom filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        result = result.filter(item => {
          const itemValue = getNestedValue(item, key);
          
          if (typeof value === 'object' && value.type) {
            // Handle different filter types
            switch (value.type) {
              case 'range':
                return itemValue >= value.min && itemValue <= value.max;
              case 'date':
                const itemDate = new Date(itemValue);
                const filterDate = new Date(value.value);
                return itemDate.toDateString() === filterDate.toDateString();
              case 'contains':
                return itemValue && itemValue.toString().toLowerCase().includes(value.value.toLowerCase());
              default:
                return itemValue === value.value;
            }
          }
          
          return itemValue === value;
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig, searchableFields]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({});
    setSortConfig({ key: null, direction: 'asc' });
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    sortConfig,
    handleSort,
    filteredData: filteredAndSortedData
  };
};

// Utility function to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Advanced Search Component
export const AdvancedSearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search...",
  showClearButton = true 
}) => {
  return (
    <div style={searchBarContainerStyle}>
      <div style={searchInputContainerStyle}>
        <span style={searchIconStyle}>🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          style={searchInputStyle}
        />
        {showClearButton && searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            style={clearButtonStyle}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Filter Panel Component
export const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  filterConfig = [],
  isOpen = false,
  onToggle 
}) => {
  return (
    <div style={filterPanelStyle}>
      <div style={filterHeaderStyle}>
        <span style={filterTitleStyle}>🔧 Filters</span>
        <div style={filterActionsStyle}>
          <button onClick={onClearFilters} style={clearFiltersButtonStyle}>
            Clear All
          </button>
          <button onClick={onToggle} style={toggleButtonStyle}>
            {isOpen ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div style={filterContentStyle}>
          {filterConfig.map(config => (
            <FilterControl
              key={config.key}
              config={config}
              value={filters[config.key]}
              onChange={(value) => onFilterChange(config.key, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Individual Filter Control Component
const FilterControl = ({ config, value, onChange }) => {
  const { key, label, type, options } = config;

  const renderControl = () => {
    switch (type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={filterSelectStyle}
          >
            <option value="">All {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'range':
        return (
          <div style={rangeContainerStyle}>
            <input
              type="number"
              placeholder="Min"
              value={value?.min || ''}
              onChange={(e) => onChange({
                ...value,
                min: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              style={rangeInputStyle}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={value?.max || ''}
              onChange={(e) => onChange({
                ...value,
                max: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              style={rangeInputStyle}
            />
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={filterInputStyle}
          />
        );

      case 'checkbox':
        return (
          <div style={checkboxContainerStyle}>
            {options.map(option => (
              <label key={option.value} style={checkboxLabelStyle}>
                <input
                  type="checkbox"
                  checked={value?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(currentValues.filter(v => v !== option.value));
                    }
                  }}
                  style={checkboxInputStyle}
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Filter by ${label}`}
            style={filterInputStyle}
          />
        );
    }
  };

  return (
    <div style={filterControlStyle}>
      <label style={filterLabelStyle}>{label}</label>
      {renderControl()}
    </div>
  );
};

// Sortable Table Header Component
export const SortableHeader = ({ 
  title, 
  sortKey, 
  currentSort, 
  onSort 
}) => {
  const isActive = currentSort.key === sortKey;
  
  return (
    <th 
      onClick={() => onSort(sortKey)}
      style={{
        ...sortableHeaderStyle,
        ...(isActive ? activeSortHeaderStyle : {})
      }}
    >
      <div style={headerContentStyle}>
        <span>{title}</span>
        <span style={sortIndicatorStyle}>
          {isActive ? (currentSort.direction === 'asc' ? '▲' : '▼') : '↕️'}
        </span>
      </div>
    </th>
  );
};

// Search Results Summary Component
export const SearchResultsSummary = ({ 
  totalResults, 
  filteredResults, 
  searchTerm,
  hasFilters 
}) => {
  return (
    <div style={summaryStyle}>
      <span style={resultsCountStyle}>
        Showing {filteredResults} of {totalResults} results
      </span>
      {(searchTerm || hasFilters) && (
        <span style={filterIndicatorStyle}>
          {searchTerm && `• Search: "${searchTerm}"`}
          {hasFilters && `• Filters applied`}
        </span>
      )}
    </div>
  );
};

// Enhanced Student Management with Advanced Search
export const EnhancedStudentList = ({ students, onEdit, onDelete }) => {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  
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
      label: 'Year',
      type: 'select',
      options: [
        { value: 1, label: '1st Year' },
        { value: 2, label: '2nd Year' },
        { value: 3, label: '3rd Year' },
        { value: 4, label: '4th Year' }
      ]
    },
    {
      key: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date'
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

  const hasFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  return (
    <div>
      <AdvancedSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search students by name, ID, email, or program..."
      />

      <FilterPanel
        filters={filters}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
        filterConfig={filterConfig}
        isOpen={filterPanelOpen}
        onToggle={() => setFilterPanelOpen(!filterPanelOpen)}
      />

      <SearchResultsSummary
        totalResults={students.length}
        filteredResults={filteredData.length}
        searchTerm={searchTerm}
        hasFilters={hasFilters}
      />

      <table className="table">
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
              sortKey="firstName" 
              currentSort={sortConfig} 
              onSort={handleSort} 
            />
            <SortableHeader 
              title="Email" 
              sortKey="email" 
              currentSort={sortConfig} 
              onSort={handleSort} 
            />
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(student => (
            <tr key={student.id}>
              <td><strong>{student.studentId}</strong></td>
              <td>{student.firstName} {student.lastName}</td>
              <td>{student.email}</td>
              <td>{student.program}</td>
              <td>{student.year}</td>
              <td>
                <div className="action-buttons">
                  <button className="btn btn-warning" onClick={() => onEdit(student)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => onDelete(student.id)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredData.length === 0 && (
        <div style={noResultsStyle}>
          {searchTerm || hasFilters ? (
            <div>
              <p>No students found matching your criteria</p>
              <button onClick={clearFilters} className="btn btn-secondary">
                Clear all filters
              </button>
            </div>
          ) : (
            <p>No students available</p>
          )}
        </div>
      )}
    </div>
  );
};

// Styles
const searchBarContainerStyle = {
  marginBottom: '20px'
};

const searchInputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const searchIconStyle = {
  position: 'absolute',
  left: '12px',
  fontSize: '16px',
  color: '#666',
  zIndex: 1
};

const searchInputStyle = {
  width: '100%',
  padding: '12px 12px 12px 40px',
  border: '2px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  transition: 'border-color 0.3s'
};

const clearButtonStyle = {
  position: 'absolute',
  right: '12px',
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: '#666'
};

const filterPanelStyle = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  marginBottom: '20px'
};

const filterHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  borderBottom: '1px solid #dee2e6'
};

const filterTitleStyle = {
  fontWeight: '600',
  color: '#495057'
};

const filterActionsStyle = {
  display: 'flex',
  gap: '8px'
};

const clearFiltersButtonStyle = {
  padding: '4px 8px',
  border: '1px solid #007bff',
  backgroundColor: 'transparent',
  color: '#007bff',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

const toggleButtonStyle = {
  padding: '4px 8px',
  border: 'none',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: '12px'
};

const filterContentStyle = {
  padding: '16px',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px'
};

const filterControlStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const filterLabelStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#495057'
};

const filterSelectStyle = {
  padding: '6px 8px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '14px'
};

const filterInputStyle = {
  padding: '6px 8px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '14px'
};

const rangeContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const rangeInputStyle = {
  padding: '6px 8px',
  border: '1px solid #ced4da',
  borderRadius: '4px',
  fontSize: '14px',
  width: '80px'
};

const checkboxContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '14px',
  cursor: 'pointer'
};

const checkboxInputStyle = {
  margin: 0
};

const sortableHeaderStyle = {
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'background-color 0.2s',
  padding: '12px',
  backgroundColor: '#f8f9fa'
};

const activeSortHeaderStyle = {
  backgroundColor: '#e9ecef'
};

const headerContentStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px'
};

const sortIndicatorStyle = {
  fontSize: '12px',
  opacity: 0.7
};

const summaryStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
  fontSize: '14px',
  color: '#666'
};

const resultsCountStyle = {
  fontWeight: '600'
};

const filterIndicatorStyle = {
  fontSize: '12px',
  color: '#007bff'
};

const noResultsStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#666'
};

export default useAdvancedSearch;