# DoLeSaiGon — Vietnamese Fruit & Gift Basket E-Commerce

A full-stack e-commerce platform for selling premium Vietnamese fruit baskets and gift items, with AI-powered product consultation, VietQR payment integration, and GHN shipping.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser (React 19)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │
│  │  Shop /  │ │  Cart /  │ │  Admin   │ │  AI Chat Widget    │ │
│  │ Products │ │ Checkout │ │Dashboard │ │  (Nova Chat)       │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────────┬──────────┘ │
└───────┼─────────────┼────────────┼──────────────────┼───────────┘
        │             │            │                  │
        ▼             ▼            ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Spring Boot 3.5 (port 8080)                    │
│                                                                 │
│  /api/ver0.0.1/product   /api/order   /api/cart   /api/chat    │
│  /api/auth               /api/user    /api/staff  /api/payment │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Services: Product · Order · Cart · Payment · Shipping   │  │
│  │           Email · Embedding · Recommendation · Invoice   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Repositories (Spring Data JPA)  →  SQL Server (MSSQL)  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────┬───────────────────┘
              │                               │
    ┌─────────▼──────────┐       ┌────────────▼──────────────────┐
    │  LM Studio         │       │  External Services            │
    │  (127.0.0.1:1234)  │       │                               │
    │  Local AI Chat     │       │  · Casso / VietQR (payments)  │
    │                    │       │  · GHN API (shipping)         │
    │  Ollama            │       │  · Cloudinary (images)        │
    │  (localhost:11434) │       │  · Postmark / Mailgun (email) │
    │  nomic-embed-text  │       │  · N8N (payment webhooks)     │
    └────────────────────┘       └───────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 6, Recharts, React Icons |
| Backend | Spring Boot 3.5, Java 21, Maven |
| Database | Microsoft SQL Server + Liquibase migrations |
| Local AI Chat | LM Studio (OpenAI-compatible API) |
| Product Embeddings | Ollama (`nomic-embed-text`) |
| Payments | Casso (VietQR / bank transfer) |
| Shipping | GHN (Giao Hàng Nhanh) API |
| Images | Cloudinary CDN |
| Email | Postmark, Mailgun |
| PDF | OpenHTML to PDF (invoices) |

---

## Prerequisites

- **Java 21**
- **Maven 3.8+** (or use the included `mvnw` wrapper)
- **Node.js 18+** and **npm**
- **Microsoft SQL Server** — instance named `DOLESAIGON`, database `DOLESAIGON`
- **LM Studio** — for AI chat (download at [lmstudio.ai](https://lmstudio.ai))
- **Ollama** *(optional)* — for product recommendation embeddings

---

## How to Run

### 1. Database

Create the SQL Server database and instance before starting:

```sql
CREATE DATABASE DOLESAIGON;
```

Liquibase will automatically create all tables on first startup.

### 2. Environment Variables

Create a `.env` file in the project root (same level as `pom.xml`):

```env
# Email
MAIL_HOST=smtp.postmarkapp.com
MAIL_PORT=587
MAIL_USERNAME=your-postmark-token
MAIL_PASSWORD=your-postmark-token

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Casso payment (optional)
CASSO_API_KEY=your-casso-key

# GHN shipping (optional)
GHN_TOKEN=your-ghn-token
GHN_SHOP_ID=your-shop-id
```

### 3. LM Studio (AI Chat)

1. Download and open **LM Studio**
2. Load any chat model (e.g. Llama 3, Qwen, Mistral)
3. Go to **Local Server** tab → click **Start Server**
4. Server runs at `http://127.0.0.1:1234` by default

> The backend calls `http://127.0.0.1:1234/v1/chat/completions` — both Spring Boot and LM Studio run on the same machine, so no internet is needed for chat.

### 4. Backend

```bash
# From project root (where pom.xml is)
./mvnw spring-boot:run
```

Or with Maven installed:

```bash
mvn spring-boot:run
```

Backend starts at **http://localhost:8080**

### 5. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend starts at **http://localhost:3000** and proxies API calls to `localhost:8080`.

### 6. Ollama (optional — for product recommendations)

```bash
ollama pull nomic-embed-text
ollama serve
```

Runs at `http://localhost:11434`. Without it, the product recommendation feature will not work but everything else functions normally.

---

## Production Build (Frontend)

```bash
cd frontend
npm run build
```

The `build/` folder is served by the Spring Boot backend as static files (via `SpaController`), so a single JAR serves both frontend and backend.

Alternatively, use the included **Dockerfile** in `frontend/` to build a container with Caddy:

```bash
cd frontend
docker build -t dolesaigon-frontend .
docker run -p 80:80 dolesaigon-frontend
```

---

## Project Structure

```
Doanlesg/
├── src/main/java/com/example/Doanlesg/
│   ├── controller/          # 16 REST controllers
│   │   ├── ChatProxyController.java   # AI chat → LM Studio
│   │   ├── OrderController.java
│   │   ├── PaymentController.java
│   │   ├── CassoWebhookController.java
│   │   └── ...
│   ├── services/            # 22 business logic services
│   │   ├── EmbeddingService.java      # Ollama embeddings
│   │   ├── RecommendationService.java # Cosine similarity recommendations
│   │   ├── GhnApiService.java         # Shipping
│   │   ├── InvoiceService.java        # PDF invoices
│   │   └── ...
│   ├── model/               # 18 JPA entities
│   ├── repository/          # 12 Spring Data JPA repositories
│   ├── dto/                 # 20+ Data Transfer Objects
│   └── config/              # App configuration
│
├── src/main/resources/
│   ├── application.properties
│   └── db/changelog/        # 14 Liquibase migration files
│
└── frontend/
    ├── src/
    │   ├── App.js                     # Root component + all routes
    │   ├── components/common/
    │   │   └── AIChatWidget.js        # Nova AI chat widget
    │   ├── components/                # 24 page components
    │   ├── managements/               # 10 admin dashboard modules
    │   └── contexts/                  # Auth, Cart, Notification state
    ├── Dockerfile                     # Multi-stage: Node → Caddy
    └── Caddyfile
```

---

## Key Features

- **Product catalog** with category filtering and keyword search
- **Shopping cart** — persistent for logged-in users, guest cart for visitors
- **VietQR payments** via Casso with real-time bank transfer verification
- **GHN shipping** — live cost calculation and order tracking
- **AI chat** — product consultation powered by a local LM Studio model (no cloud, no token cost)
- **Product recommendations** — cosine similarity on Ollama vector embeddings
- **Admin dashboard** — manage products, orders, customers, staff, warehouse, and delivery
- **PDF invoices** generated on order completion
- **Email notifications** via Postmark / Mailgun
- **Image CDN** via Cloudinary

---

## AI Chat — How It Works

```
User message
    ↓
AIChatWidget.js  →  POST /api/chat/consult  (with full product list)
    ↓
ChatProxyController.java
    · Filters in-stock products, scores by keyword relevance, keeps top 15
    · Builds system prompt (Vietnamese sales assistant rules)
    · Calls POST http://127.0.0.1:1234/v1/chat/completions  (LM Studio)
    · Parses JSON response { reply, recommendations, intent }
    · Injects product SKU by matching recommendation names to catalog
    ↓
AIChatWidget.js  →  renders reply text + clickable product cards
```

The AI model never returns SKUs — the backend matches recommended product names back to the catalog and injects the SKU silently for navigation links.
