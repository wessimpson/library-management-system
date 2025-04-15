import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../../utils/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return isAuthenticated && isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;