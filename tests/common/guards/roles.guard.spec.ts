import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserRole } from '../../../src/common/enums/user-role.enum.js'
import { RolesGuard } from '../../../src/common/guards/roles.guard.js'

describe('RolesGuard', () => {
    const getAllAndOverride = vi.fn()
    const reflector = { getAllAndOverride } as unknown as Reflector
    const guard = new RolesGuard(reflector)

    const contextFor = (user?: { role: UserRole }) =>
        ({
            getHandler: () => 'handler',
            getClass: () => 'class',
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
        }) as unknown as ExecutionContext

    beforeEach(() => {
        getAllAndOverride.mockReset()
    })

    it('allows a route that does not declare a role', () => {
        getAllAndOverride.mockReturnValue(undefined)

        expect(guard.canActivate(contextFor())).toBe(true)
    })

    it('allows a route whose role list is empty', () => {
        getAllAndOverride.mockReturnValue([])

        expect(guard.canActivate(contextFor())).toBe(true)
    })

    it('allows an admin to call an admin route', () => {
        getAllAndOverride.mockReturnValue([UserRole.ADMIN])

        expect(
            guard.canActivate(contextFor({ role: UserRole.ADMIN })),
        ).toBe(true)
    })

    it('allows an employee to call a route open to employees', () => {
        getAllAndOverride.mockReturnValue([UserRole.EMPLOYEE, UserRole.ADMIN])

        expect(
            guard.canActivate(contextFor({ role: UserRole.EMPLOYEE })),
        ).toBe(true)
    })

    it('rejects an employee on an admin-only route', () => {
        getAllAndOverride.mockReturnValue([UserRole.ADMIN])

        expect(() =>
            guard.canActivate(contextFor({ role: UserRole.EMPLOYEE })),
        ).toThrow(ForbiddenException)
    })

    it('rejects a request that has no authenticated user', () => {
        getAllAndOverride.mockReturnValue([UserRole.ADMIN])

        expect(() => guard.canActivate(contextFor())).toThrow(
            ForbiddenException,
        )
    })
})
