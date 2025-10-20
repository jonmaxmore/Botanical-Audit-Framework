/**
 * Password Policy Service
 *
 * Implements comprehensive password security with:
 * - Complexity requirements
 * - Password strength checking
 * - Password history
 * - Password expiration
 * - Common password blocking
 * - Breach detection
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  minSpecialChars: number;
  preventReuse: number; // Number of old passwords to check
  expirationDays: number; // Days until password expires
  preventCommonPasswords: boolean;
  preventUserInfo: boolean; // Prevent password containing user info
}

export interface PasswordStrength {
  score: number; // 0-4 (very weak to very strong)
  feedback: string[];
  meetsPolicy: boolean;
  estimatedCrackTime: string;
}

export class PasswordPolicyService {
  private policy: PasswordPolicy;
  private commonPasswords: Set<string>;

  constructor(policy?: Partial<PasswordPolicy>) {
    this.policy = {
      minLength: policy?.minLength ?? 8,
      maxLength: policy?.maxLength ?? 128,
      requireLowercase: policy?.requireLowercase ?? true,
      requireUppercase: policy?.requireUppercase ?? true,
      requireNumbers: policy?.requireNumbers ?? true,
      requireSpecialChars: policy?.requireSpecialChars ?? true,
      minSpecialChars: policy?.minSpecialChars ?? 1,
      preventReuse: policy?.preventReuse ?? 5,
      expirationDays: policy?.expirationDays ?? 90,
      preventCommonPasswords: policy?.preventCommonPasswords ?? true,
      preventUserInfo: policy?.preventUserInfo ?? true,
    };

    this.commonPasswords = this.loadCommonPasswords();
  }

  /**
   * Load common weak passwords list
   */
  private loadCommonPasswords(): Set<string> {
    // Top 100 most common passwords
    const common = [
      '123456',
      'password',
      '123456789',
      '12345678',
      '12345',
      '1234567',
      '1234567890',
      'qwerty',
      'abc123',
      '111111',
      '123123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      'dragon',
      'master',
      'sunshine',
      'princess',
      'football',
      'qwerty123',
      '1q2w3e4r',
      'baseball',
      'iloveyou',
      'trustno1',
      '1234',
      'starwars',
      'password1',
      'password123',
      'test',
      'superman',
      'michael',
      'charlie',
      'liverpool',
      'football1',
      'freedom',
      'whatever',
      'secret',
      'shadow',
      'killer',
      'solo',
      'jesus',
      'mustang',
      'hockey',
      'batman',
      'zaq1zaq1',
      'qazwsx',
      'passw0rd',
      'login',
      'hello',
      // Thai common passwords
      'รหัสผ่าน',
      '1234567890',
      'password',
      'admin123',
      'test1234',
      'user1234',
      'welcome1',
      'changeme',
    ];

    return new Set(common.map(p => p.toLowerCase()));
  }

  /**
   * Validate password against policy
   */
  validatePassword(
    password: string,
    userInfo?: {
      email?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
    },
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check length
    if (password.length < this.policy.minLength) {
      errors.push(`Password must be at least ${this.policy.minLength} characters`);
    }

    if (password.length > this.policy.maxLength) {
      errors.push(`Password must not exceed ${this.policy.maxLength} characters`);
    }

    // Check character requirements
    if (this.policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.policy.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.policy.requireSpecialChars) {
      const specialChars = password.match(/[^a-zA-Z0-9]/g);
      const count = specialChars ? specialChars.length : 0;

      if (count < this.policy.minSpecialChars) {
        errors.push(
          `Password must contain at least ${this.policy.minSpecialChars} special character(s)`,
        );
      }
    }

    // Check common passwords
    if (this.policy.preventCommonPasswords) {
      if (this.commonPasswords.has(password.toLowerCase())) {
        errors.push('Password is too common. Please choose a stronger password');
      }
    }

    // Check user info
    if (this.policy.preventUserInfo && userInfo) {
      const lowerPassword = password.toLowerCase();
      const checks = [
        userInfo.email?.split('@')[0],
        userInfo.firstName,
        userInfo.lastName,
        userInfo.username,
      ];

      for (const check of checks) {
        if (check && check.length >= 3 && lowerPassword.includes(check.toLowerCase())) {
          errors.push('Password should not contain personal information');
          break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate password strength
   */
  calculateStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    // Length scoring
    if (password.length >= 12) score += 2;
    else if (password.length >= 10) score += 1;
    else if (password.length >= 8) score += 0.5;
    else feedback.push('Password is too short');

    // Character variety scoring
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    const variety = [hasLower, hasUpper, hasNumbers, hasSpecial].filter(Boolean).length;
    score += variety * 0.5;

    if (variety < 3) {
      feedback.push('Use a mix of letters, numbers, and symbols');
    }

    // Entropy scoring
    const entropy = this.calculateEntropy(password);
    if (entropy >= 60) score += 1;
    else if (entropy >= 40) score += 0.5;

    // Penalties
    if (this.hasSequentialChars(password)) {
      score -= 0.5;
      feedback.push('Avoid sequential characters');
    }

    if (this.hasRepeatedChars(password)) {
      score -= 0.5;
      feedback.push('Avoid repeated characters');
    }

    if (this.commonPasswords.has(password.toLowerCase())) {
      score = 0;
      feedback.push('This is a commonly used password');
    }

    // Normalize score to 0-4
    score = Math.max(0, Math.min(4, Math.round(score)));

    // Check if meets policy
    const { valid } = this.validatePassword(password);

    // Estimate crack time
    const crackTime = this.estimateCrackTime(password, entropy);

    return {
      score,
      feedback,
      meetsPolicy: valid,
      estimatedCrackTime: crackTime,
    };
  }

  /**
   * Calculate password entropy
   */
  private calculateEntropy(password: string): number {
    let poolSize = 0;

    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/[0-9]/.test(password)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

    return Math.log2(Math.pow(poolSize, password.length));
  }

  /**
   * Check for sequential characters
   */
  private hasSequentialChars(password: string): boolean {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      '0123456789',
      'qwertyuiop',
      'asdfghjkl',
      'zxcvbnm',
    ];

    for (const seq of sequences) {
      for (let i = 0; i < seq.length - 2; i++) {
        const substring = seq.substring(i, i + 3);
        if (password.toLowerCase().includes(substring)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check for repeated characters
   */
  private hasRepeatedChars(password: string): boolean {
    return /(.)\1{2,}/.test(password);
  }

  /**
   * Estimate time to crack password
   */
  private estimateCrackTime(password: string, entropy: number): string {
    // Assuming 1 billion guesses per second
    const guessesPerSecond = 1e9;
    const possibleCombinations = Math.pow(2, entropy);
    const seconds = possibleCombinations / (2 * guessesPerSecond);

    if (seconds < 1) return 'Instantly';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;

    const years = seconds / 31536000;
    if (years < 1000) return `${Math.round(years)} years`;
    if (years < 1000000) return `${Math.round(years / 1000)}k years`;
    if (years < 1000000000) return `${Math.round(years / 1000000)}M years`;

    return 'Centuries';
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Check if password was used before
   */
  async checkPasswordReuse(password: string, previousHashes: string[]): Promise<boolean> {
    const recentHashes = previousHashes.slice(0, this.policy.preventReuse);

    for (const hash of recentHashes) {
      if (await this.verifyPassword(password, hash)) {
        return true; // Password was reused
      }
    }

    return false;
  }

  /**
   * Check if password is expired
   */
  isPasswordExpired(lastChangedDate: Date): boolean {
    if (this.policy.expirationDays === 0) {
      return false;
    }

    const daysSinceChange = Math.floor(
      (Date.now() - lastChangedDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return daysSinceChange >= this.policy.expirationDays;
  }

  /**
   * Get days until password expires
   */
  getDaysUntilExpiration(lastChangedDate: Date): number {
    if (this.policy.expirationDays === 0) {
      return Infinity;
    }

    const daysSinceChange = Math.floor(
      (Date.now() - lastChangedDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    return Math.max(0, this.policy.expirationDays - daysSinceChange);
  }

  /**
   * Generate secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const all = lowercase + uppercase + numbers + special;
    let password = '';

    // Ensure at least one of each required type
    password += lowercase[crypto.randomInt(lowercase.length)];
    password += uppercase[crypto.randomInt(uppercase.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += special[crypto.randomInt(special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += all[crypto.randomInt(all.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => crypto.randomInt(3) - 1)
      .join('');
  }

  /**
   * Check password against haveibeenpwned API
   */
  async checkBreachedPassword(password: string): Promise<{
    breached: boolean;
    count: number;
  }> {
    try {
      // Hash password with SHA-1
      const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();

      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);

      // Query haveibeenpwned API
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);

      if (!response.ok) {
        console.warn('Failed to check breached password');
        return { breached: false, count: 0 };
      }

      const text = await response.text();
      const hashes = text.split('\n');

      for (const line of hashes) {
        const [hashSuffix, countStr] = line.split(':');
        if (hashSuffix === suffix) {
          return {
            breached: true,
            count: parseInt(countStr.trim()),
          };
        }
      }

      return { breached: false, count: 0 };
    } catch (error) {
      console.error('Error checking breached password:', error);
      return { breached: false, count: 0 };
    }
  }

  /**
   * Get policy summary
   */
  getPolicySummary(): string[] {
    const summary: string[] = [];

    summary.push(`Password must be ${this.policy.minLength}-${this.policy.maxLength} characters`);

    const requirements: string[] = [];
    if (this.policy.requireLowercase) requirements.push('lowercase letters');
    if (this.policy.requireUppercase) requirements.push('uppercase letters');
    if (this.policy.requireNumbers) requirements.push('numbers');
    if (this.policy.requireSpecialChars) {
      requirements.push(`${this.policy.minSpecialChars} special character(s)`);
    }

    if (requirements.length > 0) {
      summary.push(`Must contain: ${requirements.join(', ')}`);
    }

    if (this.policy.preventReuse > 0) {
      summary.push(`Cannot reuse last ${this.policy.preventReuse} passwords`);
    }

    if (this.policy.expirationDays > 0) {
      summary.push(`Password expires every ${this.policy.expirationDays} days`);
    }

    if (this.policy.preventCommonPasswords) {
      summary.push('Cannot use common passwords');
    }

    if (this.policy.preventUserInfo) {
      summary.push('Cannot contain personal information');
    }

    return summary;
  }
}

// Export singleton with default policy
export const passwordPolicy = new PasswordPolicyService();

// Predefined policies
export const PasswordPolicies = {
  /**
   * Strong policy (recommended for production)
   */
  STRONG: new PasswordPolicyService({
    minLength: 12,
    maxLength: 128,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minSpecialChars: 2,
    preventReuse: 10,
    expirationDays: 90,
    preventCommonPasswords: true,
    preventUserInfo: true,
  }),

  /**
   * Medium policy (balanced)
   */
  MEDIUM: new PasswordPolicyService({
    minLength: 10,
    maxLength: 128,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    minSpecialChars: 1,
    preventReuse: 5,
    expirationDays: 180,
    preventCommonPasswords: true,
    preventUserInfo: true,
  }),

  /**
   * Basic policy (minimum security)
   */
  BASIC: new PasswordPolicyService({
    minLength: 8,
    maxLength: 128,
    requireLowercase: true,
    requireUppercase: false,
    requireNumbers: true,
    requireSpecialChars: false,
    minSpecialChars: 0,
    preventReuse: 3,
    expirationDays: 0,
    preventCommonPasswords: true,
    preventUserInfo: false,
  }),
};

// Example usage:
/*
// Validate password
const result = passwordPolicy.validatePassword('MyP@ssw0rd123', {
  email: 'user@example.com',
  firstName: 'John'
});

if (!result.valid) {
  console.log('Errors:', result.errors);
}

// Check strength
const strength = passwordPolicy.calculateStrength('MyP@ssw0rd123');
console.log('Score:', strength.score);
console.log('Feedback:', strength.feedback);
console.log('Crack time:', strength.estimatedCrackTime);

// Hash password
const hash = await passwordPolicy.hashPassword('MyP@ssw0rd123');

// Verify password
const isValid = await passwordPolicy.verifyPassword('MyP@ssw0rd123', hash);

// Check for breaches
const breach = await passwordPolicy.checkBreachedPassword('password123');
if (breach.breached) {
  console.log(`Password found in ${breach.count} data breaches!`);
}

// Generate secure password
const newPassword = passwordPolicy.generateSecurePassword(16);
*/
