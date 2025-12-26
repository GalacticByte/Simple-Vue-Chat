export interface LoginRequest {
  nickname: string
}

export interface LoginResponse {
  nickname: string
  userId: string
  token: string
}

export interface JwtPayload {
  sub: string
  nickname: string
}
