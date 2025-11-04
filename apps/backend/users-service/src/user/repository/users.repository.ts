import { CreateUserRepoDto } from '../dtos/create-user-repo.dto';
import { UserSchema } from './user.schema';

//This abstract class defines the contract for our UsersRepository

export abstract class UsersRepository {
  abstract create(createUserRepoDto: CreateUserRepoDto): Promise<UserSchema>;

  abstract findByEmail(email: string): Promise<UserSchema | null>;

  abstract findById(id: string): Promise<UserSchema | null>;

  // This is the "unsafe" version for the AuthService ONLY
  // It explicitly selects the password and refresh token
  abstract findByEmailWithCredentials(email: string): Promise<UserSchema | null>;

  // Updates a users data by their ID
  abstract update(id: string, updates: Partial<UserSchema>): Promise<UserSchema | null>;
}
