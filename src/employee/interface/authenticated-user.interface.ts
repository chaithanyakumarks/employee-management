import { UserRole } from '../../common/enums/user-role.enum.js';

export interface AuthenticatedUser {
    email: string;
    userId: number;
    role: UserRole;
}