# 🔐 Mini Verifiable Credential Wallet

A simple Verifiable Credential Wallet application that allows users to issue, manage, share, and verify digital credentials following W3C standards.

## 🚀 Features

- **Issue Credentials**: Create verifiable credentials using predefined templates (Gym Membership, Employee ID, Certificate) or custom fields
- **View & Manage**: Browse all credentials with detailed views and expiration tracking
- **Share Credentials**: Copy as JWT, JSON, or shareable verification link
- **Verify Credentials**: Validate credentials shared by others with real-time verification
- **Digital Signatures**: Ed25519 (EdDSA) cryptographic signing for credential integrity
- **Persistent Storage**: File-based storage that survives restarts
- **API Documentation**: Interactive Swagger/OpenAPI docs

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | NestJS 11, TypeScript |
| **Frontend** | React 19, Vite, TypeScript |
| **Styling** | TailwindCSS v4 |
| **Cryptography** | jose (JWT/JWS with Ed25519) |
| **Container** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |
| **Testing** | Jest |

## 📁 Project Structure

```
spherity/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── backend/
│   ├── src/
│   │   ├── credentials/        # Credential CRUD operations
│   │   ├── crypto/             # JWT signing & verification
│   │   └── storage/            # File-based persistence
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── services/           # API client
│   │   └── types/              # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Development compose
└── README.md
```

## 🏃 Getting Started

### Prerequisites

- Node.js 20+
- npm
- Docker & Docker Compose (for containerized deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spherity
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Start Backend**
   ```bash
   cd backend
   npm run start:dev
   ```
   - Backend API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api/docs

5. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   - Frontend: http://localhost:5173

### 🐳 Docker Deployment

**Production Build:**
```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access Points:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api` | Health check |
| `POST` | `/api/credentials` | Issue a new credential |
| `GET` | `/api/credentials` | List all credentials |
| `GET` | `/api/credentials/:id` | Get credential by ID |
| `DELETE` | `/api/credentials/:id` | Delete a credential |
| `POST` | `/api/credentials/verify` | Verify a JWT credential |

### Example: Issue a Credential

```bash
curl -X POST http://localhost:3000/api/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "type": "GymMembership",
    "claims": {
      "memberName": "John Doe",
      "membershipType": "Premium",
      "validUntil": "2025-12-31"
    }
  }'
```

### Example: Verify a Credential

```bash
curl -X POST http://localhost:3000/api/credentials/verify \
  -H "Content-Type: application/json" \
  -d '{
    "jwt": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..."
  }'
```

## 🔒 Credential Format

The application follows the W3C Verifiable Credentials data model:

```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "id": "urn:uuid:...",
  "type": ["VerifiableCredential", "GymMembershipCredential"],
  "issuer": "did:key:...",
  "issuanceDate": "2025-12-05T10:00:00Z",
  "credentialSubject": {
    "id": "did:example:holder",
    "memberName": "John Doe",
    "membershipType": "Premium",
    "validUntil": "2025-12-31"
  }
}
```

## 🧪 Running Tests

```bash
# Backend tests
cd backend
npm run test

# Test with coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📚 API Documentation

Interactive API documentation is available via Swagger UI:
- **Local**: http://localhost:3000/api/docs
- **Docker**: http://localhost:3000/api/docs

## 🔄 CI/CD

GitHub Actions workflow runs on push/PR to `main`:
- ✅ Linting
- ✅ Unit tests
- ✅ Build verification
- ✅ Docker image build

## 🏗️ Architecture Decisions

- **Ed25519 Signing**: Chosen for its security and performance characteristics
- **File-based Storage**: Simple persistence without database complexity
- **JWT Format**: Industry-standard format for credential proof
- **DID:key Method**: Self-resolving DIDs for issuer identification

## 📝 License

MIT

---

Built with ❤️ using NestJS & React
