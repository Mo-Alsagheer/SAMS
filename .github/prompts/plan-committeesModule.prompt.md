## Plan: Committees Module With In-Memory Auth

We will add a full committees feature slice with read endpoints for `USER` and write endpoints for `EXECUTIVE`, plus director-only description updates, using a simple JWT auth module backed by in-memory users. Since there is no ORM yet, committees will live in an in-memory repository with DTO validation using `class-validator`. We will wire role-based guards into the routes and keep the module structure aligned with Nest best practices. This plan touches the main Nest bootstrap and module wiring in [server/src/main.ts](server/src/main.ts#L1-L8) and [server/src/app.module.ts](server/src/app.module.ts#L1-L10), and introduces new modules for auth, users (in-memory), and committees.

**Steps**
1. Add dependencies for JWT + validation, then enable global validation pipe in [server/src/main.ts](server/src/main.ts#L1-L8) for DTO enforcement.
2. Create an `auth` module: `AuthController` with `POST /auth/login`, `AuthService` that validates in-memory users, `JwtStrategy`, `JwtAuthGuard`, and a `RolesGuard` with a `@Roles()` decorator; wire into [server/src/app.module.ts](server/src/app.module.ts#L1-L10).
3. Create an in-memory `users` store/service that seeds a few users with `USER`, `DIRECTOR`, `EXECUTIVE` roles; expose a lookup used by `AuthService`.
4. Create a `committees` module with `CommitteesController`, `CommitteesService`, DTOs (`CreateCommitteeDto`, `UpdateCommitteeDto`), and an in-memory repository; implement:
   - `GET /committees` (USER+)
   - `GET /committees/:id` (USER+)
   - `POST /executive/committees` (EXECUTIVE)
   - `PATCH /executive/committees/:id` (EXECUTIVE)
   - `PATCH /director/committees/:committeeId/description` (DIRECTOR)
5. Apply guards and `@Roles()` on each route, ensure the role rules match the decision, and keep responses consistent (404 for missing, 400 for validation errors).
6. Update any README/guide references if needed to reflect the new endpoints and auth behavior.

**Verification**
- Run `npm run start:dev` in server and manually hit:
  - `POST /auth/login` to get a JWT for each role
  - `GET /committees` with USER token
  - `POST /executive/committees` with EXECUTIVE token
  - `PATCH /director/committees/:committeeId/description` with DIRECTOR token
- Confirm validation errors for missing/invalid fields.

**Decisions**
- In-memory data stores for committees and users (no ORM yet)
- Simple JWT auth with static in-memory users
- Full DTO validation via `class-validator`
- Route set: GET list/detail + executive create/update + director description update
