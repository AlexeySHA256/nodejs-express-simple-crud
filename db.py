import sys

import faker
import psycopg


class DBManager:
    def __init__(self, conn: psycopg.Connection):
        self.conn = conn
        self.faker = faker.Faker()

    def init_db(self):
        with open("init_db.sql", "r") as f:
            sql = f.read()
            self.conn.execute(sql)

    def fill_db_with_test_data(self) -> None:
        num_authors = num_posts = 1000
        authors_ids = []
        with self.conn.cursor() as cur:
            for _ in range(num_authors):
                cur.execute(
                    "INSERT INTO authors (first_name, last_name) VALUES (%s, %s) RETURNING id",
                    (self.faker.first_name(), self.faker.last_name()),
                )
                authors_ids.append(cur.fetchone()[0])
            cur.executemany(
                "INSERT INTO posts (title, body, author_id) VALUES (%s, %s, %s)",
                [
                    (self.faker.sentence(), self.faker.paragraph(), authors_ids[i])
                    for i in range(num_posts)
                ],
            )
            self.conn.commit()


if __name__ == "__main__":
    db_url = sys.argv[1]
    with psycopg.connect(db_url) as conn:
        db = DBManager(conn)
        db.init_db()
        db.fill_db_with_test_data()
