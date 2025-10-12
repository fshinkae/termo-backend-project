-- Execute este script no SQL Editor do Supabase

CREATE TABLE "Users" (
  "User_id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "Nickname" VARCHAR(255) NOT NULL,
  "Email" VARCHAR(255) UNIQUE NOT NULL,
  "Password" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON "Users"("Email");

