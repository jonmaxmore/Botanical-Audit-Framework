'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setStatus('success');
        setMessage(data.message || 'API is running');
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.message);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-2xl font-bold text-gray-900">Welcome</h2>
        <p className="mt-2 text-gray-600">
          GACP Platform for Botanical Auditing and Framework Management
        </p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        <div className="mt-4 flex items-center space-x-2">
          <div
            className={`h-3 w-3 rounded-full ${
              status === 'success'
                ? 'bg-green-500'
                : status === 'error'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {status === 'loading' ? 'Checking...' : message}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="font-semibold text-gray-900">Plants</h3>
          <p className="mt-2 text-sm text-gray-600">Manage botanical specimens</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="font-semibold text-gray-900">Audits</h3>
          <p className="mt-2 text-sm text-gray-600">Track audit activities</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="font-semibold text-gray-900">Reports</h3>
          <p className="mt-2 text-sm text-gray-600">Generate compliance reports</p>
        </div>
      </div>
    </div>
  );
}
