import { TokenPayload } from './token'

export function canAccessFilial(user: TokenPayload | undefined, filialId: string): boolean {
  return user?.role === 'MASTER' || (user?.role === 'FILIAL' && user.filialId === filialId)
}

export function canManageOwnUser(user: TokenPayload | undefined, userId: string): boolean {
  return user?.userId === userId || user?.role === 'MASTER'
}
