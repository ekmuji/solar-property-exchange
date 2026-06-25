# Solar Property Exchange (SPX)

A fractional energy ownership marketplace. Warehouses are listed not just as
rentable space, but as micro-energy assets: solar generation capacity,
battery storage, EV charging rights, and tradable electricity, all sold and
leased through one platform.

This repo is a **starter codebase**, not a finished product. It implements
the real architecture (Next.js front end, NestJS API, Postgres/PostGIS,
Redis, WebSockets, Stripe Connect, Clerk) with working CRUD, a real
auction/bidding engine, a real energy-trading matching engine, and EV
charger booking — wired end to end — so there is a correct foundation to
build on rather than a UI mockup.

```
solar-property-exchange/
├── apps/
│   ├── web/   → Next.js 15 / React 19 / TypeScript frontend
│   └── api/   → NestJS / TypeScript backend
├── docker-compose.yml   → Postgres (PostGIS) + Redis
└── package.json         → npm workspaces root
```

## Stack

| Layer       | Choice                                              |
|-------------|------------------------------------------------------|
| Frontend    | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, custom shadcn-style UI kit, Mapbox GL, Zustand, TanStack Query, Recharts |
| Backend     | NestJS, TypeScript, REST, Socket.IO                  |
| Database    | PostgreSQL + PostGIS, Prisma ORM                      |
| Cache/Pub-Sub | Redis                                               |
| Auth        | Clerk                                                 |
| Payments    | Stripe Connect                                        |
| Storage     | AWS S3 (presigned uploads)                            |
|Testing	    | Jest, React Testing Library, ts-jest                  |
| Hosting     | AWS ECS Fargate (see `apps/api/Dockerfile`, `apps/web/Dockerfile`) |

## Quick start

### 1. Infra

```bash
cp .env.example .env
docker compose up -d        # Postgres+PostGIS on 5432, Redis on 6379
```

### 2. API

```bash
cd apps/api
cp .env.example .env        # fill in DATABASE_URL, STRIPE_*
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev           # http://localhost:4000
```

### 3. Web

```bash
cd apps/web
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_API_URL, Clerk keys
npm install
npm run dev                  # http://localhost:3000
```

## 4. Run the Full Stack

From the root directory of the workspace, you can boot both the frontend and backend simultaneously:

```bash
npm install          # Install root dependencies (concurrently)
npm run dev          # Boots API on :4000 and Web on :3000
```

### Optional Services

The application can run locally without any third-party accounts.

Free-tier accounts are only required if you want to enable:

* **Clerk** – Authentication and user management
* **Stripe Connect** – Payment processing and marketplace payouts

Without these services configured, the platform still supports:

* Warehouse listings
* Unit management
* Energy shares
* Auctions
* Energy trading
* EV charger booking
* Real-time WebSocket updates

Authentication and payment capture will simply be disabled.

### Maps

The map interface uses **MapLibre GL** with **Carto Dark Matter** basemaps and requires **no API keys**.

---

## Testing

Both applications come pre-configured with Jest test suites.

Run tests from the repository root:

```bash
npm run test --workspace=apps/api   # Backend service tests
npm run test --workspace=apps/web   # Frontend component tests
```

To run all tests:

```bash
npm test
```


## What's implemented

- **Property**: warehouses, units, PostGIS-backed "within N miles" search, live
  availability (unit status flips automatically free up the listing — no
  manual republish step).
- **Energy**: solar assets, fractional energy shares, share purchase, an
  ownership dashboard (shares owned, kWh entitlement, revenue).
- **Trading**: internal electricity order book with a real price-time
  matching engine (sellers/buyers matched on price, partial fills supported),
  broadcast over WebSocket.
- **Auctions**: energy-share auctions with bid validation (must beat current
  high bid), live countdown, WebSocket broadcast of new highest bid to every
  connected client.
- **EV**: charger inventory, live availability, reservation creation,
  charging-session cost calculation (solar % blend pricing).
- **Payments**: Stripe Connect onboarding stub + PaymentIntent creation for
  share purchases and charging sessions.
- **Auth/RBAC**: Clerk JWT verification, role guard (`owner`, `tenant`,
  `investor`, `driver`, `admin`).

## What's intentionally stubbed

AI forecasting (solar/price prediction), weather/PVGIS integrations, SMS/email
notifications, and the mobile app are out of scope for a starter — each gets
a `// TODO` at its integration point in the service layer (see
`apps/api/src/energy/solar-assets.service.ts` for an example) so it's clear
where to wire a real model or third-party API in.

## Database schema

See `apps/api/prisma/schema.prisma` — it mirrors the PRD's table list
(`users`, `warehouses`, `warehouse_units`, `solar_assets`, `energy_shares`,
`energy_trades`, `ev_chargers`, `charging_sessions`, `auctions`, `bids`) with
proper foreign keys, enums for status fields, and a PostGIS `geography`
column on `warehouses` for radius search.

---

## Skills Demonstrated

The Solar Property Exchange (SPX) project was intentionally designed to cover a broad range of modern full-stack software engineering skills. Below is a breakdown of the technologies and concepts actively used throughout the codebase.

### ✅ Fully Covered

#### TypeScript

Used extensively across both the frontend and backend.

Examples include:

* NestJS services and controllers
* DTOs and validation
* Prisma models and database access
* React components and hooks
* Shared application types

#### React + Next.js

The frontend is built with:

* Next.js 15 (App Router)
* React 19
* TypeScript
* Zustand
* TanStack Query

The project demonstrates:

* Client and Server Components
* Dynamic routing
* State management
* Data fetching and caching
* Modern React development patterns

#### SQL / PostgreSQL

The application uses PostgreSQL as its primary database.

Examples include:

* Relational database design
* Prisma ORM
* Migrations and seeding
* Complex queries
* Spatial search using PostGIS

The platform implements geographic warehouse searches using PostGIS functions such as:

```sql
ST_DWithin(...)
```

#### Docker

Containerisation is used throughout development.

Examples include:

* PostgreSQL containers
* Redis containers
* Docker Compose orchestration
* Application Dockerfiles for deployment

Infrastructure is managed through:

```bash
docker compose up -d
```

#### Git & GitHub

Development follows standard Git workflows including:

* Feature branches
* Commit conventions
* Pull requests
* Repository documentation
* Monorepo project structure

#### Automated Testing

Automated testing is implemented across both frontend and backend applications.

Examples include:

- Jest unit tests
- Service-layer testing
- Component testing
- API testing
- Repeatable test execution through npm scripts

Run tests using:

```bash
npm run test --workspace=apps/api
npm run test --workspace=apps/web
```
---

### 🟡 Partially Covered / Implicit

#### Cloud (AWS)

The project architecture is designed for deployment on AWS.

Planned services include:

* ECS Fargate
* RDS PostgreSQL
* ElastiCache Redis
* S3 object storage
* CloudFront CDN

While the application is deployment-ready, infrastructure-as-code tooling such as Terraform or CloudFormation has not yet been implemented.

#### Linux

The project uses many Linux and Unix-style development concepts, including:

* Command-line workflows
* Docker container management
* Environment variables
* Process management
* Development tooling

Although advanced system administration and shell scripting are not a major focus, the project provides practical exposure to Linux-based development environments.

---

### 📈 Future Skills Expansion

Future roadmap items can extend the project into additional domains:

#### Networking Fundamentals

Potential additions:

* Reverse proxies
* Nginx configuration
* Load balancing
* TLS certificates
* DNS management

#### CI/CD

Potential additions:

* GitHub Actions
* Automated testing
* Automated deployments
* Container publishing

#### Kubernetes

Potential additions:

* Kubernetes manifests
* Helm charts
* ECS-to-Kubernetes migration
* Horizontal scaling

#### Python

Potential additions:

* Solar generation forecasting
* Energy demand prediction
* Machine learning services
* Analytics pipelines

#### AI Application Development

Potential additions:

* Retrieval-Augmented Generation (RAG)
* LLM-powered property search
* Energy market insights
* Intelligent investment recommendations
* Portfolio analytics assistants
