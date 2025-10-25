/**
 * Tests for Mock Data Generator
 * Testing utility functions for dashboard data generation
 */

import {
  generateApplicationStats,
  generateDailyStats,
  formatNumber,
  calculateChange,
  generateKPIData,
  type ApplicationStats,
  type DailyStats,
  type KPIData,
} from '../mock-data';

describe('formatNumber', () => {
  it('should format number with Thai locale', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle negative numbers', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
  });

  it('should handle single digit numbers', () => {
    expect(formatNumber(5)).toBe('5');
  });

  it('should handle decimal numbers', () => {
    const result = formatNumber(1234.56);
    expect(result).toContain('1,234');
  });
});

describe('calculateChange', () => {
  it('should calculate positive percentage change', () => {
    expect(calculateChange(150, 100)).toBe(50);
  });

  it('should calculate negative percentage change', () => {
    expect(calculateChange(75, 100)).toBe(-25);
  });

  it('should return 0 when previous is 0', () => {
    expect(calculateChange(100, 0)).toBe(0);
  });

  it('should return 0 when no change', () => {
    expect(calculateChange(100, 100)).toBe(0);
  });

  it('should handle decimal results', () => {
    expect(calculateChange(105, 100)).toBe(5);
  });

  it('should calculate 100% increase', () => {
    expect(calculateChange(200, 100)).toBe(100);
  });

  it('should calculate 100% decrease', () => {
    expect(calculateChange(0, 100)).toBe(-100);
  });
});

describe('generateApplicationStats', () => {
  it('should generate application stats with all required fields', () => {
    const stats = generateApplicationStats();
    
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('pending');
    expect(stats).toHaveProperty('approved');
    expect(stats).toHaveProperty('rejected');
    expect(stats).toHaveProperty('reviewing');
  });

  it('should generate positive numbers', () => {
    const stats = generateApplicationStats();
    
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.pending).toBeGreaterThan(0);
    expect(stats.approved).toBeGreaterThan(0);
    expect(stats.rejected).toBeGreaterThan(0);
    expect(stats.reviewing).toBeGreaterThan(0);
  });

  it('should have total equal to sum of all statuses', () => {
    const stats = generateApplicationStats();
    const sum = stats.pending + stats.approved + stats.rejected + stats.reviewing;
    
    expect(stats.total).toBe(sum);
  });

  it('should generate numbers within expected ranges', () => {
    const stats = generateApplicationStats();
    
    // Based on randomInRange calls in implementation
    expect(stats.pending).toBeGreaterThanOrEqual(25);
    expect(stats.pending).toBeLessThanOrEqual(40);
    
    expect(stats.approved).toBeGreaterThanOrEqual(40);
    expect(stats.approved).toBeLessThanOrEqual(60);
    
    expect(stats.rejected).toBeGreaterThanOrEqual(5);
    expect(stats.rejected).toBeLessThanOrEqual(15);
    
    expect(stats.reviewing).toBeGreaterThanOrEqual(10);
    expect(stats.reviewing).toBeLessThanOrEqual(20);
  });

  it('should generate different values on multiple calls', () => {
    const stats1 = generateApplicationStats();
    const stats2 = generateApplicationStats();
    const stats3 = generateApplicationStats();
    
    // At least one call should produce different results
    const allSame = 
      stats1.pending === stats2.pending && stats2.pending === stats3.pending &&
      stats1.approved === stats2.approved && stats2.approved === stats3.approved;
    
    expect(allSame).toBe(false);
  });
});

describe('generateDailyStats', () => {
  it('should generate stats for 7 days', () => {
    const stats = generateDailyStats();
    expect(stats).toHaveLength(7);
  });

  it('should include Thai day names', () => {
    const stats = generateDailyStats();
    const thaiDays = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
    
    stats.forEach((stat, index) => {
      expect(stat.date).toBe(thaiDays[index]);
    });
  });

  it('should have all required fields for each day', () => {
    const stats = generateDailyStats();
    
    stats.forEach(stat => {
      expect(stat).toHaveProperty('date');
      expect(stat).toHaveProperty('newApplications');
      expect(stat).toHaveProperty('approved');
      expect(stat).toHaveProperty('rejected');
    });
  });

  it('should generate positive numbers for all metrics', () => {
    const stats = generateDailyStats();
    
    stats.forEach(stat => {
      expect(stat.newApplications).toBeGreaterThan(0);
      expect(stat.approved).toBeGreaterThan(0);
      expect(stat.rejected).toBeGreaterThan(0);
    });
  });

  it('should generate numbers within expected ranges', () => {
    const stats = generateDailyStats();
    
    stats.forEach(stat => {
      // Based on randomInRange calls
      expect(stat.newApplications).toBeGreaterThanOrEqual(8);
      expect(stat.newApplications).toBeLessThanOrEqual(25);
      
      expect(stat.approved).toBeGreaterThanOrEqual(5);
      expect(stat.approved).toBeLessThanOrEqual(18);
      
      expect(stat.rejected).toBeGreaterThanOrEqual(1);
      expect(stat.rejected).toBeLessThanOrEqual(5);
    });
  });

  it('should maintain consistent day order', () => {
    const stats1 = generateDailyStats();
    const stats2 = generateDailyStats();
    
    expect(stats1.map(s => s.date)).toEqual(stats2.map(s => s.date));
  });
});

describe('generateKPIData', () => {
  it('should generate KPI data with all required fields', () => {
    const kpi = generateKPIData();
    
    expect(kpi).toHaveProperty('total');
    expect(kpi).toHaveProperty('pending');
    expect(kpi).toHaveProperty('approved');
    expect(kpi).toHaveProperty('revenue');
    expect(kpi).toHaveProperty('totalChange');
    expect(kpi).toHaveProperty('pendingChange');
    expect(kpi).toHaveProperty('approvedChange');
    expect(kpi).toHaveProperty('revenueChange');
  });

  it('should generate positive numbers for metrics', () => {
    const kpi = generateKPIData();
    
    expect(kpi.total).toBeGreaterThan(0);
    expect(kpi.pending).toBeGreaterThan(0);
    expect(kpi.approved).toBeGreaterThan(0);
  });

  it('should format revenue as Thai Baht string', () => {
    const kpi = generateKPIData();
    
    expect(kpi.revenue).toMatch(/^฿[\d,]+$/);
  });

  it('should generate numbers within expected ranges', () => {
    const kpi = generateKPIData();
    
    expect(kpi.total).toBeGreaterThanOrEqual(80);
    expect(kpi.total).toBeLessThanOrEqual(120);
    
    expect(kpi.pending).toBeGreaterThanOrEqual(25);
    expect(kpi.pending).toBeLessThanOrEqual(40);
    
    expect(kpi.approved).toBeGreaterThanOrEqual(15);
    expect(kpi.approved).toBeLessThanOrEqual(25);
  });

  it('should generate change values as decimals', () => {
    const kpi = generateKPIData();
    
    // Change values should be decimals (divided by 10)
    expect(Math.abs(kpi.totalChange)).toBeLessThanOrEqual(2);
    expect(Math.abs(kpi.pendingChange)).toBeLessThanOrEqual(1);
    expect(Math.abs(kpi.approvedChange)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(kpi.revenueChange)).toBeLessThanOrEqual(2);
  });

  it('should generate different values on multiple calls', () => {
    const kpi1 = generateKPIData();
    const kpi2 = generateKPIData();
    const kpi3 = generateKPIData();
    
    // At least one call should produce different results
    const allSame = 
      kpi1.total === kpi2.total && kpi2.total === kpi3.total &&
      kpi1.revenue === kpi2.revenue && kpi2.revenue === kpi3.revenue;
    
    expect(allSame).toBe(false);
  });

  it('should allow negative change values for totalChange and pendingChange', () => {
    // Run multiple times to check for negative values
    let foundNegative = false;
    
    for (let i = 0; i < 50; i++) {
      const kpi = generateKPIData();
      if (kpi.totalChange < 0 || kpi.pendingChange < 0) {
        foundNegative = true;
        break;
      }
    }
    
    // This test might occasionally fail due to randomness, but it's unlikely
    expect(foundNegative).toBe(true);
  });

  it('should only generate positive change for approvedChange and revenueChange', () => {
    // Run multiple times to verify they're always positive
    for (let i = 0; i < 20; i++) {
      const kpi = generateKPIData();
      expect(kpi.approvedChange).toBeGreaterThanOrEqual(0);
      expect(kpi.revenueChange).toBeGreaterThanOrEqual(0.5);
    }
  });
});
