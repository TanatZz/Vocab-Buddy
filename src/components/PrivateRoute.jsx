import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function PrivateRoute({ children, showLogin }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      if (showLogin) showLogin();
    }
  }, [user, loading, showLogin]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? children : null;
}
