CREATE TABLE IF NOT EXISTS user (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    apiKeyHash TEXT NOT NULL,
    requestCount INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON user (email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_api_key ON user (api_key);