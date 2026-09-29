# Smart Media Content Factory

> **One upload. Every format.**

[![HackIndia Hackathon](https://img.shields.io/badge/HackIndia-Pixels_to_Products_2026-blue.svg)](https://hackindia.org/2026/pixels-to-products-cloudinary-ai-hackathon-2026)
[![Track 1](https://img.shields.io/badge/Track_1-AI_Media_Pipelines-indigo.svg)](#hackathon-track)
[![Cloudinary SDK](https://img.shields.io/badge/Cloudinary-SDK_v2_%26_AI_Engine-blue.svg)](https://cloudinary.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-orange.svg)](https://firebase.google.com)
[![Express Server](https://img.shields.io/badge/Backend-Node.js_%2F_Express_5-green.svg)](https://nodejs.org)
[![React Frontend](https://img.shields.io/badge/Frontend-React_19_%2F_Vite_8-cyan.svg)](https://react.dev)

A general-purpose, high-performance smart media transformation and distribution engine for creators, marketers, photographers, and sellers. Upload **one master image** to instantly generate, optimize, and organize platform-ready visual formats for Social Media, Web Banners, Profiles, and Commerce listings.

---

## Project Links & Demo

| Resource | Link | Note |
| :--- | :--- | :--- |
| **Live Application** | [(https://cloudinary-coral.vercel.app/)] | Live link |
| **Demo Video (2–4 min)** | `[ADD 2–4 MIN DEMO VIDEO URL]` | Working Demo |
| **Official GitHub Repo** | [(https://github.com/ilesh18/cloudinary)] | Main submission branch |

---

## Hackathon Track

### Track 1 — AI Media Pipelines

Submitted to **Track 1 — AI Media Pipelines** for the **Pixels to Products — Cloudinary AI Hackathon 2026**.

**Smart Media Content Factory** uses Cloudinary not as a passive file store, but as an active, programmatic media processing engine. Images uploaded to the platform undergo automated ingestion signal analysis, background removal, content-aware reframing, preset-driven derived transformations, responsive `f_auto,q_auto` delivery, and context-indexed search.

---

## The Problem vs. The Solution

### The Problem

Visual distribution across modern digital platforms is highly repetitive and time-consuming:

- A single photo must be manually re-cropped for Instagram Posts (1:1), Stories (9:16), YouTube (16:9), Web Banners (1920x600), and Profile Avatars.
- Naive center cropping accidentally cuts off critical focal subjects like faces, logos, or products.
- Removing backgrounds or maintaining disjointed asset folders wastes hours and storage quota.

### The Solution

**Upload once. Deliver everywhere.**

The platform ingests one high-resolution source file and instantly projects it into destination-specific variants across four core categories:

1. **SOCIAL**: Instagram Post, Instagram Portrait, Instagram Story / TikTok, YouTube Thumbnail, Social Square, Social Landscape.
2. **WEB**: Website Desktop Hero Banner, Website Mobile Banner.
3. **PERSONAL**: Profile Avatar / Thumbnail.
4. **COMMERCE**: Marketplace Square, Store Catalog, Product Thumbnail, Transparent Cutout PNG.

---

## Two-Branch Composition Architecture

Smart Media Content Factory intelligently branches its composition strategy based on media type:

```text
                       UPLOADED MASTER MEDIA
                                  │
                    CLOUDINARY INGESTION & ANALYSIS
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
    PRODUCT / OBJECT MEDIA               GENERAL / LIFESTYLE PHOTO
                 │                                 │
   Cloudinary Background Removal        Cloudinary Content-Aware Crop
         (effect: 'background_removal')            (gravity: 'auto')
                 │                                 │
    Cutout Layered Composition           Preserved Focal Subjects
   (c_fit + c_lpad + b_rgb/white)       (f_auto, q_auto Reframing)
                 │                                 │
                 └────────────────┬────────────────┘
                                  ▼
                      PLATFORM-READY TARGET FORMAT
```

- **Product / Object Branch**: Extracts object cutouts with Cloudinary `effect: 'background_removal'` and composes them inside padded canvas boundaries (`c_fit` + `c_lpad`) to prevent subject clipping.
- **Lifestyle / Photography Branch**: Employs content-aware gravity (`gravity: 'auto'`) on the raw scene to intelligently reframe focal subjects without losing contextual backgrounds.

---

## Supported Preset Formats

| Category | Format Preset Name | Dimensions | Composition Strategy | Output Format |
| :--- | :--- | :--- | :--- | :--- |
| **Social** | Instagram Post | `1080 × 1080` | Cutout padded 80% scale on neutral canvas | `jpg` |
| **Social** | Instagram Portrait | `1080 × 1350` | Cutout padded 4:5 scale | `jpg` |
| **Social** | Instagram Story / TikTok | `1080 × 1920` | Cutout padded vertical safe margin | `jpg` |
| **Social** | YouTube Thumbnail | `1280 × 720` | Cutout centered 16:9 on dark backdrop | `jpg` |
| **Social** | Generic Social Square | `1080 × 1080` | Cutout centered on white background | `jpg` |
| **Social** | Social Landscape Share | `1200 × 630` | Cutout centered on 1.91:1 banner canvas | `jpg` |
| **Web** | Website Desktop Hero Banner | `1920 × 600` | Cutout east-aligned hero with text margin | `webp` |
| **Web** | Website Mobile Banner | `600 × 450` | Cutout centered 4:3 mobile container | `webp` |
| **Personal** | Profile / Avatar Thumbnail | `800 × 800` | Cutout centered 1:1 circular profile ratio | `jpg` |
| **Commerce** | Marketplace Square | `1000 × 1000` | Cutout centered 80% scale on white canvas | `jpg` |
| **Commerce** | Store Catalog | `1000 × 1000` | Cutout centered on off-white canvas | `jpg` |
| **Commerce** | Product Thumbnail | `300 × 300` | Cutout centered thumbnail scale | `jpg` |
| **Commerce** | Transparent Product | Native | Raw PNG cutout with transparent alpha channel | `png` |

---

## Key Features & Implementation Matrix

| Feature | Description | Technical Implementation |
| :--- | :--- | :--- |
| **Stream Upload** | Ingests high-resolution master images with metadata | `cloudinary.uploader.upload_stream` |
| **Signal Analysis** | Generates color palettes, quality scores, & watermark detection | `colors: true`, `quality_analysis`, `accessibility_analysis` |
| **Background Removal** | Server-side subject isolation without canvas manipulation | `effect: 'background_removal'` |
| **Smart Cropping** | Focal preservation for lifestyle/nature photos | `gravity: 'auto'` |
| **Preset Packs** | Batch generates Social, Web, Personal, and Commerce packs | Centralized `socialPresets` transformation registry |
| **Optimized Delivery** | Delivers optimal image formats and quality dynamically | `f_auto`, `q_auto` delivery parameters |
| **Asset Search API** | Real-time cross-catalog search using tags and context | `cloudinary.search.expression()` API |
| **ZIP Package Download** | Packages master and derived assets into structured ZIP archives | `JSZip` stream bundling |
| **Public Showcases** | Generates shareable public token URLs for external review | Token resolution mapping to Cloudinary URLs |
| **Firebase Auth & Security** | Strict ownership checks and token verification on API routes | Firebase Admin SDK (`verifyIdToken`) |

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["React 19 + Vite 8 Client"]
        UI["User Interface Component"]
        AuthContext["Firebase Auth Context"]
        APIService["API Service Layer"]
    end

    subgraph Server["Node.js + Express Server"]
        Router["Express API Router"]
        AuthMiddleware["Firebase Token Verification"]
        CloudinaryService["Cloudinary Transformation Engine"]
        FirestoreConfig["Firebase Admin SDK"]
    end

    subgraph CloudinaryCloud["Cloudinary Engine"]
        UploadAPI["Upload Stream Ingestion"]
        AnalysisAI["Colors & Quality Signals"]
        BgRemoval["Background Removal Engine"]
        SmartCrop["Content-Aware Gravity Engine"]
        SearchAPI["Search API Index"]
        CDN["Optimized CDN Delivery"]
    end

    subgraph FirebaseCloud["Firebase Platform"]
        FirebaseAuth["Firebase Authentication"]
        Firestore["Cloud Firestore DB"]
    end

    UI --> AuthContext
    AuthContext --> FirebaseAuth
    UI --> APIService
    APIService -->|"Bearer ID Token"| Router
    Router --> AuthMiddleware
    AuthMiddleware --> FirestoreConfig
    Router --> CloudinaryService

    CloudinaryService --> UploadAPI
    UploadAPI --> AnalysisAI
    UploadAPI --> BgRemoval
    UploadAPI --> SmartCrop
    CloudinaryService --> SearchAPI
    CloudinaryService --> CDN

    FirestoreConfig --> Firestore
    Router -->|"Delivery URLs & Metadata"| APIService
```

---

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS 4, Lucide React, React Router DOM v7.
- **Backend**: Node.js, Express 5, Multer, JSZip.
- **Media**: Cloudinary SDK v2, Upload Stream, Search API, Transformations.
- **Database & Auth**: Firebase Authentication, Cloud Firestore, Firebase Admin SDK.

---

## Repository Structure

```text
cloudinary/
├── server/                       # Express Node.js Backend API
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js     # Cloudinary SDK configuration
│   │   │   └── firebaseAdmin.js  # Firebase Admin SDK setup
│   │   ├── controllers/
│   │   │   └── productController.js
│   │   ├── routes/
│   │   │   └── productRoutes.js
│   │   ├── services/
│   │   │   └── cloudinaryService.js
│   │   └── server.js
│   └── package.json
├── src/                          # React Client Application
│   ├── components/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   └── services/
│       └── api.js
├── .env.example
├── server/
│   └── .env.example
├── firestore.rules
├── package.json
└── README.md
```

---

## Quickstart & Local Setup

### 1. Prerequisites

- **Node.js**: v18+
- **Cloudinary Account**: Cloud Name, API Key, API Secret
- **Firebase Project**: Email/Password Authentication and Firestore

### 2. Environment Variables Setup

#### Server `.env`

Create:

```text
server/.env
```

Add:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

#### Client `.env`

Create:

```text
.env
```

Add:

```env
VITE_FIREBASE_API_KEY=your_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_API_URL=http://localhost:5000
```

Never commit `.env` files or real credentials.

### 3. Installation & Start

```bash
# Clone the repository
git clone https://github.com/HackIndiaXYZ/pixels-to-products-cloudinary-ai-hackathon-2026-origin.git
cd pixels-to-products-cloudinary-ai-hackathon-2026-origin

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..

# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
npm run dev
```

The frontend runs on the Vite development server and the backend runs on the configured Express port.

---

## Hackathon Verification Guide

Judges can verify Cloudinary integration directly inside the Cloudinary Dashboard.

1. **Uploaded media**: Check the Cloudinary Media Library for uploaded assets.
2. **Metadata and tags**: Inspect uploaded media for associated metadata, tags, and analysis results where available.
3. **Derived assets**: Inspect generated transformations and derived assets to verify that Cloudinary is performing the transformations.
4. **Search**: Verify that indexed metadata and generated assets can be searched through the application's Cloudinary Search integration.
5. **Delivery**: Open generated assets and inspect the Cloudinary delivery URLs and transformation parameters.

---

## Cloudinary Integration

Cloudinary is the core media engine of the application.

### Upload

Original media is uploaded through the Cloudinary Upload API using server-side processing.

### AI Analysis

Where enabled and available, the application uses Cloudinary's media analysis capabilities for information such as:

- AI-generated tags
- image quality signals
- color information
- watermark detection
- image/content classification
- other supported analysis metadata

Only results actually returned by Cloudinary are persisted and displayed.

### Background Removal

Cloudinary performs background removal on supported media.

The original image remains unchanged, while a processed representation can be used for product/object-focused compositions.

### Smart Cropping

Cloudinary intelligent/content-aware cropping is used for media formats where preserving the important subject is more useful than a basic center crop.

### Transformations

Destination-specific media variants are generated with Cloudinary transformations rather than client-side pixel manipulation.

Examples include:

- resizing
- cropping
- content-aware gravity
- product cutout composition
- padding
- layering
- background/underlay composition

### Optimized Delivery

Generated media uses Cloudinary optimized delivery where appropriate:

```text
f_auto
q_auto
```

This allows Cloudinary to select an appropriate delivery format and quality for the requesting device.

### Search

The application uses Cloudinary Search to find generated assets using indexed media information, tags, and associated metadata.

### Metadata

Firestore stores the application-level relationships between:

- users
- source media
- generated assets
- asset type
- platform
- processing state

Cloudinary remains responsible for the actual media.

---

## End-to-End Workflow

```text
User uploads media
        ↓
Firebase-authenticated request
        ↓
Express backend
        ↓
Cloudinary upload
        ↓
Cloudinary analysis
        ↓
Background removal / smart processing
        ↓
Destination-specific transformations
        ↓
f_auto + q_auto
        ↓
Firestore metadata
        ↓
Media Library
        ↓
Search / Preview / Download / Share
```

---

## How It Works

### 1. Upload Once

The user uploads one master image.

### 2. Analyze

Cloudinary analyzes the uploaded media and returns available tags, visual signals, or other configured analysis information.

### 3. Choose the Destination

The user can generate formats for:

- Social
- Web
- Personal
- Commerce

### 4. Transform

Cloudinary generates the requested destination-specific variants.

### 5. Optimize

The generated content is delivered through optimized Cloudinary transformations.

### 6. Organize

Firestore stores the relationship between the user, source media, and generated assets.

### 7. Search and Reuse

The user can search, preview, download, regenerate, and share generated assets.

---

## Security & Data Isolation

- **Server-Side Credentials**: Cloudinary API secrets and Firebase Admin credentials remain server-side.
- **Token Verification**: Protected Express routes verify Firebase Authentication ID tokens.
- **Ownership Checks**: API operations verify that the authenticated user owns the requested media.
- **Firestore Rules**: Firestore security rules isolate private user data by authenticated UID.
- **No Secret Frontend Exposure**: Server-only credentials are never placed in `VITE_` frontend variables.

---

## Testing

### Basic Workflow

1. Create an account.
2. Log in.
3. Upload one image.
4. Confirm the upload succeeds.
5. Confirm Cloudinary receives the source media.
6. Confirm available AI/media analysis results appear.
7. Generate destination formats.
8. Open generated assets.
9. Search the media library.
10. Download an individual asset.
11. Download all available assets.
12. Generate a share link and open it.

### Media Types

Test the application with:

- Product images
- Portrait photographs
- Landscape photographs
- Event or general photographs

Verify that the composition strategy preserves the important visual subject for each type.

### Security

Verify that:

- Unauthenticated users cannot access protected application data.
- User A cannot access User B's private media.
- User A cannot regenerate User B's assets.
- User A cannot delete User B's products or media.
- Share links expose only intentionally shared content.

---

## Deployment

### Frontend

The frontend can be deployed to Vercel.

Recommended settings for a root-level Vite application:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Frontend environment variable:

```env
VITE_API_URL=https://your-render-backend.onrender.com
```

### Backend

The Express backend can be deployed to Render.

Recommended settings when the backend lives inside `server/`:

```text
Root Directory: server
Build Command: npm install
Start Command: npm start
```

Required backend environment variables include:

```env
PORT=
CLIENT_ORIGIN=https://your-vercel-frontend.vercel.app

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Never place backend secrets in frontend environment variables.

---

## Hackathon Requirements

The project is built for the **Pixels to Products — Cloudinary AI Hackathon 2026**.

### Cloudinary

- Cloudinary is an active part of the product.
- Media is uploaded through Cloudinary.
- Media is analyzed through Cloudinary where supported.
- Media is transformed through Cloudinary.
- Generated assets are delivered through Cloudinary.
- Cloudinary Search is used for asset discovery.
- `f_auto` and `q_auto` are used for optimized delivery.

### Submission Materials

| Requirement | Status |
| :--- | :--- |
| Public GitHub Repository | Complete |
| README | Complete |
| Live Demo | Add final URL |
| 2–4 Minute Demo Video | Add final URL |
| Cloudinary Feedback Survey | Complete separately |

---

## Future Improvements

Potential future extensions include:

- richer video pipelines
- additional platform presets
- batch media processing
- advanced collaborative asset management
- more sophisticated composition strategies
- expanded delivery workflows

These are future improvements and are not required for the current implementation.

---

## Acknowledgements

Built for the **Pixels to Products — Cloudinary AI Hackathon 2026**.

- Special thanks to **Cloudinary** for their media APIs and AI capabilities.
- Special thanks to **HackIndia** for organizing the hackathon.

---

*Smart Media Content Factory — "One upload. Every format."*
