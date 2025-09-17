DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public;

SET search_path = public;

CREATE TABLE users (
    id serial PRIMARY KEY,
    email varchar(100) UNIQUE NOT NULL,
    password varchar(255) NOT NULL,
    account_type varchar(255) NOT NULL,
    refresh_token text,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    verification_token text UNIQUE,
    new_password_token text UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
