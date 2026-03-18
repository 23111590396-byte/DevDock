import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user && token) {
      const s = io(window.location.origin, { auth: { token } });
      setSocket(s);
      return () => { s.disconnect(); setSocket(null); };
    }
  }, [user, token]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() { return useContext(SocketContext); }
export default SocketContext;
