// Constants
module.exports = {
  API_VERSION: 'v1',
  DEFAULT_PORT: 3004,
  DATABASE_NAME: 'gacp_platform',
  JWT_EXPIRY: '24h',
  ROLES: {
    ADMIN: 'admin',
    FARMER: 'farmer',
    DTAM: 'dtam',
    AUDITOR: 'auditor'
  },
  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  }
};
