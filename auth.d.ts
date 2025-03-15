import type { UserRole } from "./server/database/schema"

// auth.d.ts
declare module "#auth-utils" {
  interface User {
    id: string
    name: string
    email: string
    role: UserRole
    organisationId: string
  }

  interface UserSession {}

  interface SecureSessionData {
    role: UserRole
    token: string
    organisationId: string
  }
}

export {}
