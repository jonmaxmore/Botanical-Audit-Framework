import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionStatus = () => {
  const [status, setStatus] = useState({
    isConnected: false,
    mongodb: 'checking',
    lastChecked: null,
    isChecking: false
  });

  const checkHealth = async() => {
    setStatus(prev => ({ ...prev, isChecking: true }));

    try {
      const response = await axios.get('/api/health');
      setStatus({
        isConnected: true,
        mongodb: response.data.mongodb.status,
        lastChecked: new Date(),
        isChecking: false
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        mongodb: 'unhealthy',
        lastChecked: new Date(),
        isChecking: false
      });
    }
  };

  const triggerReconnect = async() => {
    try {
      await axios.post('/api/mongodb/reconnect');
      setTimeout(checkHealth, 2000);
    } catch (error) {
      console.error('Failed to trigger reconnect', error);
    }
  };

  useEffect(() => {
    // Check on mount
    checkHealth();

    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="connection-status">
      <div className={`status-indicator ${status.mongodb}`}>
        <span className="status-text">
          {status.mongodb === 'healthy' ? 'Connected' : 'Connection Issues'}
        </span>
        {status.lastChecked && (
          <span className="status-time">
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="status-actions">
        <button onClick={checkHealth} disabled={status.isChecking}>
          Check Status
        </button>
        <button onClick={triggerReconnect} disabled={status.mongodb === 'healthy'}>
          Reconnect
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;
