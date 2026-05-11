import React from 'react';
import { RobotOutlined } from '@ant-design/icons';

interface Props {
  advice: string;
  userName: string;
}

const MentorAdvice: React.FC<Props> = ({ advice, userName }) => {
  return (
    <div style={{
      backgroundColor: '#f0f7ff',
      border: '1px solid #bae7ff',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      animation: 'fadeIn 0.5s ease-in-out'
    }}>
      <div style={{ 
        fontSize: '28px', 
        color: '#1890ff', 
        background: '#ffffff',
        padding: '8px',
        borderRadius: '10px',
        display: 'flex',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <RobotOutlined />
      </div>
      
      <div style={{ flex: 1 }}>
        <h4 style={{ 
          margin: '0 0 6px 0', 
          color: '#003a8c', 
          fontSize: '15px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          Mentor AI đồng hành cùng {userName}
          <span style={{ 
            fontSize: '10px', 
            backgroundColor: '#e6f7ff', 
            color: '#1890ff', 
            padding: '2px 8px', 
            borderRadius: '10px',
            border: '1px solid #91d5ff'
          }}>Đang trực tuyến</span>
        </h4>
        <p style={{ 
          margin: 0, 
          color: '#434343', 
          fontSize: '14px', 
          lineHeight: '1.5',
          fontStyle: 'italic' 
        }}>
          "{advice}"
        </p>
      </div>
    </div>
  );
};

export default MentorAdvice;