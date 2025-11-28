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
          }`
        });
      } catch (error) {
        setStatus({
          loading: false,
          connected: false,
          message: `Cannot connect to backend: ${error.message}`
        });
      }
    };

    checkConnection();
  }, []);

  let content;
  if (status.loading) {
    content = <p>Checking connection...</p>;
  } else if (status.connected) {
    content = <p style={{ color: 'green' }}>✅ {status.message}</p>;
  } else {
    content = <p style={{ color: 'red' }}>❌ {status.message}</p>;
  }

  return <div className="system-status">{content}</div>;
};

export default SystemStatus;
