# LucidRF - Technical Design & Architecture Report

**Version:** 1.0  
**Date:** January 2026  
**Classification:** Internal Technical Documentation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Full Stack Architecture](#2-full-stack-architecture)
3. [Backend Deep Dive](#3-backend-deep-dive)
4. [Frontend Deep Dive](#4-frontend-deep-dive)
5. [Database & Data Model](#5-database--data-model)
6. [Deployment & DevOps](#6-deployment--devops)
7. [NotebookLM Key Questions Bank](#7-notebooklm-key-questions-bank)

---

## 1. Executive Summary

### 1.1 Purpose & Business Logic

**LucidRF** is a specialized platform for managing, diagnosing, and cleaning Software Defined Radio (SDR) I/Q files. The platform addresses a critical problem in radio signal processing: dynamic interference (jamming, environmental noise) that traditional DSP filters cannot easily remove.

**Core Value Proposition:**

- **File Management:** Secure upload, organization, and sharing of massive binary I/Q radio signal files
- **AI-Powered Detection:** Logistic Regression model detects "Barrage" noise interference
- **Signal Restoration:** Denoising Autoencoder (DAE) reconstructs clean signals from noisy inputs
- **Collaboration:** Role-based access control with group-based file sharing capabilities

**Target Users:** Radio engineers, signal processing specialists, and research teams working with SDR equipment.

### 1.2 High-Level Technology Stack

| Layer                  | Technology                    | Version            |
| ---------------------- | ----------------------------- | ------------------ |
| **Frontend Framework** | Angular                       | 20.3.x             |
| **UI Components**      | PrimeNG                       | 20.3.0             |
| **State Management**   | NgRx (Store, Effects, Entity) | 20.0.0             |
| **Backend Framework**  | NestJS                        | 11.0.0             |
| **Runtime**            | Node.js with TypeScript       | ES2015 target      |
| **Database**           | MongoDB                       | 8.0                |
| **ODM**                | Mongoose                      | 8.19.2             |
| **Object Storage**     | MinIO                         | Latest             |
| **Monorepo Tool**      | Nx                            | 21.6.2             |
| **Authentication**     | Passport.js with JWT          | passport-jwt 4.0.1 |
| **Password Hashing**   | bcrypt                        | 6.0.0              |
| **Monitoring**         | Prometheus + Grafana          | prom-client 15.1.3 |
| **ML Pipeline**        | Python (see `ml/` directory)  | -                  |

### 1.3 State of the Code

**Maturity Level:** `MVP → Early Production`

The codebase demonstrates production-readiness characteristics:

- ✅ Clean separation of concerns with Domain-Driven Design (DDD) patterns
- ✅ Comprehensive error handling with custom exception hierarchies
- ✅ Environment-based configuration management
- ✅ Monitoring and observability instrumentation
- ✅ Proper security implementations (JWT, bcrypt, RBAC)
- ⚠️ Some TODO markers indicate incomplete features (email notifications, ML integration)
- ⚠️ Tests are explicitly disabled in Nx generators (`skipTests: true`)

**Code Quality Assessment:**

- **Organization:** Excellent - follows Nx monorepo best practices with clear project boundaries
- **Typing:** Strong TypeScript usage throughout with strict mode enabled
- **Documentation:** Moderate - JSDoc comments on critical methods, but sparse inline documentation
- **Patterns:** Consistent architectural patterns across all microservices

---

## 2. Full Stack Architecture

### 2.1 The Big Picture - Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Angular SPA (PrimeNG UI)                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ NgRx Store   │──│ Effects      │──│ HTTP Service │              │   │
│  │  │ (Auth, Core) │  │ (Side-effects)│  │ (API Calls)  │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP/REST (JSON) + JWT Bearer Token
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (NestJS :3000)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │ Auth Controller │  │ Users Controller│  │ Files Controller│            │
│  │ (Passport/JWT)  │  │ (RBAC Guards)   │  │ (Presigned URLs)│            │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │
│           │                    │                    │                      │
│           └────────────────────┴────────────────────┘                      │
│                                │                                           │
│                    TCP (NestJS Microservices)                              │
└────────────────────────────────┼───────────────────────────────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Users Service  │   │ Groups Service  │   │  Files Service  │
│     (:3001)     │   │     (:3002)     │   │     (:3003)     │
│  - Auth Logic   │   │  - Group CRUD   │   │  - File Metadata│
│  - User CRUD    │   │  - Membership   │   │  - ACL Logic    │
│  - Token Mgmt   │   │                 │   │  - Storage Proxy│
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┴─────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    MongoDB 8.0      │
                    │ (Database-per-svc)  │
                    │  - users collection │
                    │  - groups collection│
                    │  - files collection │
                    │  - folders collection│
                    │  - refresh_tokens   │
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │   MinIO (S3-compat) │
                    │  - lucid-rf-files   │
                    │  bucket             │
                    │  (Direct Upload via │
                    │   Presigned URLs)   │
                    └─────────────────────┘
```

### 2.2 Directory Structure Analysis

```
LucidRF/
├── apps/                           # Application projects
│   ├── backend/
│   │   ├── gateway/               # API Gateway - HTTP entry point
│   │   │   └── src/
│   │   │       ├── auth/          # JWT auth, guards, strategies
│   │   │       ├── users/         # User proxies to users-service
│   │   │       ├── groups/        # Group proxies to groups-service
│   │   │       ├── files/         # File proxies to files-service
│   │   │       └── health/        # Health checks & Prometheus metrics
│   │   │
│   │   ├── users-service/         # User domain microservice (TCP :3001)
│   │   │   └── src/
│   │   │       ├── auth/          # Authentication business logic
│   │   │       │   ├── application/   # Use cases (auth.service.ts)
│   │   │       │   ├── domain/        # Entities, exceptions, interfaces
│   │   │       │   └── infrastructure/# MongoDB repos, schemas
│   │   │       ├── users/         # User CRUD operations
│   │   │       │   ├── application/
│   │   │       │   ├── domain/
│   │   │       │   └── infrastructure/
│   │   │       └── security/      # Password hashing services
│   │   │
│   │   ├── groups-service/        # Groups domain microservice (TCP :3002)
│   │   │   └── src/groups/
│   │   │       ├── repository/    # MongoDB implementation
│   │   │       └── exceptions/    # Domain exceptions
│   │   │
│   │   └── files-service/         # Files domain microservice (TCP :3003)
│   │       └── src/
│   │           ├── files/
│   │           │   ├── application/   # ACL, sharing, file/folder services
│   │           │   ├── domain/        # Entities, DTOs, access logic
│   │           │   └── infrastructure/# MongoDB repos, schemas
│   │           ├── storage/       # MinIO integration
│   │           └── integrations/  # External service clients
│   │
│   └── frontend/                  # Angular SPA
│       └── src/app/
│           ├── auth/              # Authentication module
│           │   ├── infrastructure/    # Guards, interceptors
│           │   ├── services/          # Auth HTTP services
│           │   └── store/             # NgRx auth state
│           ├── core/              # Core services (error handling, navigation)
│           ├── state/             # Root NgRx configuration
│           ├── admin/             # Admin features module
│           ├── dashboard/         # Dashboard component
│           └── groups/            # Groups feature module
│
├── libs/                          # Shared libraries
│   ├── backend/
│   │   ├── backend-common/        # Shared backend utilities
│   │   │   └── src/lib/
│   │   │       ├── exceptions/    # BaseDomainException
│   │   │       ├── filters/       # Global exception filters
│   │   │       └── decorators/    # Custom decorators
│   │   │
│   │   ├── users-contracts/       # User service message contracts
│   │   │   └── src/lib/
│   │   │       ├── messaging-config/  # TCP client module, patterns
│   │   │       ├── auth/              # Auth DTOs
│   │   │       └── users/             # User payloads
│   │   │
│   │   ├── groups-contracts/      # Groups service message contracts
│   │   └── files-contracts/       # Files service message contracts
│   │
│   └── common/                    # Shared frontend/backend types
│       └── src/lib/
│           ├── users/             # UserDto, UserRole, UserStatus
│           ├── auth/              # Login/Logout DTOs
│           ├── groups/            # GroupDto
│           ├── files/             # FileDto, permissions
│           └── app/               # Error codes, API response interfaces
│
├── ml/                            # Machine Learning pipeline
│   ├── src/                       # Python source code
│   ├── notebooks/                 # Jupyter notebooks
│   ├── models/                    # Trained model artifacts
│   └── data/                      # Training data
│
├── grafana/                       # Grafana configuration
│   ├── dashboards/                # Dashboard JSON definitions
│   └── provisioning/              # Auto-provisioning config
│
├── docker-compose.yml             # Infrastructure services
├── prometheus.yml                 # Prometheus scrape config
├── nx.json                        # Nx workspace configuration
└── tsconfig.base.json             # Shared TypeScript paths
```

**Key Organizational Decisions:**

1. **`libs/backend/*-contracts/`**: Each microservice has a dedicated "contracts" library containing:

   - Message patterns (e.g., `USER_PATTERNS.CREATE_USER`)
   - TCP client configuration modules
   - Payload DTOs for inter-service communication
   - This ensures type-safe communication between gateway and microservices

2. **`libs/common/`**: Shared types used by BOTH frontend and backend:

   - Enums (`UserRole`, `FileStatus`)
   - DTOs (`UserDto`, `GroupDto`)
   - Error codes (`AppErrorCodes`)
   - This eliminates type drift between client and server

3. **DDD-style Organization**: Backend services follow Clean Architecture:
   - `domain/` - Business entities, exceptions, repository interfaces
   - `application/` - Use cases and service orchestration
   - `infrastructure/` - MongoDB schemas, concrete repository implementations

### 2.3 Integration Points

| Communication Type          | Technology                 | Use Case                                      |
| --------------------------- | -------------------------- | --------------------------------------------- |
| **Frontend ↔ Gateway**      | HTTP/REST                  | All API calls with JSON payloads              |
| **Gateway ↔ Microservices** | TCP (NestJS Microservices) | Internal service-to-service via `ClientProxy` |
| **Frontend ↔ MinIO**        | HTTP (Presigned URLs)      | Direct file upload/download bypassing gateway |
| **Gateway ↔ MongoDB**       | -                          | None - Gateway is stateless                   |
| **Microservices ↔ MongoDB** | Mongoose ODM               | Each service owns its collections             |

---

## 3. Backend Deep Dive

### 3.1 Framework & Runtime

- **Runtime:** Node.js (ES2015 target, ESNext modules)
- **Framework:** NestJS v11.0.0
- **Build Tool:** Webpack with SWC transpiler for fast compilation
- **Configuration:** `@nestjs/config` with `.env` files per service

**Gateway Configuration (`apps/backend/gateway/.env`):**

```dotenv
JWT_SECRET=e05522fe745ba2cfff5ac2adfdf23e45
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_PENDING_EXPIRES_IN=10m
```

### 3.2 Design Patterns Identified

#### 3.2.1 Repository Pattern

**Location:** All microservices implement abstract repository interfaces with MongoDB implementations.

**Example - User Repository Interface (`apps/backend/users-service/src/users/domain/interfaces/user.repository.interface.ts`):**

```typescript
export abstract class UserRepository {
  abstract create(createUserRepoDto: CreateUserRepoDto): Promise<UserEntity>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByUsername(username: string): Promise<UserEntity | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract findByEmailWithCredentials(email: string): Promise<UserEntity | null>;
  abstract update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null>;
}
```

**Concrete Implementation (`apps/backend/users-service/src/users/infrastructure/repositories/mongo-user.repository.ts`):**

```typescript
@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(@InjectModel(UserSchema.name) private userModel: Model<UserSchema>) {}
  // ... implementation
}
```

#### 3.2.2 Dependency Injection (NestJS IoC Container)

**Location:** Throughout all NestJS modules.

**Example - Repository binding in module (`apps/backend/users-service/src/users/users.module.ts`):**

```typescript
providers: [
  UserService,
  {
    provide: UserRepository, // Abstract token
    useClass: MongoUserRepository, // Concrete implementation
  },
];
```

#### 3.2.3 Strategy Pattern (Authentication)

**Location:** `apps/backend/gateway/src/auth/strategies/`

Three distinct JWT strategies are implemented:

- `AccessJwtStrategy` - Validates access tokens from Authorization header
- `RefreshJwtStrategy` - Validates refresh tokens from HTTP-only cookies
- `PendingJwtStrategy` - Validates tokens for users completing account setup

**Access JWT Strategy Implementation (`apps/backend/gateway/src/auth/strategies/access-jwt.strategy.ts`):**

```typescript
@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(JWT_SECRET) jwtSecret: string) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: AccessJwtPayload): Promise<AccessUser> {
    return {
      userId: payload.sub,
      role: payload.role,
    };
  }
}
```

#### 3.2.4 Factory Pattern (Token Providers)

**Location:** `apps/backend/gateway/src/auth/auth.module.ts`

Custom factory providers inject configuration values:

```typescript
{
  provide: JWT_ACCESS_EXPIRES_IN,
  useFactory: (configService: ConfigService) => {
    return configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN');
  },
  inject: [ConfigService],
}
```

#### 3.2.5 Proxy/Gateway Pattern

**Location:** `apps/backend/gateway/src/users/users.service.ts`

The gateway acts as a proxy, forwarding requests to microservices:

```typescript
@Injectable()
export class UsersService {
  constructor(@Inject(USER_SERVICE) private readonly usersClient: ClientProxy) {}

  async adminCreateUser(adminId: string, dto: AdminCreateUserDto): Promise<UserDto> {
    const payload: AdminCreateUserPayload = { ... };
    return this.usersClient.send<UserDto>(USER_PATTERNS.CREATE_USER, payload).toPromise();
  }
}
```

#### 3.2.6 Message Pattern (CQRS-lite)

**Location:** All microservice controllers use `@MessagePattern()` decorators.

**Example (`apps/backend/users-service/src/users/users.controller.ts`):**

```typescript
@MessagePattern(USER_PATTERNS.CREATE_USER)
async adminCreateUser(@Payload() payload: AdminCreateUserPayload): Promise<UserDto> {
  return this.userService.adminCreateUser(payload);
}
```

#### 3.2.7 Mapper Pattern (Entity ↔ DTO)

**Location:** Domain layers contain mapper functions.

**Example (`apps/backend/files-service/src/files/infrastructure/schemas/file.schema.ts`):**

```typescript
export function toFileEntity(doc: FileDocument): FileEntity {
  const obj = doc.toObject();
  return new FileEntity({
    ...obj,
    id: obj._id.toString(),
    parentFolderId: obj.parentFolderId?.toString() || null,
    permissions:
      obj.permissions?.map((p) => ({
        subjectId: p.subjectId,
        subjectType: p.subjectType,
        role: p.role,
      })) || [],
  });
}
```

### 3.3 Authentication & Authorization Flow

#### 3.3.1 Authentication Architecture

**Technology Stack:**

- `passport` v0.7.0 with `passport-jwt` v4.0.1
- `@nestjs/jwt` v11.0.1 for token generation
- `bcrypt` v6.0.0 for password hashing (10 salt rounds)
- HTTP-only cookies for refresh token storage

**Token Types:**

| Token Type    | Storage             | Lifetime   | Purpose                  |
| ------------- | ------------------- | ---------- | ------------------------ |
| Access Token  | Memory (NgRx Store) | 15 minutes | API authorization        |
| Refresh Token | HTTP-only Cookie    | 7 days     | Token renewal            |
| Pending Token | Memory              | 10 minutes | Account setup completion |

**JWT Payload Structure:**

```typescript
// Access Token Payload
interface AccessJwtPayload {
  sub: string; // User ID
  role: UserRole; // 'admin' | 'user'
  iat: number;
  exp: number;
}

// Refresh Token Payload
interface RefreshJwtPayload {
  sub: string; // User ID
  jti: string; // Unique token identifier
  iat: number;
  exp: number;
}
```

#### 3.3.2 Login Flow Sequence

```
1. User submits credentials to POST /api/auth/login
2. Gateway AuthController receives LoginDto
3. AuthService.login() forwards to Users Microservice via TCP
4. Users Service AuthService.validateUser() verifies credentials
5. If user.status === PENDING:
   - Generate pendingToken (short-lived)
   - Return PendingLoginResponse
6. If user.status === ACTIVE:
   - Generate accessToken + refreshToken
   - Store refresh token metadata in MongoDB (jti, userId, expiresAt, userAgent)
   - Return AuthLoginResponse with tokens and UserDto
7. Gateway sets refreshToken in HTTP-only cookie
8. Frontend stores accessToken in memory (AccessTokenService)
```

#### 3.3.3 Token Refresh Flow

**Implementation:** `apps/frontend/src/app/auth/infrastructure/interceptors/refresh.interceptor.ts`

```
1. API call returns 401 Unauthorized
2. AuthInterceptor detects 401 (not on login endpoint)
3. If not already refreshing:
   - Set isRefreshing = true
   - Dispatch AuthActions.refreshStart()
4. Other concurrent requests wait on refreshTokenSubject
5. POST /api/auth/refresh sends HTTP-only cookie
6. Server validates jti in database, checks isRevoked
7. Server implements "Rotate on Use" - old token invalidated
8. New token pair generated and returned
9. refreshTokenSubject.next(newToken) unblocks waiting requests
10. Original request retried with new access token
```

#### 3.3.4 Authorization (RBAC)

**Roles Defined (`libs/common/src/lib/users/user-role.enum.ts`):**

```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
```

**Guard Implementation (`apps/backend/gateway/src/auth/guards/admin.guard.ts`):**

```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user && user.role === UserRole.ADMIN;
  }
}
```

**Usage Example (`apps/backend/gateway/src/users/users.controller.ts`):**

```typescript
@Post()
@UseGuards(JwtAuthGuard, AdminGuard)  // Stacked guards
async adminCreateUser(@Body() dto: AdminCreateUserDto): Promise<UserDto> {
  // Only admins reach here
}
```

### 3.4 API Structure

**Routing Strategy:** Resource-based REST with controller-per-domain.

**Gateway Endpoints:**

| Endpoint                   | Method | Auth            | Controller       | Description             |
| -------------------------- | ------ | --------------- | ---------------- | ----------------------- |
| `/api/auth/login`          | POST   | None            | AuthController   | User login              |
| `/api/auth/refresh`        | POST   | RefreshToken    | AuthController   | Token refresh           |
| `/api/auth/logout`         | POST   | RefreshToken    | AuthController   | Single device logout    |
| `/api/auth/logout-all`     | POST   | JwtAuth         | AuthController   | All devices logout      |
| `/api/auth/complete-setup` | POST   | PendingJwt      | AuthController   | First-time password set |
| `/api/users/me`            | GET    | JwtAuth         | UsersController  | Get current user        |
| `/api/users`               | POST   | JwtAuth + Admin | UsersController  | Create user (admin)     |
| `/api/groups`              | CRUD   | JwtAuth         | GroupsController | Group operations        |
| `/api/files`               | CRUD   | JwtAuth         | FilesController  | File operations         |
| `/api/health`              | GET    | None            | HealthController | Health check            |
| `/api/metrics`             | GET    | None            | PrometheusModule | Prometheus metrics      |

### 3.5 Error Handling Architecture

#### 3.5.1 Custom Exception Hierarchy

**Base Exception (`libs/backend/backend-common/src/lib/exceptions/base-domain.exception.ts`):**

```typescript
export abstract class BaseDomainException extends Error {
  constructor(
    override readonly message: string,
    public readonly statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly code: string
  ) {
    super(message);
    this.name = 'BaseDomainException';
  }
}
```

**Domain-Specific Exceptions (Examples):**

- `UserNotFoundException` (404, `USER_NOT_FOUND`)
- `EmailAlreadyExistsException` (409, `EMAIL_ALREADY_EXISTS`)
- `InvalidCredentialsException` (401, `INVALID_CREDENTIALS`)
- `GroupPermissionDeniedException` (403, `GROUP_PERMISSION_DENIED`)

#### 3.5.2 Exception Filters

**RPC Filter (Microservices) (`libs/backend/backend-common/src/lib/filters/rpc-domain-exception.filter.ts`):**

```typescript
@Catch(BaseDomainException)
export class RpcDomainExceptionFilter implements ExceptionFilter {
  catch(exception: BaseDomainException, _host: ArgumentsHost): Observable<unknown> {
    const packet: RpcErrorPacket = {
      statusCode: exception.statusCode,
      message: exception.message,
      code: exception.code,
      error: exception.constructor.name,
    };
    return throwError(() => new RpcException(packet));
  }
}
```

**HTTP Filter (Gateway) (`libs/backend/backend-common/src/lib/filters/http-global-exception.filter.ts`):**

```typescript
@Catch()
export class HttpGlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Handles:
    // 1. RpcException packets from microservices
    // 2. Standard HttpExceptions
    // 3. Unknown errors (500)

    const errorResponse: ApiErrorResponse = {
      statusCode,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    response.status(statusCode).json(errorResponse);
  }
}
```

**Standard Error Response Format:**

```json
{
  "statusCode": 404,
  "message": "User with ID abc123 was not found",
  "code": "USER_NOT_FOUND",
  "timestamp": "2026-01-09T10:30:00.000Z",
  "path": "/api/users/abc123"
}
```

---

## 4. Frontend Deep Dive

### 4.1 Framework & Configuration

- **Framework:** Angular 20.3.x (non-standalone modules mode)
- **UI Library:** PrimeNG 20.3.0 with Lara theme preset
- **CSS Framework:** PrimeFlex 4.0.0
- **Build Tool:** Angular CLI with @angular/build

### 4.2 State Management Architecture

**Technology:** NgRx 20.0.0 (Store + Effects + Entity + Router Store)

**State Shape (`apps/frontend/src/app/state/app.state.ts`):**

```typescript
export interface AppState {
  router: RouterReducerState<SerializedRouterStateSnapshot>;
  core: CoreState;
  auth: AuthState;
}
```

**Feature State Registration (`apps/frontend/src/app/state/app-store.module.ts`):**

```typescript
@NgModule({
  imports: [
    StoreModule.forRoot({
      router: routerReducer,
      [coreFeature.name]: coreFeature.reducer,
      [authFeature.name]: authFeature.reducer,
    }),
    EffectsModule.forRoot([AppInitEffects, AuthEffects]),
    StoreRouterConnectingModule.forRoot({ stateKey: 'router' }),
    StoreDevtoolsModule.instrument({
      name: 'LucidRF',
      maxAge: 25,
      trace: true,
    }),
  ],
})
export class AppStoreModule {}
```

### 4.3 Auth State Structure

**State Interface (`apps/frontend/src/app/auth/store/auth.state.ts`):**

```typescript
interface AuthState {
  user: UserDto | null;
  sessionStatus: SessionStatus;
  loading: boolean;
  error: AuthError | null;
  isInitialized: boolean;
}

enum SessionStatus {
  UNKNOWN = 'unknown', // Initial state
  ACTIVE = 'active', // Logged in
  PENDING = 'pending', // Needs password setup
  LOGGED_OUT = 'logged_out',
}
```

### 4.4 Facade Pattern for State Access

**Implementation (`apps/frontend/src/app/auth/store/auth.facade.ts`):**

```typescript
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject<Store<{ auth: AuthState }>>(Store);

  // Selectors exposed as observables
  loading$ = this.store.select(selectAuthLoading);
  user$ = this.store.select(selectUser);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  // Action dispatchers
  login(request: LoginRequest) {
    this.store.dispatch(AuthActions.loginStart({ request }));
  }

  logout() {
    this.store.dispatch(AuthActions.logoutStart());
  }
}
```

**Usage in Components:**

```typescript
@Component({ ... })
export class AppComponent {
  private authFacade = inject(AuthFacade);
  isAppLoading$ = this.authFacade.isAppLoading$;
}
```

### 4.5 Component Architecture

**Module Structure:** Feature modules with lazy loading.

```typescript
// apps/frontend/src/app/app.routes.ts
export const appRoutes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
    canMatch: [adminGuard], // Route guard
  },
];
```

**Guard Implementation:**

```typescript
// apps/frontend/src/app/auth/infrastructure/guards/admin.guard.ts
export const adminGuard: CanMatchFn = () => {
  const authFacade = inject(AuthFacade);
  return authFacade.role$.pipe(map((role) => role === UserRole.ADMIN));
};
```

### 4.6 Routing

- **Type:** Client-side routing via `@angular/router`
- **Strategy:** Hash routing not used (HTML5 pushState)
- **Guards:** `canActivate` for authenticated routes, `canMatch` for admin routes
- **Lazy Loading:** Feature modules loaded on demand

### 4.7 HTTP Interceptors

**Interceptor Chain (`apps/frontend/src/app/app.module.ts`):**

```typescript
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: CredentialsInterceptor, // Adds withCredentials for cookies
    multi: true,
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor, // Adds JWT, handles 401
    multi: true,
  },
];
```

**AuthInterceptor Key Features:**

- Adds `Authorization: Bearer <token>` header
- Implements "stampeding herd" protection for concurrent 401s
- Coordinates with NgRx for token refresh
- Differentiates login failures from session expiration

---

## 5. Database & Data Model

### 5.1 Database Technology

- **Database:** MongoDB 8.0 (document-oriented)
- **ODM:** Mongoose 8.19.2 via `@nestjs/mongoose` 11.0.3
- **Connection:** Per-service async configuration with `MongooseModule.forRootAsync()`

**Connection Pattern:**

```typescript
MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('MONGODB_URI'),
  }),
  inject: [ConfigService],
}),
```

### 5.2 Entity Relationship Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS SERVICE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐              │
│  │       users         │         │   refresh_tokens    │              │
│  ├─────────────────────┤         ├─────────────────────┤              │
│  │ _id: ObjectId (PK)  │◄────────│ userId: ObjectId(FK)│              │
│  │ email: String (UK)  │    1:N  │ jti: String (UK)    │              │
│  │ username: String(UK)│         │ isRevoked: Boolean  │              │
│  │ password: String    │         │ expiresAt: Date(TTL)│              │
│  │ role: Enum          │         │ userAgent: String   │              │
│  │ status: Enum        │         │ createdAt: Date     │              │
│  │ createdAt: Date     │         └─────────────────────┘              │
│  │ updatedAt: Date     │                                               │
│  └─────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                             GROUPS SERVICE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐                                               │
│  │       groups        │                                               │
│  ├─────────────────────┤                                               │
│  │ _id: ObjectId (PK)  │                                               │
│  │ name: String        │                                               │
│  │ description: String │                                               │
│  │ ownerId: ObjectId   │◄─── Reference to users._id                    │
│  │ members: [ObjectId] │◄─── Array of user references                  │
│  │ createdAt: Date     │                                               │
│  │ updatedAt: Date     │                                               │
│  └─────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                             FILES SERVICE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────┐              │
│  │       files         │         │      folders        │              │
│  ├─────────────────────┤         ├─────────────────────┤              │
│  │ _id: ObjectId (PK)  │         │ _id: ObjectId (PK)  │              │
│  │ originalFileName    │         │ name: String        │              │
│  │ ownerId: String     │         │ ownerId: String     │              │
│  │ size: Number        │         │ parentFolderId:     │              │
│  │ mimeType: String    │    ┌───►│   ObjectId (FK,null)│◄──┐ Self-ref │
│  │ status: Enum        │    │    │ permissions: [      │   │          │
│  │ storageKey: String  │    │    │   {subjectId,       │   │          │
│  │ bucket: String      │    │    │    subjectType,     │   │          │
│  │ parentFolderId:     │────┘    │    role}           ]│   │          │
│  │   ObjectId (FK,null)│         │ createdAt: Date     │───┘          │
│  │ permissions: [      │         │ updatedAt: Date     │              │
│  │   {subjectId,       │         └─────────────────────┘              │
│  │    subjectType,     │                                               │
│  │    role}           ]│                                               │
│  │ createdAt: Date     │                                               │
│  │ updatedAt: Date     │                                               │
│  └─────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Key Entities Detail

#### 5.3.1 User Entity

**Schema (`apps/backend/users-service/src/users/infrastructure/schemas/user.schema.ts`):**

```typescript
@Schema({ collection: 'users', timestamps: true })
export class UserSchema extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  email: string;

  @Prop({ type: String, required: true, select: false }) // Password excluded by default
  password: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;
}
```

**Domain Entity (`apps/backend/users-service/src/users/domain/entities/user.entity.ts`):**

```typescript
export class UserEntity {
  id: string;
  email: string;
  password?: string; // Only populated for auth flows
  username: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### 5.3.2 Group Entity

**Schema (`apps/backend/groups-service/src/groups/repository/group.schema.ts`):**

```typescript
@Schema({ collection: 'groups', timestamps: true })
export class GroupSchema extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
  ownerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId }], default: [], index: true })
  members: MongooseSchema.Types.ObjectId[];
}
```

#### 5.3.3 File Entity with Embedded Permissions

**Schema (`apps/backend/files-service/src/files/infrastructure/schemas/file.schema.ts`):**

```typescript
@Schema({ collection: 'files', timestamps: true })
export class FileSchema extends Document {
  @Prop({ required: true })
  originalFileName: string;

  @Prop({ required: true, enum: FileStatus, type: String, default: FileStatus.PENDING })
  status: FileStatus;

  @Prop({ required: true, unique: true })
  storageKey: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Folder', default: null, index: true })
  parentFolderId: MongooseSchema.Types.ObjectId;

  // Embedded permissions for ACL
  @Prop({ type: [PermissionSchemaFactory], default: [] })
  permissions: PermissionSchema[];
}
```

**Permission Subdocument:**

```typescript
@Schema({ _id: false })
export class PermissionSchema {
  @Prop({ required: true })
  subjectId: string; // User ID or Group ID

  @Prop({ required: true, enum: PermissionType, type: String })
  subjectType: PermissionType; // 'user' | 'group'

  @Prop({ required: true, enum: PermissionRole, type: String })
  role: PermissionRole; // 'viewer' | 'editor' | 'owner'
}
```

#### 5.3.4 Refresh Token (TTL Index)

**Schema (`apps/backend/users-service/src/auth/infrastructure/schemas/refresh-token.schema.ts`):**

```typescript
@Schema({ collection: 'refresh_tokens', timestamps: true })
export class RefreshTokenSchema extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserSchema', required: true, index: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true, unique: true, index: true })
  jti: string;

  @Prop({ default: false })
  isRevoked: boolean;

  @Prop({ type: Date, required: true, index: { expireAfterSeconds: 0 } }) // TTL index
  expiresAt: Date;

  @Prop({ type: String })
  userAgent?: string;
}
```

### 5.4 Migrations

**Strategy:** Schema-on-write (MongoDB's flexible schema).

Mongoose handles schema evolution through:

- Default values on new fields
- Mongoose schema definitions enforce structure
- No explicit migration files required

---

## 6. Deployment & DevOps

### 6.1 Infrastructure Services (docker-compose.yml)

```yaml
services:
  mongo:
    image: mongo:8.0
    container_name: LucidRF-mongo
    ports: ['27017:27017']
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin
    volumes:
      - ./mongo_data:/data/db

  minio:
    image: minio/minio:latest
    container_name: LucidRF-minio
    ports:
      - '9000:9000' # API
      - '9001:9001' # Console
    command: server /data --console-address ":9001"
    volumes:
      - ./minio_data:/data

  prometheus:
    image: prom/prometheus
    container_name: LucidRF-prometheus
    ports: ['9090:9090']
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    extra_hosts:
      - 'host.docker.internal:host-gateway' # Access host network

  grafana:
    image: grafana/grafana
    container_name: LucidRF-grafana
    ports: ['3100:3000']
    depends_on: [prometheus]
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/etc/grafana/dashboards
```

### 6.2 Monitoring Stack

**Prometheus Configuration (`prometheus.yml`):**

```yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: 'nestjs_gateway'
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['host.docker.internal:3000']
```

**Metrics Exposed (`apps/backend/gateway/src/health/health.module.ts`):**

```typescript
PrometheusModule.register({
  path: '/metrics',
  defaultMetrics: { enabled: true },
}),
// Custom gauge for microservice health
makeGaugeProvider({
  name: 'microservices_health',
  help: 'Health status of microservices (1 = up, 0 = down)',
  labelNames: ['service'],
}),
```

### 6.3 Health Checks

**Terminus Health Checks (`apps/backend/gateway/src/health/health.controller.ts`):**

```typescript
@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    () => this.microservice.pingCheck('users_service', {
      transport: Transport.TCP,
      options: { host: USER_CONFIG.HOST, port: USER_CONFIG.PORT },
    }),
    () => this.microservice.pingCheck('groups_service', { ... }),
    () => this.microservice.pingCheck('files_service', { ... }),
  ]);
}
```

---

## 7. NotebookLM Key Questions Bank

### Q1: How do I add a new API endpoint to the system?

**A:** To add a new endpoint, you must work in two places:

1. **Microservice (e.g., users-service):**

   - Add a message pattern constant in `libs/backend/users-contracts/src/lib/messaging-config/user-constants.ts`:

     ```typescript
     export const USER_PATTERNS = {
       // ... existing
       NEW_OPERATION: 'user:new_operation',
     };
     ```

   - Create payload DTO in `libs/backend/users-contracts/src/lib/users/`
   - Add handler in controller using `@MessagePattern(USER_PATTERNS.NEW_OPERATION)`
   - Implement business logic in service layer

2. **Gateway:**
   - Create HTTP endpoint in relevant controller (e.g., `apps/backend/gateway/src/users/users.controller.ts`)
   - Create proxy method in service that uses `this.usersClient.send(USER_PATTERNS.NEW_OPERATION, payload)`
   - Apply guards (`@UseGuards(JwtAuthGuard)`) as needed

### Q2: How is JWT authentication implemented and where are the tokens validated?

**A:** JWT authentication uses `passport-jwt` v4.0.1 with three distinct strategies defined in `apps/backend/gateway/src/auth/strategies/`:

- **AccessJwtStrategy:** Extracts token from `Authorization: Bearer <token>` header, validates against `JWT_SECRET` environment variable, returns `{ userId, role }` to `request.user`
- **RefreshJwtStrategy:** Extracts token from HTTP-only cookie named `refreshToken`, validates and returns `{ userId, jti }`
- **PendingJwtStrategy:** For account setup flow

Tokens are generated in `users-service` by `TokenService` and stored refresh token metadata (jti, userId, expiresAt) in MongoDB's `refresh_tokens` collection with a TTL index.

### Q3: How does the file upload system work without overloading the API gateway?

**A:** The system implements the **Valet Key Pattern** using MinIO presigned URLs:

1. Client requests upload via `POST /api/files/init-upload` with metadata
2. `files-service` generates a unique `storageKey` (UUID-based path)
3. `MinioStorageService.getPresignedPutUrl()` creates a time-limited signed URL
4. Client receives `{ uploadUrl, file }` and uploads directly to MinIO
5. After upload, client calls `POST /api/files/confirm-upload`
6. Service verifies file exists in MinIO and updates status to `ACTIVE`

This bypasses the gateway for large binary transfers, preventing memory/bandwidth bottlenecks.

### Q4: How do I add a new microservice to the architecture?

**A:** Follow this pattern:

1. Generate service: `npx nx g @nx/nest:application new-service`
2. Create contracts library: `npx nx g @nx/nest:library new-contracts --directory=libs/backend`
3. Define in contracts library:
   - Service constants (`NEW_SERVICE`, `NEW_CONFIG = { PORT: 3004, HOST: 'localhost' }`)
   - Message patterns (`NEW_PATTERNS = { ... }`)
   - Client module with `ClientsModule.register([{ name: NEW_SERVICE, transport: Transport.TCP, options: {...} }])`
4. Configure microservice in `main.ts`:

   ```typescript
   const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
     transport: Transport.TCP,
     options: { port: NEW_CONFIG.PORT },
   });
   ```

5. Import client module in gateway and inject `@Inject(NEW_SERVICE) private readonly client: ClientProxy`

### Q5: How does the frontend handle token refresh when multiple API calls fail simultaneously?

**A:** The `AuthInterceptor` in `apps/frontend/src/app/auth/infrastructure/interceptors/refresh.interceptor.ts` implements stampeding herd protection:

1. First 401 sets `isRefreshing = true` and dispatches `AuthActions.refreshStart()`
2. Concurrent 401s wait on `refreshTokenSubject` (a BehaviorSubject)
3. Interceptor listens for `refreshSuccess` or `refreshFailure` actions
4. On success, `refreshTokenSubject.next(newToken)` unblocks all waiting requests
5. Each waiting request retries with the new token
6. On failure, user is logged out via `AuthActions.logoutStart()`

### Q6: How are domain errors propagated from microservices to the HTTP response?

**A:** Error propagation follows a two-filter system:

1. **Microservice Filter (`RpcDomainExceptionFilter`):** Catches `BaseDomainException`, wraps in `RpcException` with structured packet containing `{ statusCode, message, code, error }`
2. **Gateway Filter (`HttpGlobalExceptionFilter`):**
   - Detects RpcException packets
   - Extracts statusCode, message, code
   - Formats as `ApiErrorResponse` JSON
   - Returns appropriate HTTP status

Custom exceptions extend `BaseDomainException`:

```typescript
export class UserNotFoundException extends BaseDomainException {
  constructor(userId: string) {
    super(`User with ID ${userId} was not found`, HttpStatus.NOT_FOUND, 'USER_NOT_FOUND');
  }
}
```

### Q7: How is file/folder permission inheritance implemented?

**A:** Permissions are embedded documents within File and Folder schemas (`permissions: [{ subjectId, subjectType, role }]`).

Access control logic in `apps/backend/files-service/src/files/application/acl.service.ts`:

1. Direct permissions checked first
2. If user is owner (`ownerId === userId`), full access granted
3. Group membership resolved via `GroupsService.getUserGroupIds(userId)`
4. Permission inheritance calculated by `calculateInheritedPermissions()` in domain logic
5. Access levels: `OWNER` > `EDITOR` > `VIEWER`

Sharing propagates permissions to child items via `PermissionPropagationService`.

### Q8: How do I add a new field to the User entity?

**A:** Update three locations:

1. **Schema** (`apps/backend/users-service/src/users/infrastructure/schemas/user.schema.ts`):

   ```typescript
   @Prop({ type: String, required: false })
   newField: string;
   ```

2. **Domain Entity** (`apps/backend/users-service/src/users/domain/entities/user.entity.ts`):

   ```typescript
   export class UserEntity {
     // ... existing
     newField?: string;
   }
   ```

3. **Shared DTO** (if exposed to clients) (`libs/common/src/lib/users/user.dto.ts`):

   ```typescript
   export interface UserDto {
     // ... existing
     newField?: string;
   }
   ```

4. **Mapper** (ensure new field is copied in `toUserEntity()` and `toUserDto()` functions)

### Q9: What state management pattern does the frontend use and how do I add a new feature state?

**A:** The frontend uses NgRx 20.0.0 with the Facade pattern:

1. Create feature directory under `apps/frontend/src/app/[feature]/store/`
2. Define files:

   - `[feature].state.ts` - Interface and initial state
   - `[feature].actions.ts` - Action creators with `createActionGroup()`
   - `[feature].reducer.ts` - State mutations with `createFeature()`
   - `[feature].selectors.ts` - Memoized selectors
   - `[feature].effects.ts` - Side effects for API calls
   - `[feature].facade.ts` - Public API exposing selectors and action dispatchers

3. Register in feature module:

   ```typescript
   StoreModule.forFeature(featureFeature),
   EffectsModule.forFeature([FeatureEffects]),
   ```

4. Inject facade in components: `private facade = inject(FeatureFacade)`

### Q10: How does the system handle user account creation and the "pending" state?

**A:** User creation follows a two-phase activation flow implemented in `apps/backend/users-service/src/users/application/users.service.ts`:

1. **Admin creates user** via `adminCreateUser()`:

   - Validates email/username uniqueness
   - Generates temporary password via `PasswordService.generateTemporary()`
   - Hashes with bcrypt (10 rounds)
   - Creates user with `status: UserStatus.PENDING`
   - Logs temporary password (TODO: email integration)

2. **User first login** with temporary password:

   - `AuthService.login()` detects `status === PENDING`
   - Returns `PendingLoginResponse` with short-lived `pendingToken` (10 min)
   - Frontend routes to `/auth/complete-setup`

3. **User sets permanent password**:
   - `AuthService.completeUserSetup()` validates pending token
   - Updates password hash and `status: UserStatus.ACTIVE`
   - Issues full token pair (access + refresh)

---

_Report generated by architectural analysis. For updates, re-run analysis against current codebase._
