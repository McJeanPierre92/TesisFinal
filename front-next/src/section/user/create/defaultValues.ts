import { UserCreate } from '@/modules/user/domain/userCreate'

export const DEFAULT_VALUES: UserCreate = {
  name: '',
  userName: '',
  password: '',
  roleId: 0,
  state: false,
}
