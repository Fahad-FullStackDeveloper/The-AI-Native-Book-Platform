import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';

function Root({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default Root;
