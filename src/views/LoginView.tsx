import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Building2, ArrowRight } from 'lucide-react';
import { AppSettings } from '../types';

interface LoginViewProps {
  onLoginSuccess: () => void;
  settings: AppSettings;
}

export function LoginView({ onLoginSuccess, settings }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    // Validate against settings
    if (
      username.trim() === settings.adminUsername &&
      password === settings.adminPassword
    ) {
      onLoginSuccess();
    } else {
      setErrorMessage('Invalid username or password. Please try again.');
    }
  };

  const handleQuickDemoLogin = () => {
    setUsername(settings.adminUsername);
    setPassword(settings.adminPassword);
    setErrorMessage('');
  };

  return (
    <div
      id="login-page"
      className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12"
    >
      <div className="w-full max-w-md">
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-md mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {settings.companyName || 'Staff Attendance'}
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Admin Attendance Management Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Administrator Sign In
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter your admin credentials to access attendance records.
          </p>

          {errorMessage && (
            <div
              id="login-error-alert"
              className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-11 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  autoComplete="current-password"
                  required
                />
                <button
                  id="toggle-password-visibility-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-xs"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Assist */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center">
            <p className="text-xs text-slate-500 mb-2">
              Default credentials: <span className="font-mono text-slate-700 font-semibold">{settings.adminUsername}</span> / <span className="font-mono text-slate-700 font-semibold">{settings.adminPassword}</span>
            </p>
            <button
              id="quick-demo-fill-btn"
              type="button"
              onClick={handleQuickDemoLogin}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-all"
            >
              Fill Demo Credentials
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Staff Attendance Management System • Secure Session Access
        </p>
      </div>
    </div>
  );
}
