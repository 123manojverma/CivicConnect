# CivicConnect Frontend

CivicConnect is a community-focused web application designed to bring citizens, NGOs, and government representatives together in one place. It helps people report local civic problems, follow their progress, find NGOs, and connect surplus essentials with people who need them.

This directory contains the **frontend web application**, built with Next.js, React, and TypeScript. It provides the user interface and communicates with the CivicConnect backend for authentication, issue management, donations, notifications, NGO discovery, and AI-assisted features.

- **Main repository:** https://github.com/Anurag07-07/CivicConnect
- **Backend documentation:** [Backend README](../Backend/README.md)
- **Frontend source:** https://github.com/Anurag07-07/CivicConnect/tree/main/frontend

## Contents

- [What does CivicConnect do?](#what-does-civicconnect-do)
- [Who is it for?](#who-is-it-for)
- [Main features](#main-features)
- [User workflows](#user-workflows)
- [Technology stack](#technology-stack)
- [Application structure](#application-structure)
- [Prerequisites](#prerequisites)
- [Installation and local setup](#installation-and-local-setup)
- [Environment variables](#environment-variables)
- [How the frontend connects to the backend](#how-the-frontend-connects-to-the-backend)
- [Application routes](#application-routes)
- [Running and building](#running-and-building)
- [Troubleshooting](#troubleshooting)
- [Security considerations](#security-considerations)
- [Contributing](#contributing)
- [Team](#team)

## What does CivicConnect do?

Many communities face two related challenges:

1. **Civic problems are difficult to report and follow up on.** Residents may notice issues such as broken streetlights, damaged roads, or sanitation problems, but need a clearer way to report them and track whether action is being taken.
2. **Useful items go unused while other people need them.** Food, clothes, and other essentials can often be shared with people who need them through NGOs and community organizations.

CivicConnect brings these activities into a shared digital platform. Citizens can report and discuss civic issues, while NGOs can discover available donations and coordinate their collection. Government-oriented screens support issue tracking and completion workflows.

The aim is to make community participation more accessible, improve visibility into local issues, and help direct useful resources where they are needed.

## Who is it for?

### Citizens
Citizens can create an account, report a civic issue, add details and images, view issues, upvote issues, participate in discussions, offer donations, discover nearby NGOs, and view notifications.

### NGOs
NGOs can browse available donations, claim items they can help distribute, track donation requests, and manage their organization profile and notifications.

### Government representatives
Government-oriented pages provide an interface for viewing civic issues, inspecting issue details, updating progress, and participating in the issue-completion workflow.

> Access to a frontend page is not, by itself, proof of authorization. The backend must enforce permissions for protected operations.

## Main features

### 1. Civic issue reporting and tracking
- Submit a civic issue with relevant details.
- Browse issues and open an issue's detail page.
- View issues associated with a ward.
- Upvote issues to show community interest.
- Read and add comments to issue discussions.
- Follow status changes and government completion workflows.

### 2. Donation sharing
- Citizens can offer items such as food, clothing, and other essentials.
- Donation information can include its title, category, description, quantity, ward, and address.
- NGOs can browse available donations and claim relevant offers.
- Donors and NGOs can use the completion workflow to keep donation status up to date.
- Donors can view their own donation activity and cancel an offer where appropriate.

### 3. NGO discovery and map
- Browse NGO information.
- Explore nearby NGOs through a map interface.
- Use location-based search inputs and available filters to find relevant organizations.

The map interface is built using Leaflet and React Leaflet. Browser location permissions and valid coordinates may be needed for location-based features.

### 4. Role-oriented dashboards
The frontend has separate experiences for citizens, NGOs, and government users, helping each audience find the pages relevant to its workflow.

### 5. Authentication and profile
- Register and log in.
- Maintain frontend authentication state through a shared authentication context.
- Access protected areas of the application.
- Update supported profile information where the relevant interface is available.

### 6. Notifications
Users can open their notifications area to review updates. The frontend connects to backend notification endpoints for retrieving notifications, checking unread counts, and marking notifications as read.

### 7. AI-assisted tools
The backend exposes Gemini-powered endpoints for generating issue descriptions and chat. Where connected in the UI, these can help users draft clearer issue descriptions or interact with the assistant.

### 8. Responsive, component-based interface
The UI is organized into Next.js pages and reusable React components. Tailwind CSS is used for styling, and Lucide React supplies interface icons.

## User workflows

### Workflow A: Report a civic issue

1. A citizen registers or logs in.
2. The citizen opens the issue-reporting page.
3. They enter the issue information and, where applicable, attach images or provide a location.
4. The frontend sends the report to the backend.
5. The issue can then be viewed and discussed by the community.
6. Government users can review the issue and update its status through the supported workflow.
7. When an issue is marked complete, the completion-verification workflow can collect community votes.

### Workflow B: Donate useful items

1. A citizen opens the donation page.
2. They provide information about the items they can share.
3. The donation is submitted to the backend.
4. An NGO browses available offers and claims a suitable donation.
5. The parties can update the donation status through the available completion or cancellation actions.

### Workflow C: Find an NGO

1. A user opens the NGO map or discovery page.
2. The frontend requests NGO data from the backend.
3. The user explores the available organizations and location information.
4. The user can use the displayed information to identify a relevant organization.

## Technology stack

| Technology | Purpose |
| --- | --- |
| Next.js 16 | Application framework, routing, and web rendering |
| React 19 | Component-based user interface |
| TypeScript | Type-safe application development |
| Axios | HTTP requests to the backend |
| Leaflet | Interactive maps |
| React Leaflet | React components for Leaflet maps |
| Tailwind CSS 4 | Utility-first styling |
| Lucide React | Interface icons |
| ESLint | Code linting |

## Application structure

The frontend uses the Next.js App Router. The main screens live under `app/`, while reusable components live under `components/`.

```text
frontend/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── citizen/
│   │   ├── donate/
│   │   ├── issues/
│   │   ├── ngo-map/
│   │   ├── notifications/
│   │   └── report/
│   ├── government/
│   │   ├── issues/
│   │   └── notifications/
│   ├── ngo/
│   │   ├── donations/
│   │   ├── notifications/
│   │   ├── profile/
│   │   └── requests/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── MapComponent.tsx
│   └── Sidebar.tsx
├── public/
├── next.config.ts
├── package.json
├── package-lock.json
└── tsconfig.json
```

### Important directories and files

- **`app/page.tsx`** — landing page.
- **`app/auth/`** — login and registration pages.
- **`app/citizen/`** — citizen-facing dashboard, issue, donation, NGO map, and notification pages.
- **`app/ngo/`** — NGO-facing dashboard, donation, request, profile, and notification pages.
- **`app/government/`** — government-oriented dashboard, issue management, and notification pages.
- **`app/context/AuthContext.tsx`** — shared authentication state.
- **`app/lib/api.ts`** — configured Axios client used for backend communication.
- **`components/MapComponent.tsx`** — reusable map interface.
- **`components/Sidebar.tsx`** — reusable sidebar navigation.
- **`app/globals.css`** — global styling.

## Prerequisites

Install:

- Node.js (a current LTS version is recommended)
- npm
- Git
- The CivicConnect backend and its required services for API-driven functionality

## Installation and local setup

### 1. Clone the repository

```bash
git clone https://github.com/Anurag07-07/CivicConnect.git
cd CivicConnect/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the backend URL

Create a `.env.local` file in the `frontend` directory. Set the URL for the running backend:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

The frontend's Axios client uses this value as its base URL. If the variable is not set, it falls back to `http://localhost:3001/api/v1`.

If the backend is hosted remotely, replace the local URL with the deployed backend's API v1 base URL. Do not add a trailing endpoint path such as `/auth/login` to this variable; the application appends API paths to the base URL.

### 4. Start the development server

```bash
npm run dev
```

### 5. Open the application

Visit [http://localhost:3000](http://localhost:3000).

For sign-in, issue reporting, donation workflows, notifications, and other API-backed screens, make sure the backend is running and its environment variables are configured.

## Environment variables

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API v1 | `http://localhost:3001/api/v1` |

Variables prefixed with `NEXT_PUBLIC_` are exposed to browser-side code. Only put public configuration such as the API base URL in this variable. Never put database credentials, JWT signing secrets, Cloudinary secrets, or private AI keys in frontend environment variables.

After changing environment variables, restart the Next.js development server.

## How the frontend connects to the backend

The shared Axios client is defined in `app/lib/api.ts`.

- Its base URL comes from `NEXT_PUBLIC_API_URL`, with a local-development fallback.
- `withCredentials: true` allows browser requests to include cookies where browser and server CORS/cookie settings permit.
- A request interceptor reads the locally stored `cc_token` and adds an `Authorization: Bearer ...` header when present.
- A response interceptor clears the cached `cc_user` and `cc_token` values when the API returns HTTP 401.

The backend also sets an HTTP-only cookie named `token` during login and registration. Cookie-based and local-storage token handling are different mechanisms, so the deployed frontend and backend authentication behavior should be tested together.

High-level request flow:

```text
User interacts with a Next.js page
             |
             v
Page / React component
             |
             v
Shared Axios client (app/lib/api.ts)
             |
             v
CivicConnect backend (/api/v1/...)
             |
             v
Database or external integration
             |
             v
API response updates the interface
```

## Application routes

The following routes are represented by pages in the current frontend codebase.

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/auth/login` | User login |
| `/auth/register` | User registration |
| `/citizen` | Citizen dashboard |
| `/citizen/report` | Report a civic issue |
| `/citizen/issues` | Browse civic issues |
| `/citizen/issues/[id]` | View issue details |
| `/citizen/donate` | Create/manage a donation offer |
| `/citizen/ngo-map` | Explore NGOs on a map |
| `/citizen/notifications` | Citizen notifications |
| `/ngo` | NGO dashboard |
| `/ngo/donations` | Browse/manage donation offers |
| `/ngo/requests` | NGO requests |
| `/ngo/profile` | NGO profile |
| `/ngo/notifications` | NGO notifications |
| `/government` | Government dashboard |
| `/government/issues` | Browse government issue queue |
| `/government/issues/[id]` | View/manage an issue |
| `/government/notifications` | Government notifications |

The availability of a page does not guarantee that every workflow is fully configured in every deployment. API connectivity and backend permissions are required for data-driven operations.

## Running and building

### Development server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Run the production build

```bash
npm start
```

Build the application successfully before deploying. Configure `NEXT_PUBLIC_API_URL` in the hosting environment to point to the production backend API.

### Lint

```bash
npm run lint
```

## Troubleshooting

### The page opens, but data does not load
- Confirm that the backend is running.
- Check `NEXT_PUBLIC_API_URL` and ensure it points to the API v1 base URL.
- Inspect the browser developer console and Network tab for failed requests.

### CORS or cookie authentication errors
- Configure the backend's `CLIENT_URL` to match the frontend's origin exactly.
- Ensure credentialed requests are enabled on the client and supported by backend CORS settings.
- For production, verify HTTPS and cookie settings for the deployed domains.

### API returns 401 Unauthorized
- Log in again.
- Check whether the authentication cookie or expected token is present.
- The Axios response interceptor clears cached user/token values on a 401 response.

### NGO map does not show location data
- Verify that NGO data is available from the backend.
- Allow location access if the feature requests browser geolocation.
- Check the browser console for Leaflet, tile, or coordinate errors.

### Environment changes do not take effect
- Confirm the variable is in `frontend/.env.local`.
- Restart the development server after editing environment variables.

## Security considerations

- Keep secrets on the backend. Frontend code and `NEXT_PUBLIC_*` variables can be inspected by users.
- Backend authorization must protect sensitive actions even if the frontend hides links or pages.
- Review the local-storage token approach and HTTP-only cookie flow as part of the production security review.
- Use HTTPS in production and configure CORS and cookies for the intended frontend/backend domains.
- Validate all user-provided data on the backend, even if the frontend validates it for usability.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change.
4. Run linting and a production build where possible.
5. Test API-backed workflows with the backend.
6. Open a pull request with a concise explanation and screenshots for significant UI changes.

If an endpoint, environment variable, or page changes, update this README so the project documentation stays in sync with the code.

## Team

**Team name:** What The Hack

**Team members:**
- Chitranshi Pandey — Team Leader
- Anurag Raj
- Manoj Verma

---

CivicConnect is built to make community support easier: **report local problems, connect with organizations, and help useful resources reach the people who need them.**
