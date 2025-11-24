import { AuthErrorSource } from './auth-error-source.enum';

export interface AuthError {
  message: string;
  source: AuthErrorSource;
}
