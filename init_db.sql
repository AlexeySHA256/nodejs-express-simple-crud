-- Скрипт который надо исполнить для воссоздания отношений в новой бд

CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    description TEXT DEFAULT '',
    UNIQUE(name, date)
);

CREATE INDEX IF NOT EXISTS events_name_idx ON events(name);

CREATE OR REPLACE FUNCTION posts_on_update() RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS authors (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL
);

CREATE OR REPLACE FUNCTION fullname(a authors) RETURNS TEXT AS $$
    SELECT CONCAT(a.first_name, ' ', a.last_name);
$$ LANGUAGE sql;

CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    author_id INT REFERENCES authors(id),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE TRIGGER posts_on_update_trigger BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE PROCEDURE posts_on_update();

CREATE OR REPLACE VIEW posts_v AS 
    SELECT p.id, p.title, p.body, p.updated_at, p.created_at, a.fullname as author from posts p
    JOIN authors a ON (p.author_id = a.id);