import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import RootLayout from './components/RootLayout'
import AcceptInvitation from './pages/AcceptInvitation'
import Billing from './pages/Billing'
import DocumentsList from './pages/DocumentsList'
import FuelList from './pages/FuelList'
import Home from './pages/Home'
import Login from './pages/Login'
import MaintenanceDetail from './pages/MaintenanceDetail'
import MaintenanceList from './pages/MaintenanceList'
import Notifications from './pages/Notifications'
import NotFound from './pages/NotFound'
import OrganizationMembers from './pages/OrganizationMembers'
import Organizations from './pages/Organizations'
import Register from './pages/Register'
import Reminders from './pages/Reminders'
import Reports from './pages/Reports'
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
              { path: '/facturacion', element: <Billing /> },
              { path: '/notificaciones', element: <Notifications /> },
              { path: '/recordatorios', element: <Reminders /> },
              { path: '/reportes', element: <Reports /> },
              { path: '/vehiculos/:id', element: <VehicleDetail /> },
              { path: '/vehiculos/:vehicleId/mantenimiento', element: <MaintenanceList /> },
              { path: '/vehiculos/:vehicleId/combustible', element: <FuelList /> },
              { path: '/vehiculos/:vehicleId/documentos', element: <DocumentsList /> },
              { path: '/mantenimiento/:recordId', element: <MaintenanceDetail /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
