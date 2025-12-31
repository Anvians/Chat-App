import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_123';
export const PORT = process.env.PORT || 3003;