import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setAuth, clearAuth, setLoading } from '@/store/slices/authSlice';

// Mock user for testing - Roberto can view both roles
const mockUsers = [
  {
    id: '1',
    email: 'roberto.cosio@company.com',
    full_name: 'Roberto Cosio',
    role: 'salesperson' as const,
    commission_rate: 0.03,
    employee_id: 'EMP001',
    is_active: true,
    is_approved: true,
    created_at: '2024-01-15T10:00:00Z',
  }
];

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  const login = async (email: string, _password: string) => {
    dispatch(setLoading(true));
    
    try {
      // Mock authentication - accept any password for test users
      const mockUser = mockUsers.find(u => u.email === email);
      
      if (!mockUser) {
        throw new Error('Invalid credentials - user not found');
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockToken = 'mock-jwt-token-' + mockUser.id;
      dispatch(setAuth({ user: mockUser, token: mockToken }));
      
      return { user: mockUser, token: mockToken };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (_userData: {
    email: string;
    password: string;
    full_name: string;
    employee_id?: string;
  }) => {
    dispatch(setLoading(true));
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock registration success
      return { message: 'Registration successful! Please wait for manager approval.' };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    dispatch(clearAuth());
  };

  const checkAuth = async () => {
    if (!token) return false;
    
    try {
      // Mock token validation
      const userId = token.replace('mock-jwt-token-', '');
      const user = mockUsers.find(u => u.id === userId);
      
      if (!user) {
        dispatch(clearAuth());
        return false;
      }
      
      dispatch(setAuth({ user, token }));
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch(clearAuth());
      return false;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };
};