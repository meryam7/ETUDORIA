import React, { createContext, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const register = async (email, password, userType, formData) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/register/${userType.toLowerCase()}`, formData);
      const { userId, token } = response.data;
      setUser({ email, userType, userId, ...formData });
      localStorage.setItem('token', token);
      return token;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const login = async (email, userType, userData, token) => {
    setUser({ email, userType, ...userData });
    localStorage.setItem('token', token);
  };

  return (
    <AuthContext.Provider value={{ user, register, login }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};