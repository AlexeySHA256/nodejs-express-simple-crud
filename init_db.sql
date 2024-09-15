-- Скрипт который надо исполнить для воссоздания отношений в новой бд

CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    description TEXT DEFAULT '',
    UNIQUE(name, date)
);

CREATE INDEX IF NOT EXISTS events_name_idx ON events(name);