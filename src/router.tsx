import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import RootLayout from './components/RootLayout'
import AcceptInvitation from './pages/AcceptInvitation'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import OrganizationMembers from './pages/OrganizationMembers'
import Organizations from './pages/Organizations'
import Register from './pages/Register'
import VehicleDetail from './pages/VehicleDetail'
import Vehicles from './pages/Vehicles'

// Las rutas ESTÁTICAS van siempre antes que las de parámetro (`:id`).
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/invitaciones/:token', element: <AcceptInvitation /> },
          {
            element: <AppShell />,
            children: [
              { path: '/organizaciones', element: <Organizations /> },
              { path: '/organizaciones/:id', element: <OrganizationMembers /> },
              { path: '/vehiculos', element: <Vehicles /> },
              { path: '/vehiculos/:id', element: <VehicleDetail /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
