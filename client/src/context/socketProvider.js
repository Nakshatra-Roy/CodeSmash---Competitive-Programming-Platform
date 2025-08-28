import React, { useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './authContext';
import toast, { Toaster } from 'react-hot-toast';

const SocketContext = React.createContext();

export function useSocket() {
  return useContext(SocketContext);
}

const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
        withCredentials: true,
        autoConnect: false
      });

export const SocketProvider = ({ children }) => {
  const { user, loadUser } = useAuth();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("userFlagged", (data) => {
      toast(data.message);
      loadUser();
    });

    socket.on("accountStatusChanged", (data) => {
      toast(data.message, {
        style: {
            border: '1px solid #ff0000ff',
            padding: '16px',
            color: '#ff0000ff',
        }
        });
      loadUser();
    });

    socket.on("roleChanged", (data) => {
      toast.success(data.message);
      loadUser();
    });

    return () => {
      socket.off("connect");
      socket.off("userFlagged");
      socket.off("accountStatusChanged");
      socket.off("roleChanged");
    };
  }, [loadUser]);
  
  useEffect(() => {
    if (user?._id && !socket.connected) {
      socket.auth = { userId: user._id };
      socket.connect();
    }
  }, [user?._id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};