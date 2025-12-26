import { CreateUserRepoDto } from '../dtos';
import { UserEntity } from '../entities';

export abstract class UserRepository {
  abstract create(createUserRepoDto: CreateUserRepoDto): Promise<UserEntity>;

  abstract findByEmail(email: string): Promise<UserEntity | null>;

  abstract findById(id: string): Promise<UserEntity | null>;

  // This is the "unsafe" version for the AuthService ONLY
  // It explicitly selects the password and refresh token
  abstract findByEmailWithCredentials(email: string): Promise<UserEntity | null>;

  // Updates a users data by their ID
  abstract update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null>;
}
