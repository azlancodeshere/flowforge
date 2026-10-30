import dotenv from "dotenv";

dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  corsOrigin: string;
  jwt: {
    accessTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenSecret: string;
    refreshTokenExpiry: string;
  };
}

export const config: AppConfig = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "",
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "",
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  },
};

export default config;
