import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/login/LoginPage';
import InicioPage from './pages/inicio/InicioPage';
import PacientesPage from './pages/gestion-pacientes/pacientes/PacientesPage';
import CitasPage from './pages/gestion-pacientes/citas/CitasPage';
import PagosPage from './pages/gestion-pacientes/pagos/PagosPage';
import EspecialistasPage from './pages/especialistas/EspecialistasPage';
import MetricasPage from './pages/metricas/MetricasPage';
import NotificacionesPage from './pages/notificaciones/NotificacionesPage';
import ConfiguracionPage from './pages/configuracion/ConfiguracionPage';
import PerfilPage from './pages/perfil/PerfilPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingScreen from './components/LoadingScreen';

const router = createBrowserRouter([
    // Ruta pública — Login
    // Rutas protegidas — Dashboard
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/',
                element: <DashboardLayout />,
                children: [
                    { index: true, element: <InicioPage /> },
                    { path: 'pacientes', element: <PacientesPage /> },
                    { path: 'citas', element: <CitasPage /> },
                    { path: 'pagos', element: <PagosPage /> },
                    { path: 'especialistas', element: <EspecialistasPage /> },
                    { path: 'metricas', element: <MetricasPage /> },
                    { path: 'notificaciones', element: <NotificacionesPage /> },
                    { path: 'configuracion', element: <ConfiguracionPage /> },
                    { path: 'perfil', element: <PerfilPage /> },
                ],
            },
        ],
    },

    // 404 — pantalla completa, sin layout
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);

export default router;
