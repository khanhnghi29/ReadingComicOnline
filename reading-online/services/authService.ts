// services/authService.ts
import { apiClient, tokenManager } from "@/app/lib/api";
import { ApiError, LoginResponse, RegisterResponse, UserCreateDto, UserLoginDto, UserResponseDto , JwtPayload, isValidJwtPayload} from "@/app/types";
import { AxiosError, AxiosResponse } from "axios";

// export class AuthService {
//   // Verify connection to backend
//   static async verifyConnection(): Promise<boolean> {
//     try {
//       // Test với một endpoint đơn giản hoặc health check
//       const response = await apiClient.get('/users/test', { timeout: 3000 });
//       return response.status === 200;
//     } catch {
//       return false;
//     }
//   }

//   static async login(credentials: UserLoginDto): Promise<LoginResponse> {
//     try {
//       const response: AxiosResponse<LoginResponse> = await apiClient.post(
//         '/users/login',
//         credentials
//       );
      
//       // Save token to localStorage
//       if (response.data.token) {
//         tokenManager.setToken(response.data.token);
//       }
      
//       return response.data;
//     } catch (error) {
//       if (error instanceof AxiosError) {
//         // Handle 401 Unauthorized
//         if (error.response?.status === 401) {
//           throw new Error(error.response.data?.message || 'Invalid username or password');
//         }
//         // Handle 400 Bad Request (ModelState errors)
//         if (error.response?.status === 400) {
//           const errorData = error.response.data as ApiError;
//           if (errorData.message) {
//             throw new Error(errorData.message);
//           }
//           if (errorData.errors) {
//             const errorMessages = Object.values(errorData.errors).flat();
//             throw new Error(errorMessages.join(', '));
//           }
//         }
//         throw new Error('Login failed');
//       }
//       throw new Error('Network error occurred');
//     }
//   }

//   static async register(userData: UserCreateDto): Promise<RegisterResponse> {
//     try {
//       const response: AxiosResponse<RegisterResponse> = await apiClient.post(
//         '/users/register',
//         userData
//       );
//       return response.data;
//     } catch (error) {
//       if (error instanceof AxiosError) {
//         // Handle 400 Bad Request (ModelState or business logic errors)
//         if (error.response?.status === 400) {
//           const errorData = error.response.data as ApiError;
//           if (errorData.message) {
//             throw new Error(errorData.message);
//           }
//           if (errorData.errors) {
//             // Handle ModelState validation errors
//             const errorMessages = Object.values(errorData.errors).flat();
//             throw new Error(errorMessages.join(', '));
//           }
//         }
//         // Handle other HTTP errors
//         if (error.response?.data?.message) {
//           throw new Error(error.response.data.message);
//         }
//       }
//       throw new Error('Registration failed');
//     }
//   }

//   static logout(): void {
//     tokenManager.removeToken();
//     // Redirect to login page
//     if (typeof window !== 'undefined') {
//       window.location.href = '/login';
//     }
//   }

// //   
//   static getCurrentUser(): UserResponseDto | null {
//   const token = tokenManager.getToken();
//   if (!token || tokenManager.isTokenExpired(token)) {
//     return null;
//   }

//   const payload = tokenManager.getTokenPayload(token);
//   // Kiểm tra payload đúng kiểu JwtPayload
//   if (!payload || !isValidJwtPayload(payload)) {
//     return null;
//   }

//   const roleId = parseInt(payload.roleId);
//   if (isNaN(roleId)) {
//     return null;
//   }

//   return {
//     userName: payload.sub,
//     email: payload.email,
//     roleId: roleId
//   };
// }

//   static isAuthenticated(): boolean {
//     const token = tokenManager.getToken();
//     return token !== null && !tokenManager.isTokenExpired(token);
//   }

// //   static hasRole(requiredRole: 'Reader' | 'Admin'): boolean {
// //     const token = tokenManager.getToken();
// //     if (!token || tokenManager.isTokenExpired(token)) return false;

// //     const payload = tokenManager.getTokenPayload(token);
// //     // Now payload is properly typed as JwtPayload | null
// //     if (!payload) return false;
    
// //     return payload.role === requiredRole;
// //   }
//     static hasRole(requiredRole: 'Reader' | 'Admin'): boolean {
//         const token = tokenManager.getToken();
//         if (!token || tokenManager.isTokenExpired(token)) return false;

//         const payload = tokenManager.getTokenPayload(token);
//         if (!payload || !isValidJwtPayload(payload)) return false;

//         return payload.role === requiredRole;
//   }
// }
export class AuthService {
  // Verify connection to backend
  static async verifyConnection(): Promise<boolean> {
    try {
      // Test với một endpoint đơn giản hoặc health check
      const response = await apiClient.get('/users/test', { timeout: 3000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  static async login(credentials: UserLoginDto): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await apiClient.post(
        '/users/login',
        credentials
      );
      
      // Save token to localStorage
      if (response.data.token) {
        tokenManager.setToken(response.data.token);
      }
      
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          throw new Error(error.response.data?.message || 'Invalid username or password');
        }
        // Handle 400 Bad Request (ModelState errors)
        if (error.response?.status === 400) {
          const errorData = error.response.data as ApiError;
          if (errorData.message) {
            throw new Error(errorData.message);
          }
          if (errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat();
            throw new Error(errorMessages.join(', '));
          }
        }
        throw new Error('Login failed');
      }
      throw new Error('Network error occurred');
    }
  }

  static async register(userData: UserCreateDto): Promise<RegisterResponse> {
    try {
      const response: AxiosResponse<RegisterResponse> = await apiClient.post(
        '/users/register',
        userData
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        // Handle 400 Bad Request (ModelState or business logic errors)
        if (error.response?.status === 400) {
          const errorData = error.response.data as ApiError;
          if (errorData.message) {
            throw new Error(errorData.message);
          }
          if (errorData.errors) {
            // Handle ModelState validation errors
            const errorMessages = Object.values(errorData.errors).flat();
            throw new Error(errorMessages.join(', '));
          }
        }
        // Handle other HTTP errors
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
      }
      throw new Error('Registration failed');
    }
  }

  static logout(): void {
    tokenManager.removeToken();
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  static getCurrentUser(): UserResponseDto | null {
    const token = tokenManager.getToken();
    if (!token || tokenManager.isTokenExpired(token)) {
      return null;
    }

    const payload = tokenManager.getTokenPayload(token);
    // Kiểm tra payload đúng kiểu ParsedJwtPayload (đã convert từ full claims)
    if (!payload) {
      return null;
    }

    const roleId = parseInt(payload.roleId);
    if (isNaN(roleId)) {
      return null;
    }

    return {
      userName: payload.sub,
      email: payload.email,
      roleId: roleId
    };
  }

  static isAuthenticated(): boolean {
    const token = tokenManager.getToken();
    return token !== null && !tokenManager.isTokenExpired(token);
  }

  static hasRole(requiredRole: 'Reader' | 'Admin'): boolean {
    const token = tokenManager.getToken();
    if (!token || tokenManager.isTokenExpired(token)) return false;

    const payload = tokenManager.getTokenPayload(token);
    // Payload đã được convert sang ParsedJwtPayload với short names
    if (!payload) return false;
    
    return payload.role === requiredRole;
  }
}