run:
	docker compose up

initdb:
	/usr/local/bin/python3 db.py postgres://postgres:postgres@localhost:5432/mydb