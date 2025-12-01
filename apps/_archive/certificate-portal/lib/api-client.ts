import { createApiClient } from '@gacp/utils';

const apiClient = createApiClient({
  authTokenKey: 'cert_token',
});

export default apiClient;
