import apiService from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginRequest {
  email: string;
  senha: string;
}

interface LoginResponse {
  token: string;
}

interface LoginSuccessResponse {
  token: string;
  user: {
    id: number;
    email: string;
    nome: string;
  };
}

class AuthService {
  async login(email: string, password: string): Promise<LoginSuccessResponse> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/sign-in', {
        email,
        senha: password,
      });

      if (response.token) {
        await AsyncStorage.setItem('accessToken', response.token);
      }

      const userResponse: LoginSuccessResponse = {
        token: response.token,
        user: {
          id: 0,
          email: email,
          nome: email.split('@')[0],
        },
      };

      return userResponse;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'userInfo']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      return !!accessToken;
    } catch (error) {
      console.error('Check authentication failed:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  }

  async storeUserInfo(userInfo: any): Promise<void> {
    try {
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Store user info failed:', error);
    }
  }
}

export default new AuthService();