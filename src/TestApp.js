import React, { useState } from 'react';

// Simple test components
const TestCourses = () => <div><h2>Courses Work!</h2></div>;
const TestStudents = () => <div><h2>Students Work!</h2></div>;
const TestRegistrations = () => <div><h2>Registrations Work!</h2></div>;
const TestResults = () => <div><h2>Results Work!</h2></div>;

const TestApp = () => {
  const [activeTab, setActiveTab] = useState('courses');

  const renderComponent = () => {
    switch(activeTab) {
      case 'courses': return <TestCourses />;
      case 'students': return <TestStudents />;
      case 'registrations': return <TestRegistrations />;
      case 'results': return <TestResults />;
      default: return <TestCourses />;
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Simple Navigation */}
      <nav style={{ 
        backgroundColor: '#007bff', 
        padding: '1rem',
        marginBottom: '2rem'
      }}>
        <h1 style={{ color: 'white', margin: 0 }}>Course Management System</h1>
        <div style={{ marginTop: '1rem' }}>
          {['courses', 'students', 'registrations', 'results'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                margin: '0 10px',
                padding: '8px 16px',
                backgroundColor: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#007bff' : 'white',
                border: '1px solid white',
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div style={{ padding: '0 2rem' }}>
        {renderComponent()}
      </div>
    </div>
  );
};

export default TestApp;