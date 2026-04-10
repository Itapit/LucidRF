# Notifications Service (Spring Boot)

Java microservice responsible for outbound user notifications (currently email).

## Current API

- `POST /internal/notifications/welcome-pending-user`
  - Header: `X-Internal-Api-Key`
  - Body:
    - `email` (string, email)
    - `username` (string)
    - `temporaryPassword` (string)
  - Response: `202 Accepted`

## Configuration

Required:

- `NOTIFICATIONS_INTERNAL_API_KEY`: shared internal key for callers.

Optional:

- `NOTIFICATIONS_SERVER_PORT` (default: `8090`)
- `NOTIFICATIONS_MAIL_MODE` (`LOG` or `SMTP`, default: `LOG`)
- `NOTIFICATIONS_MAIL_FROM` (default: `noreply@localhost`)
- `APP_PUBLIC_BASE_URL` (default: `http://localhost:4200`)

When `NOTIFICATIONS_MAIL_MODE=SMTP`, provide standard Spring mail settings:

- `SPRING_MAIL_HOST`
- `SPRING_MAIL_PORT` (default: `587`)
- `SPRING_MAIL_USERNAME`
- `SPRING_MAIL_PASSWORD`
- `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH`
- `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE`

## Local run

From `services/notifications-service`:

- Build: `mvn package`
- Run: `java -jar target/notifications-service-0.0.1-SNAPSHOT.jar`

### Permission denied on `target/classes`

If you previously built with **Docker** mounting this folder, `target/` may be owned by root/`nobody` and the IDE cannot write there.

1. Fix ownership (replace user/group as needed):
   - `sudo chown -R itapit:itapit services/notifications-service`
2. Remove stale build output:
   - `rm -rf services/notifications-service/target`

Or via docker compose from workspace root:

- `docker compose up notifications-service`
- or `npm run dev:notifications:up`
- Compose reads config from `services/notifications-service/.env`

## Integration from users-service

Set these env vars in users-service runtime:

- `NOTIFICATIONS_SERVICE_BASE_URL` (example: `http://localhost:8090`)
- `NOTIFICATIONS_INTERNAL_API_KEY` (must match notifications service key)

If `NOTIFICATIONS_SERVICE_BASE_URL` is unset, users-service skips notification calls.

## One-command local smoke flow

From workspace root:

1. Start notifications: `npm run dev:notifications:up`
2. Run users-service with notifications env wired:
   - `npm run dev:users-service:with-notifications`
3. In another terminal, verify endpoint/key wiring:
   - `curl -X POST http://localhost:8090/internal/notifications/welcome-pending-user -H 'Content-Type: application/json' -H 'X-Internal-Api-Key: dev-notifications-key' --data '{\"email\":\"smoke.user@lucidrf.test\",\"username\":\"smoke.user\",\"temporaryPassword\":\"smoke-temp-password\"}'`
4. Optional: follow notification logs:
   - `npm run dev:notifications:logs`
