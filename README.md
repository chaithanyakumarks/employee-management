# Employee Directory

NestJS API for an employee directory. Employees are stored in PostgreSQL. Login returns a JWT, and routes are restricted by role (`ADMIN` or `EMPLOYEE`).

## Requirements

- Node.js 22 or later
- PostgreSQL

## Setup

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000
DB_TYPE=postgres
DB_URL=postgres://user:password@localhost:5432/employee_directory
DB_SYNCHRONIZE=false
JWT_SECRET=replace-with-a-long-random-secret

ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
ADMIN_EMPLOYEE_ID=ADMIN_001
ADMIN_DEPARTMENT=IT
```

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port. Defaults to `3000`. A value already set in the environment takes precedence. |
| `DB_TYPE` | Database driver. Use `postgres`. |
| `DB_URL` | PostgreSQL connection string. |
| `DB_SYNCHRONIZE` | When `true`, TypeORM updates the schema from the entities. Keep this `false` outside local development. |
| `JWT_SECRET` | Secret used to sign and verify access tokens. Required. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_EMPLOYEE_ID`, `ADMIN_DEPARTMENT` | Initial admin created by `npm run seed:admin`. The password must be at least 8 characters. |

Create the first admin. The command builds the app, then inserts the admin from `.env`. If that email already exists, it leaves the row unchanged.

```bash
npm run seed:admin
```

## Run

```bash
npm run start:dev   # watch mode
npm run start       # single run
npm run start:prod  # node dist/main, after npm run build
```

The API listens on `http://localhost:3000` unless `PORT` is set. Swagger UI is at [http://localhost:3000/api-docs](http://localhost:3000/api-docs). Use the same port as `PORT` when it is set.

## Authentication

`POST /employee/login` is public. Every other route requires:

```http
Authorization: Bearer <accessToken>
```

Tokens expire after 15 minutes. The token carries the employee email, numeric id, and role.

`GET /employee` and `GET /employee/profile` accept either role. Creating, reading by id, updating, and deleting an employee require `ADMIN`.

## API

Successful responses are wrapped as:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {}
}
```

Request bodies are validated. Unknown properties are rejected.

### Login

`POST /employee/login`

```json
{
  "email": "admin@example.com",
  "password": "change-this-password"
}
```

`data` contains `accessToken`, `tokenType` (`Bearer`), `expiresIn` (`15m`), and `user` (`employeeId`, `email`). Passwords are never returned.

### List employees

`GET /employee`

Any signed-in user. Query parameters:

| Parameter | Default | Notes |
| --- | --- | --- |
| `search` | | Case-insensitive match on name or email. |
| `department` | | Exact department. |
| `page` | `1` | |
| `limit` | `10` | Maximum `100`. |
| `sortBy` | `name` | `name` or `joiningDate`. |
| `sortOrder` | `ASC` | `ASC` or `DESC`. |

`data` contains `employees` and `pagination` (`total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPreviousPage`).

### Profile

`GET /employee/profile`

Returns the employee record for the email in the token.

### Admin routes

| Method | Path | Action |
| --- | --- | --- |
| `POST` | `/employee/create` | Create an employee. |
| `GET` | `/employee/:id` | Fetch one employee by `employeeId`. |
| `PUT` | `/employee/:id` | Update name, email, department, or employment status. |
| `DELETE` | `/employee/:id` | Delete an employee. |

Create body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "department": "Engineering",
  "employmentStatus": "Permanent",
  "employeeId": "EMP001",
  "joiningDate": "2024-06-01",
  "password": "password1"
}
```

`employmentStatus` is one of `Internship`, `Probation`, `On Contract`, `Permanent`, `Resigned`, or `Terminated`. Employees created through this route receive the `EMPLOYEE` role. Email and `employeeId` must be unique. The password is stored as a bcrypt hash.

## Employee record

Each employee has a name, unique email, department, employment status, role, unique employee id, joining date, and password. List, profile, and detail responses omit the password and the numeric primary key.

## Tests and checks

```bash
npm test            # unit tests
npm run test:watch
npm run test:cov
npm run lint
npm run format
```

Unit tests live in `tests/` and cover the employee service, controller routes, and role guard.
