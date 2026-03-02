import { TeamsErrorSource } from './teams-error-source.enum';

export interface TeamsError {
  message: string;
  source: TeamsErrorSource;
}
