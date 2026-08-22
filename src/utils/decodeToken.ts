import { jwtDecode } from "jwt-decode"
type CustomJwtPayload = { email: string; exp: number; iat: number; role: string, id: string, name: string; }


export const decodeToken = (token: string): CustomJwtPayload => {
    return jwtDecode(token)
}