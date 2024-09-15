-- Скрипт который надо исполнить для воссоздания отношений в новой бд

CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    date TIMESTAMP NOT NULL,
    description TEXT
);

CREATE INDEX IF NOT EXISTS events_name_idx ON events(name);