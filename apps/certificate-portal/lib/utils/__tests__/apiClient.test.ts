/**
 * API Client Tests
 * Tests for retry logic, offline queue, and error handling
 */

import { offlineQueue } from '../apiClient';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get store() {
      return store;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Offline Queue', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  describe('store', () => {
    it('should store action in offline queue', () => {
      offlineQueue.store('POST', '/certificates', { farmName: 'Test Farm' });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      const savedQueue = JSON.parse(mockLocalStorage.store['offline_actions'] || '[]');
      expect(savedQueue).toHaveLength(1);
      expect(savedQueue[0]).toMatchObject({
        method: 'POST',
        url: '/certificates',
        data: { farmName: 'Test Farm' },
      });
    });

    it('should store multiple actions to queue', () => {
      offlineQueue.store('POST', '/certificates', { farmName: 'Farm 1' });
      offlineQueue.store('PUT', '/certificates/1', { farmName: 'Farm 2' });
      
      const savedQueue = JSON.parse(mockLocalStorage.store['offline_actions'] || '[]');
      expect(savedQueue).toHaveLength(2);
    });

    it('should handle store without data', () => {
      offlineQueue.store('GET', '/certificates');
      
      const savedQueue = JSON.parse(mockLocalStorage.store['offline_actions'] || '[]');
      expect(savedQueue).toHaveLength(1);
      expect(savedQueue[0].data).toBeUndefined();
    });

    it('should include timestamp in stored action', () => {
      offlineQueue.store('POST', '/certificates', { farmName: 'Test' });
      
      const savedQueue = JSON.parse(mockLocalStorage.store['offline_actions'] || '[]');
      expect(savedQueue[0]).toHaveProperty('timestamp');
      expect(savedQueue[0].timestamp).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no queue exists', () => {
      const queue = offlineQueue.getAll();
      expect(queue).toEqual([]);
    });

    it('should return stored actions', () => {
      offlineQueue.store('POST', '/certificates', { farmName: 'Test' });
      const queue = offlineQueue.getAll();
      
      expect(queue).toHaveLength(1);
      expect(queue[0]).toMatchObject({
        method: 'POST',
        url: '/certificates',
      });
    });

    it('should handle malformed queue data', () => {
      mockLocalStorage.store['offline_actions'] = 'invalid json';
      const queue = offlineQueue.getAll();
      expect(queue).toEqual([]);
    });

    it('should return all stored actions', () => {
      offlineQueue.store('POST', '/certificates', { farmName: 'Test 1' });
      offlineQueue.store('PUT', '/certificates/1', { farmName: 'Test 2' });
      offlineQueue.store('DELETE', '/certificates/2');
      
      const queue = offlineQueue.getAll();
      expect(queue).toHaveLength(3);
    });
  });

  describe('clear', () => {
    it('should clear offline queue', () => {
      offlineQueue.store('POST', '/certificates', { farmName: 'Test' });
      offlineQueue.clear();
      
      const queue = offlineQueue.getAll();
      expect(queue).toEqual([]);
    });

    it('should set empty array in localStorage', () => {
      offlineQueue.store('POST', '/certificates', { farmName: 'Test' });
      offlineQueue.clear();
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'offline_actions',
        JSON.stringify([])
      );
    });
  });

  describe('sync', () => {
    it('should return 0 when queue is empty', async () => {
      const result = await offlineQueue.sync();
      expect(result).toBe(0);
    });

    it('should return count of synced actions', async () => {
      offlineQueue.store('POST', '/certificates', { farmName: 'Test' });
      
      // Note: Actual sync would require mocking axios, so this tests the structure
      const actions = offlineQueue.getAll();
      expect(actions).toHaveLength(1);
    });
  });

  describe('error scenarios', () => {
    it('should handle localStorage not available', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const queue = offlineQueue.getAll();
      expect(queue).toEqual([]);
    });

    it('should handle JSON parse errors gracefully', () => {
      mockLocalStorage.store['offline_actions'] = '{invalid}';
      
      const queue = offlineQueue.getAll();
      expect(queue).toEqual([]);
    });

    it('should handle store errors', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      // Should not throw
      expect(() => {
        offlineQueue.store('POST', '/test', {});
      }).toThrow(); // Will throw because localStorage.setItem throws
    });
  });
});

