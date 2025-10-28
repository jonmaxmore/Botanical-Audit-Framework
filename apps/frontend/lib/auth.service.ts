import { User, UserRole } from '../types/user.types';
import { allUsers, userCredentials } from '../data/users.seed';

export class AuthService {
  static login(username: string, password: string): User | null {
    const credential = userCredentials.find(
      c => c.username === username && c.password === password
    );

    if (!credential) {
      return null;
    }

    const user = allUsers.find(u => u.id === credential.userId);

    if (user) {
      // บันทึก last login
      const updatedUser = {
        ...user,
        lastLogin: new Date()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        localStorage.setItem('authToken', this.generateToken(updatedUser));
      }

      return updatedUser;
    }

    return null;
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
  }

  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  static hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  private static generateToken(user: User): string {
    // ในระบบจริงควรใช้ JWT
    return btoa(JSON.stringify({ userId: user.id, role: user.role, timestamp: Date.now() }));
  }

  static verifyToken(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    const token = localStorage.getItem('authToken');
    return !!token;
  }
}
