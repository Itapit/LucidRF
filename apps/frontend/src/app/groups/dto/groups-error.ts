import { GroupsErrorSource } from './groups-error-source.enum';

export interface GroupsError {
  message: string;
  source: GroupsErrorSource;
}
