<!-- # Build mysql service image
# in ./MySQL_docker
docker build -t meal-order-mysql . --no-cache

# Build backend service image
# in ./backend
docker build -t meal-order-backend . --no-cache

# Build backend service image
# in ./frontend2
docker build -t meal-order-frontend . --no-cache -->


# 1. create .env file under Meal-Order(./), and copy the environment variables from backend/.env & frontend2/.env

# 2. build backend
## under Meal-Order/backend
docker build -t meal-order-backend . --no-cache

# 3. create and start services -> run backend (currently, only backend is run with image)
## under Meal-Order
docker compose up

# 4. run frontend
## under Meal-Order/frontend2
npm start

# stop all the services
docker compose down