It's a simple nodejs project made using framework express.js with basic crud operations on events and modular architecture.

### Stack
- Express.js (+validation using express-validator)
- Docker (dockerfile and docker compose with 2 services - app and postgres cluster)
- Git
- Postgres (using it for crud operations on database)


### How to run it:
1. Clone into your directory from git:
  ```bash
  git clone https://github.com/AlexeySHA256/nodejs-express-simple-crud
  ```
2. Go to clonned directory
  ```bash
  cd nodejs-express-simple-crud
  ```
3. Create .env file and fill it following by .env.example
  ```bash
  touch .env
  ```
4. Run docker compose with build option
  ```bash
  docker compose up --build
  ```
5. Add database relations
  ```bash 
  docker exec -it dates_db psql -U postgres
  ```
6. Copy and paste script from init_db.sql to your psql shell
