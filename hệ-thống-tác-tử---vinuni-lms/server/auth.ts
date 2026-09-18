import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { NextFunction, Request, Response } from 'express';
import { readJsonFile, writeJsonFile } from './db';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.resolve(__dirname, '../data/users.json');

export type Role = 'teacher' | 'student';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

function toPublicUser(u: StoredUser): PublicUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

// Tài khoản demo được tạo tự động lần chạy đầu tiên (data/users.json không được commit lên git).
function seedDefaultUsers(): StoredUser[] {
  const users: StoredUser[] = [
    {
      id: 'u-teacher-1',
      name: 'Giảng viên VinUni',
      email: 'giaovien@vinuni.edu.vn',
      passwordHash: bcrypt.hashSync('giaovien123', 10),
      role: 'teacher',
    },
    {
      id: 'u-student-1',
      name: 'Học viên Demo 1',
      email: 'hocsinh1@vinuni.edu.vn',
      passwordHash: bcrypt.hashSync('hocsinh123', 10),
      role: 'student',
    },
    {
      id: 'u-student-2',
      name: 'Học viên Demo 2',
      email: 'hocsinh2@vinuni.edu.vn',
      passwordHash: bcrypt.hashSync('hocsinh123', 10),
      role: 'student',
    },
  ];
  writeJsonFile(USERS_FILE, users);
  return users;
}

export function loadUsers(): StoredUser[] {
  const users = readJsonFile<StoredUser[] | null>(USERS_FILE, null);
  if (!users || users.length === 0) return seedDefaultUsers();
  return users;
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return loadUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function verifyPassword(user: StoredUser, password: string): boolean {
  return bcrypt.compareSync(password, user.passwordHash);
}

export function getCurrentUser(req: Request): PublicUser | null {
  const userId = req.session.userId;
  if (!userId) return null;
  const user = loadUsers().find(u => u.id === userId);
  return user ? toPublicUser(user) : null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!getCurrentUser(req)) {
    res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện thao tác này.' });
    return;
  }
  next();
}

export function requireRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = getCurrentUser(req);
    if (!user) {
      res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện thao tác này.' });
      return;
    }
    if (user.role !== role) {
      res.status(403).json({
        error: `Chỉ ${role === 'teacher' ? 'giáo viên' : 'học viên'} mới có quyền thực hiện thao tác này.`,
      });
      return;
    }
    next();
  };
}

export { toPublicUser };
