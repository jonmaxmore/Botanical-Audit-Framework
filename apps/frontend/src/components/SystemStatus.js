// If this component already exists, modify it:

import React, { useState, useEffect } from 'react';

const SystemStatus = () => {
  const [status, setStatus] = useState({ loading: true, connected: false, message: '' });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();

        setStatus({
          loading: false,
          connected: true,
          message: `Connected to backend. MongoDB: ${
            data.mongodb?.isConnected ? 'Connected' : 'Disconnected'
          }`,
        });
      } catch (error) {
        setStatus({
          loading: false,
          connected: false,
          message: `Cannot connect to backend: ${error.message}`,
        });
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="system-status">
      {status.loading ? (
        <p>Checking connection...</p>
      ) : status.connected ? (
        <p style={{ color: 'green' }}>✅ {status.message}</p>
      ) : (
        <p style={{ color: 'red' }}>❌ {status.message}</p>
      )}
    </div>
  );
};

export default SystemStatus;
