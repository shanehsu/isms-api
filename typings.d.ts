/// <reference types="express" />

declare module Express {
  export interface Request {
    user: {
      id?: string
      email: string
      name: string
      password?: {
        hash: string
        salt: string
        iteration: number
      }
      group: "admins" | "securityPersonnel" | "users" | "vendors" | "guests"
      tokens: {
        id?: string
        token: string
        origin: string
        userAgent: string
        used: Date
      }[]
      confirmed: boolean
    }
    group: "admins" | "securityPersonnel" | "users" | "vendors" | "guests"
    authenticated: boolean
  }
}
