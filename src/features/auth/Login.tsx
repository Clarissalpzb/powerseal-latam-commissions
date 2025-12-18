import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  
  const { login, register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        await register({
          email,
          password,
          full_name: fullName,
          employee_id: employeeId || undefined,
        });
        setIsRegister(false);
        setError('Registration successful! Please wait for manager approval.');
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen freshbooks-bg flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 freshbooks-primary-gradient rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">
              CommissionHub
            </h1>
          </div>
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Streamline your commission management
          </h2>
          <p className="text-lg text-secondary-600 mb-8">
            Track sales commissions, manage payouts, and generate reports with ease. Built for modern sales teams who value efficiency and accuracy.
          </p>
          <div className="space-y-4">
            <div className="flex items-center text-secondary-700">
              <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Automated commission calculations</span>
            </div>
            <div className="flex items-center text-secondary-700">
              <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Smart invoice PDF validation</span>
            </div>
            <div className="flex items-center text-secondary-700">
              <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">Real-time analytics & reporting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 xl:px-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-secondary-100 p-8">
            <div className="text-center mb-8">
              <div className="lg:hidden flex items-center justify-center mb-6">
                <div className="w-10 h-10 freshbooks-primary-gradient rounded-xl flex items-center justify-center mr-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-secondary-900">CommissionHub</h1>
              </div>
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                {isRegister ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-secondary-600">
                {isRegister 
                  ? 'Join the commission management platform' 
                  : 'Sign in to access your commission dashboard'
                }
              </p>
            </div>

            {error && (
              <div className={`mb-6 p-4 rounded-lg border ${
                error.includes('successful') 
                  ? 'bg-success-50 border-success-200 text-success-700' 
                  : 'bg-error-50 border-error-200 text-error-700'
              }`}>
                <div className="flex">
                  <svg className={`w-5 h-5 mr-2 ${error.includes('successful') ? 'text-success-400' : 'text-error-400'}`} fill="currentColor" viewBox="0 0 20 20">
                    {error.includes('successful') ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    )}
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isRegister && (
                <>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-secondary-900 mb-2">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors shadow-sm"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="employeeId" className="block text-sm font-semibold text-secondary-900 mb-2">
                      Employee ID <span className="text-secondary-500 font-normal">(optional)</span>
                    </label>
                    <input
                      id="employeeId"
                      type="text"
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors shadow-sm"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="EMP001"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-secondary-900 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-secondary-900 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  isRegister ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-primary-600 hover:text-primary-500 text-sm font-medium transition-colors"
              >
                {isRegister 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Register"
                }
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-secondary-500 text-xs">
            © 2024 CommissionHub. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;