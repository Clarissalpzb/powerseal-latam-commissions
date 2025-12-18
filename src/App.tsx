import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { toggleRole } from '@/store/slices/authSlice';
import Login from '@/features/auth/Login';
import SalespersonDashboard from '@/features/salesperson/Dashboard';
import ManagerDashboard from '@/features/manager/Dashboard';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'manager' ? '/manager' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}


// Testing Toggle Component
function TestingHeader() {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="bg-accent-100 border-b border-accent-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-sm text-accent-800">
          <span className="font-medium">Testing Mode:</span> Currently viewing as {user.role} ({user.full_name})
        </div>
        <button
          onClick={() => dispatch(toggleRole())}
          className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Switch to {user.role === 'salesperson' ? 'Manager' : 'Salesperson'} View
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <TestingHeader />
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to={user?.role === 'manager' ? '/manager' : '/dashboard'} replace /> : 
              <Login />
          } 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="salesperson">
              <SalespersonDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute role="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? (user?.role === 'manager' ? '/manager' : '/dashboard') : '/login'} replace />
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;