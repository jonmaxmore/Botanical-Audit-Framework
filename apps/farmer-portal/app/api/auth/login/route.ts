import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/roles';

// Mock user database
const mockUsers = [
  {
    id: '1',
    email: 'farmer@test.com',
    password: 'password123',
    name: 'สมชาย ใจดี',
    role: UserRole.FARMER,
    farmerId: 'F001',
    phone: '081-234-5678',
    avatar: '',
    createdAt: new Date('2025-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '2',
    email: 'reviewer@test.com',
    password: 'password123',
    name: 'สมหญิง รักษ์ดี',
    role: UserRole.REVIEWER,
    phone: '082-345-6789',
    avatar: '',
    createdAt: new Date('2025-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '3',
    email: 'inspector@test.com',
    password: 'password123',
    name: 'สมศักดิ์ ตรวจสอบ',
    role: UserRole.INSPECTOR,
    phone: '083-456-7890',
    avatar: '',
    createdAt: new Date('2025-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '4',
    email: 'approver@test.com',
    password: 'password123',
    name: 'สมหมาย อนุมัติ',
    role: UserRole.APPROVER,
    phone: '084-567-8901',
    avatar: '',
    createdAt: new Date('2025-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '5',
    email: 'admin@test.com',
    password: 'password123',
    name: 'ผู้ดูแลระบบ',
    role: UserRole.ADMIN,
    phone: '085-678-9012',
    avatar: '',
    createdAt: new Date('2025-01-01'),
    lastLogin: new Date(),
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session
    const session = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        farmerId: user.farmerId,
        phone: user.phone,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: new Date(),
      },
      token: `mock-token-${user.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    return NextResponse.json(session);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
