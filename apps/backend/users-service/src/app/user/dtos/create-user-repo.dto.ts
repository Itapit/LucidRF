export class CreateUserRepoDto {
  email: string;
  username: string;
  password; // HASHED password
  role: string;
  status: string;
}
