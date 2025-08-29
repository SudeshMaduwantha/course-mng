import React, { useState, useEffect } from 'react';

const SimpleCourseTest = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple test data
    setCourses([
      { id: 1, code: 'CS101', title: 'Intro to Computer Science', credits: 3 },
      { id: 2, code: 'CS102', title: 'Data Structures', credits: 4 }
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Course Management (Test)</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Code</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Title</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Credits</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{course.code}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{course.title}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{course.credits}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimpleCourseTest;