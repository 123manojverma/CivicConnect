# CivicConnect Backend

CivicConnect is a community-support platform backend that connects citizens, NGOs, and local government workflows. It provides APIs for reporting civic issues, tracking resolution, offering and claiming donations, discovering NGOs, commenting on issues, receiving notifications, uploading images, and using AI-assisted text generation and chat.

> **Repository:** [CivicConnect](https://github.com/Anurag07-07/CivicConnect)  
> **Backend directory:** [Backend](https://github.com/Anurag07-07/CivicConnect/tree/main/Backend)

## Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Request and Response Examples](#request-and-response-examples)
- [Error Handling and Logging](#error-handling-and-logging)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

CivicConnect aims to make local community support and civic participation easier through one platform. Its backend exposes versioned REST APIs and stores application data in MongoDB.

The system supports two broad workflows:

1. **Community support:** citizens can offer useful items such as food, clothing, and other essentials. NGOs can browse and claim available donations.
2. **Civic issue reporting:** users can create issues associated with a ward, view issues, upvote them, comment, and participate in community verification when an issue is marked complete.

The backend also includes NGO discovery, profile management, notifications, image uploads, and Gemini-powered AI utilities.

## Core Features

### Civic issue management
- Create and retrieve civic issues.
- Retrieve issues by ward or NGO.
- Upvote issues.
- Update an issue's status.
- Allow an authenticated government workflow to mark an issue complete.
- Record community votes on completion.

### Donations and community support
- Create a donation offer with a category, title, description, quantity, ward, and address.
- Browse available donations, optionally filtered by ward.
- View donations created by the current user.
- Claim, complete, or cancel a donation.

### Authentication and profiles
- Register and log in.
- Store the authentication token in an HTTP-only cookie.
- Retrieve the current user's profile.
- Update supported profile fields.
- Log out by clearing the authentication cookie.

### NGO discovery
- List NGOs.
- Find nearby NGOs using longitude and latitude, with optional distance and category filters.
- Retrieve an NGO profile.

### Comments and notifications
- Add comments to civic issues and retrieve existing comments.
- Retrieve notifications for the authenticated user.
- Check the unread notification count.
- Mark notifications as read.

### AI utilities
- Generate a civic issue description from a title, category, and location.
- Send a message to the Gemini-powered chat endpoint.

### Image uploads
- Upload multiple images through the API.
- Images are sent to Cloudinary under the `civicconnect/issues` folder.
- The upload middleware accepts up to five images per request, with a 10 MB per-file limit.

## Technology Stack

| Technology | Purpose |
| --- | --- |
| Node.js | JavaScript runtime |
| TypeScript | Type-safe application code |
| Express 5 | HTTP API and routing |
| MongoDB | Application data storage |
| Mongoose | MongoDB object modeling |
| JSON Web Token (JWT) | Token-based authentication |
| bcrypt | Password hashing dependency |
| cookie-parser | Reading authentication cookies |
| CORS | Configurable cross-origin requests |
| Zod | Request validation |
| Cloudinary | Image storage |
| Multer | Multipart image upload handling |
| Google Generative AI SDK | Gemini-powered AI features |
| Socket.IO | Real-time communication dependency |
| Winston | Application logging |
| winston-daily-rotate-file | Rotating log files |
| dotenv | Environment variable loading |
| ts-node / Nodemon | TypeScript execution and development reloads |

Some packages are present as dependencies; their inclusion does not necessarily mean every package is used by every request path.

## How It Works

At a high level, an API request follows this flow:

```text
Client / Frontend
       |
       v
Express server (CORS, JSON body, cookies)
       |
       v
Versioned router (/api/v1 or /api/v2)
       |
       v
Authentication / validation middleware (where configured)
       |
       v
Controller
       |
       v
Service layer
       |
       v
Repository / Mongoose model
       |
       v
MongoDB or external service
       |
       v
JSON response
```

The code is separated into routing, controllers, services, repositories, models, validators, middleware, and configuration to keep HTTP handling and business logic organized.

## Project Structure

```text
Backend/
├── src/
│   ├── config/
│   │   ├── db.ts                 # MongoDB connection
│   │   ├── index.ts              # Environment configuration
│   │   └── logger.config.ts      # Winston logger setup
│   ├── controllers/              # HTTP request handlers
│   ├── dto/                      # Data types and enums
│   ├── middlewares/
│   │   ├── authMiddleware.ts     # Token authentication
│   │   ├── correlation.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/                   # Mongoose data models
│   ├── repo/                     # Database access helpers
│   ├── routers/
│   │   ├── v1/                   # Version 1 API routes
│   │   └── v2/                   # Version 2 API routes
│   ├── services/                 # Business logic and integrations
│   ├── utils/                    # Shared helpers and application errors
│   ├── validators/               # Request validation schemas
│   └── server.ts                 # Application entry point
├── package.json
├── package-lock.json
└── tsconfig.json
```

## Prerequisites

Install the following before running the backend:

- Node.js (a current LTS version is recommended)
- npm
- MongoDB locally, or a MongoDB Atlas connection string
- Cloudinary credentials for image uploads
- A Google Gemini API key for AI endpoints

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Anurag07-07/CivicConnect.git
cd CivicConnect/Backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Create a `.env` file inside the `Backend` directory. Configure the variables described below.

### 4. Start MongoDB

Make sure your local MongoDB instance is running, or set `MONGO_URL` to your MongoDB Atlas connection string.

### 5. Run the backend

```bash
npm run dev
```

By default, the server uses port `3001` and the frontend origin `http://localhost:3000`.

## Environment Variables

Configure these variables in `Backend/.env`:

| Variable | Required for | Description |
| --- | --- | --- |
| `PORT` | Server | Port on which the API listens. Defaults to `3001`. |
| `MONGO_URL` | Database | MongoDB connection URI. The code defaults to `mongodb://localhost:27017`; set a database-specific URI for your environment. |
| `JWT_SECRET` | Authentication | Secret used to sign/verify JWTs. Set a long, random value outside local development. |
| `CLIENT_URL` | Browser access | Allowed frontend origin for CORS. Defaults to `http://localhost:3000`. |
| `CLOUDINARY_CLOUD_NAME` | Image uploads | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | Image uploads | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | Image uploads | Cloudinary API secret. |
| `GEMINI_API_KEY` | AI endpoints | Google Gemini API key. |

Example local configuration:

```dotenv
PORT=3001
MONGO_URL=mongodb://127.0.0.1:27017/civicconnect
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key
```

Use your own credentials. Do not commit `.env` or real API keys to GitHub. The repository currently has fallback values in configuration for some variables; explicitly set secrets in your environment rather than relying on those defaults.

## Running the Server

### Development

```bash
npm run dev
```

Runs `src/server.ts` using Nodemon so the server can restart during development.

### Start command

```bash
npm start
```

Runs `src/server.ts` through ts-node.

The server connects to MongoDB during startup. If the database connection fails, startup exits with an error.

## API Reference

All routes below are mounted under **`/api/v1`**, unless otherwise stated. Routes marked **Auth** require a valid authentication token in the cookie expected by the backend.

### Health and ping

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/ping/health` | No | Simple health check; returns `OK`. |
| GET | `/api/v1/ping` | No | Ping endpoint with request validation. |

### Authentication and profile

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | No | Register a user. |
| POST | `/api/v1/auth/login` | No | Log in and set the authentication cookie. |
| POST | `/api/v1/auth/logout` | No | Clear the authentication cookie. |
| GET | `/api/v1/auth/me` | Yes | Get the current user's profile. |
| PUT | `/api/v1/auth/profile` | Yes | Update supported profile fields. |

Profile updates allow the following fields when supplied: `phone`, `organizationName`, `wardId`, `categories`, `location`, and `avatar`.

### Civic issues

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/issue/create` | Yes | Create an issue. |
| GET | `/api/v1/issue/:id` | No | Retrieve an issue by ID. |
| GET | `/api/v1/issue/ward/:wardId` | No | Retrieve issues for a ward; supports a `status` query parameter. |
| GET | `/api/v1/issue/ngo/:ngoId` | No | Retrieve issues associated with an NGO. |
| PATCH | `/api/v1/issue/:id/upvote` | Yes | Upvote an issue. |
| PATCH | `/api/v1/issue/:id/status` | Yes | Update issue status. |
| PATCH | `/api/v1/issue/:id/gov-complete` | Yes | Mark an issue complete and trigger community verification. |
| POST | `/api/v1/issue/:id/vote-completion` | Yes | Submit a completion vote. |

### Donations

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/donation` | Yes | Create a donation offer. |
| GET | `/api/v1/donation/available` | Yes | List available donations; optional `wardId` query parameter. |
| GET | `/api/v1/donation/my` | Yes | List the current user's donations. |
| PATCH | `/api/v1/donation/:id/claim` | Yes | Claim a donation. |
| PATCH | `/api/v1/donation/:id/complete` | Yes | Mark a donation as completed. |
| DELETE | `/api/v1/donation/:id` | Yes | Cancel/remove a donation. |

### NGOs

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/ngo/all` | No | List NGOs. |
| GET | `/api/v1/ngo/nearby` | No | Find nearby NGOs. |
| GET | `/api/v1/ngo/:ngoId` | No | Retrieve an NGO profile. |

The nearby endpoint accepts query parameters `longitude` and `latitude`; `maxDistance` is optional and defaults to 10,000 metres in the controller; `category` is optional.

Example:

```http
GET /api/v1/ngo/nearby?longitude=77.5946&latitude=12.9716&maxDistance=10000&category=food
```

### Comments

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/comment/:issueId` | No | Retrieve comments for an issue. |
| POST | `/api/v1/comment/:issueId` | Yes | Add a comment to an issue. |

### Notifications

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/notification` | Yes | Get notifications for the current user. |
| GET | `/api/v1/notification/unread-count` | Yes | Get the unread notification count. |
| PATCH | `/api/v1/notification/mark-read` | Yes | Mark all notifications as read. |

### Image uploads

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/upload/images` | No route-level auth middleware | Upload up to five images using multipart form data. |

Use the multipart field name **`images`**. The upload handler returns the resulting image URLs. Although this route has no authentication middleware attached in its router, production deployments should consider whether uploads should be restricted.

### AI endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/ai/generate-description` | No | Generate an issue description using a title, category, and optional location. |
| POST | `/api/v1/ai/chat` | No | Send a message and optional context to the AI chat service. |

### API version 2

The server mounts a router at `/api/v2`. Check the current `src/routers/v2` implementation for available endpoints; the current index router is a placeholder and does not define feature routes.

## Authentication

The authentication controllers set a cookie named `token` after successful registration or login. Its value is prefixed with `Bearer ` and the cookie is configured as HTTP-only, with a seven-day max age and `sameSite: 'lax'`.

For browser-based requests, configure the frontend to send credentials and ensure the frontend origin matches `CLIENT_URL`. The server enables credentialed CORS for the configured client origin.

Example using fetch:

```javascript
const response = await fetch("http://localhost:3001/api/v1/auth/me", {
  method: "GET",
  credentials: "include"
});

const result = await response.json();
console.log(result);
```

Registration and login request bodies depend on the DTOs and validators in `src/dto` and `src/validators`. Refer to those source files for the exact required fields.

## Request and Response Examples

### Health check

```bash
curl http://localhost:3001/api/v1/ping/health
```

Expected response body:

```text
OK
```

### Register or log in

Send JSON to the appropriate authentication endpoint. The exact body schema is defined by the backend's auth DTO and service code.

```bash
curl -i -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"your-password"}'
```

The server returns a JSON response and sets the `token` cookie on successful login. Use the field names required by the current auth validator/service if they differ from this example.

### Browse available donations

```bash
curl -i "http://localhost:3001/api/v1/donation/available?wardId=YOUR_WARD_ID" \
  -H "Cookie: token=Bearer%20YOUR_JWT"
```

In a browser client, prefer `credentials: "include"` rather than manually setting the Cookie header.

### Generate an issue description

```bash
curl -X POST http://localhost:3001/api/v1/ai/generate-description \
  -H "Content-Type: application/json" \
  -d '{"title":"Broken streetlight","category":"Infrastructure","location":"Ward 12"}'
```

Example response shape:

```json
{
  "success": true,
  "description": "Generated description returned by the AI service."
}
```

The generated text varies depending on the model response and input.

## Error Handling and Logging

- The application registers centralized application and generic error middleware.
- Application-specific errors are defined under `src/utils/errors`.
- A correlation-ID middleware is attached to incoming requests to help associate logs with requests.
- Winston is configured for application logging, with daily log rotation available through the installed logging package.
- Successful responses generally use a JSON object containing a `success` flag and data or message fields. Exact response shapes vary by endpoint.

## Security Notes

Before deploying publicly:

1. Set a strong, unique `JWT_SECRET` through your hosting provider's environment settings. Do not use a fallback/default secret in production.
2. Never commit real MongoDB credentials, Cloudinary secrets, or Gemini keys.
3. Restrict `CLIENT_URL` to the intended frontend origin.
4. Review upload access, file validation, file sizes, and rate limiting before exposing the upload and AI endpoints publicly.
5. Validate and authorize state-changing actions server-side; do not trust a client-supplied user ID when the authenticated identity can be derived from the token.
6. Use HTTPS in production and configure cookie security attributes appropriately for the deployment environment.
7. Review permissions for issue status updates, completion voting, and donation claiming so each user role can perform only authorized actions.
8. Avoid logging secrets or sensitive personal data.

This README documents the current routes and configuration; it is not a security audit.

## Troubleshooting

### MongoDB connection fails
- Confirm that MongoDB is running or that the Atlas URI is correct.
- Check network access rules and credentials for Atlas.
- Confirm `MONGO_URL` is set in the backend environment.
- The server exits if the database connection fails.

### Frontend requests fail due to CORS
- Set `CLIENT_URL` to the exact frontend origin, including protocol and port.
- Ensure browser requests that use cookie authentication include credentials.

### AI endpoints fail
- Check that `GEMINI_API_KEY` is configured and valid.
- Confirm the selected model/API is available to the key.

### Image upload fails
- Verify all Cloudinary environment variables.
- Send multipart form data using the field name `images`.
- Keep each file within the configured 10 MB limit and send no more than five files per request.

### Port is already in use
- Change `PORT` in the `.env` file and restart the backend.

## Contributing

Contributions and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change and test it locally.
4. Keep secrets out of commits.
5. Open a pull request with a clear description of the change.

When changing an API, update this README so the endpoint documentation remains accurate.

## Team

Built for the CivicConnect project and hackathon.

---

For the complete application, visit the [CivicConnect repository](https://github.com/Anurag07-07/CivicConnect).
