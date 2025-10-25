/**
 * Offline Queue Tests
 * Tests for offline queue functionality
 */

import { offlineQueue } from '../apiClient';

describe('Offline Queue', () => {
  beforeEach(() => {
    localStorage.clear();
    offlineQueue.clear();
  });

  describe('Basic Storage', () => {
    it('should store action in queue', () => {
      offlineQueue.store('POST', '/api/certificates', { farmName: 'Test Farm' });

      const actions = offlineQueue.getAll();
      expect(actions).toHaveLength(1);
      expect(actions[0].method).toBe('POST');
      expect(actions[0].url).toBe('/api/certificates');
      expect(actions[0].data.farmName).toBe('Test Farm');
    });

    it('should store multiple actions', () => {
      offlineQueue.store('POST', '/api/certificates', { id: 1 });
      offlineQueue.store('PUT', '/api/certificates/123', { id: 2 });
      offlineQueue.store('DELETE', '/api/certificates/456', null);

      const actions = offlineQueue.getAll();
      expect(actions).toHaveLength(3);
    });

    it('should retrieve all queued actions', () => {
      offlineQueue.store('POST', '/api/test1', { a: 1 });
      offlineQueue.store('PUT', '/api/test2', { b: 2 });

      const actions = offlineQueue.getAll();
      expect(actions).toHaveLength(2);
      expect(actions[0].data.a).toBe(1);
      expect(actions[1].data.b).toBe(2);
    });

    it('should clear all actions', () => {
      offlineQueue.store('POST', '/api/test', { data: 1 });
      offlineQueue.store('PUT', '/api/test', { data: 2 });

      expect(offlineQueue.getAll()).toHaveLength(2);
      offlineQueue.clear();
      expect(offlineQueue.getAll()).toHaveLength(0);
    });

    it('should include timestamp', () => {
      const before = new Date().toISOString();
      offlineQueue.store('POST', '/api/certificates', { test: 1 });
      const after = new Date().toISOString();

      const actions = offlineQueue.getAll();
      const timestamp = actions[0].timestamp;

      expect(timestamp).toBeTruthy();
      expect(timestamp >= before).toBe(true);
      expect(timestamp <= after).toBe(true);
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist to localStorage', () => {
      offlineQueue.store('POST', '/api/test', { data: 123 });

      const stored = localStorage.getItem('offline_actions');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].data.data).toBe(123);
    });

    it('should load from localStorage', () => {
      const actions = [
        {
          method: 'POST',
          url: '/api/test',
          data: { value: 'test' },
          timestamp: new Date().toISOString()
        }
      ];

      localStorage.setItem('offline_actions', JSON.stringify(actions));

      const loaded = offlineQueue.getAll();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].data.value).toBe('test');
    });

    it('should handle corrupted data', () => {
      localStorage.setItem('offline_actions', 'invalid-json{{{');

      const actions = offlineQueue.getAll();
      expect(actions).toEqual([]);
    });

    it('should handle missing data', () => {
      localStorage.removeItem('offline_actions');

      const actions = offlineQueue.getAll();
      expect(actions).toEqual([]);
    });
  });

  describe('Data Types', () => {
    it('should handle complex objects', () => {
      const complexData = {
        farmName: 'Test',
        nested: { deep: { value: 123 } },
        array: [1, 2, 3]
      };

      offlineQueue.store('POST', '/api/test', complexData);

      const actions = offlineQueue.getAll();
      expect(actions[0].data).toEqual(complexData);
      expect(actions[0].data.nested.deep.value).toBe(123);
    });

    it('should handle null data', () => {
      offlineQueue.store('DELETE', '/api/test', null);

      const actions = offlineQueue.getAll();
      expect(actions[0].data).toBeNull();
    });

    it('should handle undefined data', () => {
      offlineQueue.store('GET', '/api/test', undefined);

      const actions = offlineQueue.getAll();
      expect(actions[0].data).toBeUndefined();
    });

    it('should handle empty string', () => {
      offlineQueue.store('POST', '/api/test', '');

      const actions = offlineQueue.getAll();
      expect(actions[0].data).toBe('');
    });
  });

  describe('Queue Order', () => {
    it('should maintain FIFO order', () => {
      offlineQueue.store('POST', '/api/1', { order: 1 });
      offlineQueue.store('POST', '/api/2', { order: 2 });
      offlineQueue.store('POST', '/api/3', { order: 3 });

      const actions = offlineQueue.getAll();
      expect(actions[0].data.order).toBe(1);
      expect(actions[1].data.order).toBe(2);
      expect(actions[2].data.order).toBe(3);
    });

    it('should handle large queue', () => {
      for (let i = 0; i < 50; i++) {
        offlineQueue.store('POST', `/api/test/${i}`, { index: i });
      }

      const actions = offlineQueue.getAll();
      expect(actions).toHaveLength(50);
      expect(actions[0].data.index).toBe(0);
      expect(actions[49].data.index).toBe(49);
    });
  });

  describe('Sync', () => {
    it('should return 0 for empty queue', async () => {
      const synced = await offlineQueue.sync();
      expect(synced).toBe(0);
    });
  });
});
