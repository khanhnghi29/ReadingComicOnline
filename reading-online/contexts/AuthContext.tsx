'use client';
import { tokenManager } from '@/app/lib/api';
import { AuthState, UserCreateDto, UserLoginDto, UserResponseDto } from '@/app/types';
import { AuthService } from '@/services/authService';
import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';

// type AuthAction = 
//   | { type: 'SET_LOADING'; payload: boolean }
//   | { type: 'LOGIN_SUCCESS'; payload: { user: UserResponseDto; token: string } }
//   | { type: 'LOGOUT' }
//   | { type: 'INITIALIZE'; payload: { user: UserResponseDto | null; token: string | null } };

// const initialState: AuthState = {
//   user: null,
//   token: null,
//   isLoading: true,
//   isAuthenticated: false,
// };

// function authReducer(state: AuthState, action: AuthAction): AuthState {
//   switch (action.type) {
//     case 'SET_LOADING':
//       return { ...state, isLoading: action.payload };
    
//     case 'LOGIN_SUCCESS':
//       return {
//         ...state,
//         user: action.payload.user,
//         token: action.payload.token,
//         isAuthenticated: true,
//         isLoading: false,
//       };
    
//     case 'LOGOUT':
//       return {
//         ...initialState,
//         isLoading: false,
//       };
    
//     case 'INITIALIZE':
//       return {
//         ...state,
//         user: action.payload.user,
//         token: action.payload.token,
//         isAuthenticated: action.payload.user !== null,
//         isLoading: false,
//       };
    
//     default:
//       return state;
//   }
// }

// interface AuthContextType extends AuthState {
//   login: (credentials: UserLoginDto) => Promise<void>;
//   register: (userData: UserCreateDto) => Promise<void>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [state, dispatch] = useReducer(authReducer, initialState);

//   useEffect(() => {
//     // Initialize auth state from localStorage
//     const token = tokenManager.getToken();
//     const user = AuthService.getCurrentUser();
    
//     dispatch({ 
//       type: 'INITIALIZE', 
//       payload: { user, token } 
//     });
//   }, []);

//   const login = async (credentials: UserLoginDto) => {
//     try {
//       dispatch({ type: 'SET_LOADING', payload: true });
      
//       const response = await AuthService.login(credentials);
//       const user = AuthService.getCurrentUser();
      
//       if (user) {
//         dispatch({ 
//           type: 'LOGIN_SUCCESS', 
//           payload: { user, token: response.token } 
//         });
//       }
//     } catch (error) {
//       dispatch({ type: 'SET_LOADING', payload: false });
//       throw error;
//     }
//   };

//   const register = async (userData: UserCreateDto) => {
//     dispatch({ type: 'SET_LOADING', payload: true });
//     try {
//       await AuthService.register(userData);
//     } finally {
//       dispatch({ type: 'SET_LOADING', payload: false });
//     }
//   };

//   const logout = () => {
//     AuthService.logout();
//     dispatch({ type: 'LOGOUT' });
//   };

//   return (
//     <AuthContext.Provider value={{
//       ...state,
//       login,
//       register,
//       logout,
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: UserResponseDto; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'INITIALIZE'; payload: { user: UserResponseDto | null; token: string | null } };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'INITIALIZE':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: action.payload.user !== null,
        isLoading: false,
      };
    
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (credentials: UserLoginDto) => Promise<void>;
  register: (userData: UserCreateDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    const initializeAuth = () => {
      try {
        const token = tokenManager.getToken();
        const user = AuthService.getCurrentUser();
        
        console.log('🔄 Initializing auth state:', { token: !!token, user }); // Debug log
        
        dispatch({ 
          type: 'INITIALIZE', 
          payload: { user, token } 
        });
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        dispatch({ 
          type: 'INITIALIZE', 
          payload: { user: null, token: null } 
        });
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, []);

  // Listen for storage changes (for multiple tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        console.log('🔄 Storage changed, reinitializing auth');
        const user = AuthService.getCurrentUser();
        dispatch({ 
          type: 'INITIALIZE', 
          payload: { user, token: e.newValue } 
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const login = async (credentials: UserLoginDto) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await AuthService.login(credentials);
      const user = AuthService.getCurrentUser();
      
      console.log('✅ Login successful:', { user }); // Debug log
      
      if (user) {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user, token: response.token } 
        });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (userData: UserCreateDto) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await AuthService.register(userData);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    AuthService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};