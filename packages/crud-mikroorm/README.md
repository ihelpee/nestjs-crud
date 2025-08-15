# NestJS MikroORM - Project Documentation

This guide provides instructions for running a NestJS project that showcases the MikroORM Integration locally with Swagger API documentation and using Docker Compose to start the services.

## Prerequisites

Before proceeding, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14.x or above)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Step 1: Clone the Repository

If you don't have the project, start by cloning the repository:

```bash
git clone https://github.com/ihelpee/nestjs-crud
cd packages/crud-mikroorm


```markdown
# Step 2: Docker Compose Setup

The project includes a `docker-compose.yml` file to start the services (e.g., database, Redis, etc.) for your application.

1. Ensure you have Docker and Docker Compose installed.
2. Navigate to the project root directory (where the `docker-compose.yml` file is located).

Run the following command to start the services defined in `docker-compose.yml`:

```bash
docker-compose up


```markdown
# Step 3: Install Dependencies

Now that the services are running, install all necessary dependencies for the project:

```bash
npm install

```markdown
# Step 4: Start the Application

To start the application and access the Swagger UI, run:

```bash
npm run start

```markdown
# Step 5: Create the Users Table

To create the users table, please run the following command in TablePlus:

```sql
DROP TABLE IF EXISTS "public"."users"

CREATE TABLE "public"."users" (
    "id" SERIAL PRIMARY KEY,
    "nameFirst" VARCHAR(255) NOT NULL,
    "nameLast" VARCHAR(255) NOT NULL
);

```markdown
# Step 6: Run the integration tests

To run the integration tests, you need to go to the root of the repository and run 

```bash
npm run test:mikro
