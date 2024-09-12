import { useAdminPageNavigator } from '@/hooks/useAdminPageNavigator'
import { selectAccessToken } from '@/modules/auth/slices/authSlice'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
interface AuthGuardProps extends React.HTMLAttributes<HTMLDivElement> {}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const accessToken = useSelector(selectAccessToken)
  const { goToLogin } = useAdminPageNavigator()

  useEffect(() => {
    if (!accessToken) {
      goToLogin().catch((error) => {
        throw error
      })
    }
  }, [accessToken])

  if (!accessToken) {
    return
  }

  return children
}

export default AuthGuard
