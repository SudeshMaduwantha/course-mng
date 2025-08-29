import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import CourseManagement from './components/CourseManagement';
import StudentManagement from './components/StudentManagement';
import RegistrationManagement from './components/RegistrationManagement';
import ResultsManagement from './components/ResultsManagement';

function App() {
  const [activeTab, setActiveTab] = useState('courses');

  const renderActiveComponent = () => {
    switch(activeTab) {
      case 'courses':
        return <CourseManagement />;
      case 'students':
        return <StudentManagement />;
      case 'registrations':
        return <RegistrationManagement />;
      case 'results':
        return <ResultsManagement />;
      default:
        return <CourseManagement />;
    }
  };

  return (
    <div className="App">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <div className="container">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
}

export default App;