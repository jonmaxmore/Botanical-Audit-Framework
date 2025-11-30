import React, { useState, useEffect } from 'react';
import { Check, X, User, FileText, RefreshCw } from 'lucide-react';

interface KYCUser {
  _id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  idCard: string; // Using idCard from model
  laserCode?: string;
  idCardImage?: { path: string };
  verificationStatus: string;
  createdAt: string;
}

const KYCQueue: React.FC = () => {
  const [users, setUsers] = useState<KYCUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<KYCUser | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      // Replace with your actual API client or fetch
      const response = await fetch('/api/v2/kyc/pending');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch KYC queue', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleVerify = async (userId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/v2/kyc/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action, reason }),
      });
      const result = await response.json();

      if (result.success) {
        // Remove from list
        setUsers(users.filter(u => u._id !== userId));
        setSelectedUser(null);
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Verification failed', error);
      alert('Verification failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Identity Verification Queue (KYC)</h1>
        <button
          onClick={fetchPendingUsers}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Column */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-700">Pending Requests ({users.length})</h2>
          </div>
          <div className="divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending requests</div>
            ) : (
              users.map(user => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedUser?._id === user._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">ID: {user.idCard || user.nationalId}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Submitted: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</h2>
                  <p className="text-gray-500">Applicant ID: {selectedUser._id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Personal Info</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-400">National ID</label>
                      <p className="font-mono text-lg">{selectedUser.idCard || selectedUser.nationalId}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Laser Code</label>
                      <p className="font-mono text-lg">{selectedUser.laserCode || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">ID Card Image</h3>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {selectedUser.idCardImage ? (
                      <img
                        src={selectedUser.idCardImage.path}
                        alt="ID Card"
                        className="max-h-full max-w-full object-contain rounded"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <FileText size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No image uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  onClick={() => handleVerify(selectedUser._id, 'APPROVE')}
                  disabled={processing}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={20} /> Approve Verification
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) handleVerify(selectedUser._id, 'REJECT', reason);
                  }}
                  disabled={processing}
                  className="flex-1 bg-red-50 text-red-600 border border-red-200 py-3 px-4 rounded-lg hover:bg-red-100 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X size={20} /> Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center h-full flex flex-col items-center justify-center text-gray-400">
              <User size={64} className="mb-4 opacity-20" />
              <p className="text-lg">Select a user from the list to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCQueue;
