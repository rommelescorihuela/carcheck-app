import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../stores/auth'

export default function RootLayout() {
  const status = useAuth((state) => state.status)
  const bootstrap = useAuth((state) => state.bootstrap)

  useEffect(() => {
    if (status === 'idle') {
      void bootstrap()
    }
  }, [status, bootstrap])

  return <Outlet />
}
