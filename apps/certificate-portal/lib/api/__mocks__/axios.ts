// Manual mock for axios
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

const mockAxiosInstance = {
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
  interceptors: {
    request: {
      use: jest.fn(),
      handlers: [],
    },
    response: {
      use: jest.fn(),
      handlers: [],
    }
  }
};

const mockedAxios = {
  create: jest.fn(() => mockAxiosInstance),
  mockGet,
  mockPost,
  mockPut,
  mockDelete,
};

module.exports = mockedAxios;
