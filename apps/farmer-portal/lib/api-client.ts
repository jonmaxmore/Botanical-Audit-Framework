import { createApiClient } from '@gacp/utils';

const apiClient = createApiClient({
  authTokenKey: 'token',
});

export default apiClient;
