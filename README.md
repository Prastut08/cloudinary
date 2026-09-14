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

## 📌 Project Links & Demo

| Resource | Link | Note |
| :--- | :--- | :--- |
| **Live Application** | `[ADD LIVE DEMO URL]` | *Submission Placeholder* |
| **Demo Video (2–4 min)** | `[ADD 2–4 MIN DEMO VIDEO URL]` | *Submission Placeholder* |
| **Official GitHub Repo** | [HackIndiaXYZ/pixels-to-products-cloudinary-ai-hackathon-2026-origin](https://github.com/HackIndiaXYZ/pixels-to-products-cloudinary-ai-hackathon-2026-origin) | Main submission branch |

---

## 🏆 Hackathon Track

### Track 1 — AI Media Pipelines
Submitted to **Track 1 — AI Media Pipelines** for the **Pixels to Products — Cloudinary AI Hackathon 2026**.

**Smart Media Content Factory** uses Cloudinary not as a passive file store, but as an active, programmatic media processing engine. Images uploaded to the platform undergo automated ingestion signal analysis, background removal, content-aware reframing, preset-driven derived transformations, responsive `f_auto,q_auto` delivery, and context-indexed search.

---

## ⚡ The Problem vs. The Solution

### The Problem
Visual distribution across modern digital platforms is highly repetitive and time-consuming:
* A single photo must be manually re-cropped for Instagram Posts (1:1), Stories (9:16), YouTube (16:9), Web Banners (1920x600), and Profile Avatars.
* Naive center cropping accidentally cuts off critical focal subjects like faces, logos, or products.
* Removing backgrounds or maintaining disjointed asset folders wastes hours and storage quota.

### The Solution
**Upload once. Deliver everywhere.**
The platform ingests one high-resolution source file and instantly projects it into destination-specific variants across four core categories:
1. **SOCIAL**: Instagram Post, Instagram Portrait, Instagram Story / TikTok, YouTube Thumbnail, Social Square, Social Landscape.
2. **WEB**: Website Desktop Hero Banner, Website Mobile Banner.
3. **PERSONAL**: Profile Avatar / Thumbnail.
4. **COMMERCE**: Marketplace Square, Store Catalog, Product Thumbnail, Transparent Cutout PNG.

---

## 💡 Two-Branch Composition Architecture

Smart Media Content Factory intelligently branches its composition strategy based on media type:

```
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

* **Product / Object Branch**: Extracts object cutouts with Cloudinary `effect: 'background_removal'` and composes them inside padded canvas boundaries (`c_fit` + `c_lpad`) to prevent subject clipping.
* **Lifestyle / Photography Branch**: Employs content-aware gravity (`gravity: 'auto'`) on the raw scene to intelligently reframe focal subjects without losing contextual backgrounds.

---

## 🎯 Supported Preset Formats

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
| **Personal**| Profile / Avatar Thumbnail | `800 × 800` | Cutout centered 1:1 circular profile ratio | `jpg` |
| **Commerce**| Marketplace Square | `1000 × 1000` | Cutout centered 80% scale on white canvas | `jpg` |
| **Commerce**| Store Catalog | `1000 × 1000` | Cutout centered on off-white canvas | `jpg` |
| **Commerce**| Product Thumbnail | `300 × 300` | Cutout centered thumbnail scale | `jpg` |
| **Commerce**| Transparent Product | Native | Raw PNG cutout with transparent alpha channel | `png` |

---

## 🛠️ Key Features & Implementation Matrix

| Feature | Description | Technical Implementation |
| :--- | :--- | :--- |
| **Stream Upload** | Ingests high-resolution master images with metadata | `cloudinary.uploader.upload_stream` |
| **Signal Analysis** | Generates color palettes, quality scores, & watermark detection | `colors: true`, `quality_analysis`, `accessibility_analysis` |
| **Background Removal** | Server-side subject isolation without canvas manipulation | `effect: 'background_removal'` |
| **Smart Cropping** | Focal preservation for lifestyle/nature photos | `gravity: 'auto'` |
| **Preset Packs** | Batch generates Social, Web, Personal, and Commerce packs | Centralized `socialPresets` transformation registry |
| **Optimized Delivery** | Delivers optimal image formats (AVIF/WebP) and quality dynamically | `f_auto`, `q_auto` delivery parameters |
| **Asset Search API** | Real-time cross-catalog search using tags and context | `cloudinary.search.expression()` API |
| **ZIP Package Download** | Packages master and derived assets into structured ZIP archives | `JSZip` stream bundling |
| **Public Showcases** | Generates shareable public token URLs for external review | Token resolution mapping to Cloudinary URLs |
| **Firebase Auth & Security**| Strict ownership checks and token verification on API routes | Firebase Admin SDK (`verifyIdToken`) |

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client [React 19 + Vite 8 Client]
        UI[User Interface Component]
        AuthContext[Firebase Auth Context]
        APIService[API Service Layer]
    end

    subgraph Server [Node.js + Express Server]
        Router[Express API Router]
        AuthMiddleware[Firebase Token Verification]
        CloudinaryService[Cloudinary Transformation Engine]
        FirestoreConfig[Firebase Admin SDK]
    end

    subgraph CloudinaryCloud [Cloudinary Engine]
        UploadAPI[Upload Stream Ingestion]
        AnalysisAI[Colors & Quality Signals]
        BgRemoval[Background Removal Engine]
        SmartCrop[Content-Aware Gravity Engine]
        SearchAPI[Search API Index]
        CDN[Optimized CDN Delivery]
    end

    subgraph FirebaseCloud [Firebase Platform]
        FirebaseAuth[Firebase Authentication]
        Firestore[Cloud Firestore DB]
    end

    UI --> AuthContext
    AuthContext --> FirebaseAuth
    UI --> APIService
    APIService -- Bearer ID Token --> Router
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
    APIService <-- Delivery URLs & Meta -- Router
```

---

## 💻 Tech Stack

* **Frontend**: React 19, Vite 8, Tailwind CSS 4, Lucide React, React Router DOM v7.
* **Backend**: Node.js (v18+), Express 5, Multer, JSZip.
* **Media Cloud**: Cloudinary SDK v2 (Upload Stream, Search API, Transformations).
* **Database & Auth**: Firebase Authentication, Cloud Firestore, Firebase Admin SDK.

---

## 📁 Repository Structure

```text
cloudinary/
├── server/                       # Express Node.js Backend API
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js     # Cloudinary SDK v2 configuration
│   │   │   └── firebaseAdmin.js  # Firebase Admin SDK setup
│   │   ├── controllers/
│   │   │   └── productController.js # Upload, Social Factory, ZIP handlers
│   │   ├── routes/
│   │   │   └── productRoutes.js  # API endpoints
│   │   ├── services/
│   │   │   └── cloudinaryService.js # Transformation Engine & Presets
│   │   └── server.js             # Server entry point
│   └── package.json
├── src/                          # React 19 Client Application
│   ├── components/               # Layout & UI component library
│   ├── context/AuthContext.jsx   # Authentication context
│   ├── pages/                    # Create Content, Social Factory, Media Library views
│   └── services/api.js           # API fetch client
├── .env.example                  # Client Environment template
├── server/.env.example           # Server Environment template
├── firestore.rules               # Security rules
├── package.json
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
* **Node.js**: v18+ (v24 tested)
* **Cloudinary Account**: Cloud Name, API Key, API Secret
* **Firebase Project**: Auth (Email/Password) & Firestore database

### 2. Environment Variables Setup

#### Server `.env` (`server/.env`)
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

#### Client `.env` (`.env`)
```env
VITE_FIREBASE_API_KEY=your_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_API_URL=http://localhost:5000
```

### 3. Installation & Start

```bash
# Clone the repository
git clone https://github.com/HackIndiaXYZ/pixels-to-products-cloudinary-ai-hackathon-2026-origin.git
cd pixels-to-products-cloudinary-ai-hackathon-2026-origin

# Install client & server dependencies
npm install
cd server && npm install && cd ..

# Terminal 1: Run Backend API Server (Port 5000)
cd server && npm run dev

# Terminal 2: Run Frontend Client (Port 5173)
npm run dev
```

---

## 🔍 Hackathon Verification Guide

Judges can verify Cloudinary integration directly inside their Cloudinary Dashboard:

1. **Upload Folder Structure**: Check **Media Library** -> `products/{userId}/{productId}/`.
2. **Context Metadata & Tags**: Inspect `original` to view attached tags and `context.product_name` / `context.category`.
3. **Derived Asset Transformations**: Inspect the **Derived Assets** list on any asset card to see dynamic transformation strings (e.g., `e_background_removal/c_fit,w_860,h_860/c_lpad,g_center,w_1080,h_1080,b_rgb:f8fafc/f_auto/q_auto`).
4. **Cloudinary Search API**: Search `tags:commerce_asset` in Cloudinary Console to observe real-time search indexing.

---

## 🔐 Security & Data Isolation

* **Server-Side Credentials**: Cloudinary API Secret and Firebase Private Key are restricted exclusively to Node.js environment variables.
* **Token Guarding**: All Express endpoints verify Firebase Auth Bearer tokens via `adminAuth.verifyIdToken()`.
* **Firestore Ownership**: Cloud Firestore security rules strictly isolate media documents to matching `request.auth.uid`.

---

## 🤝 Acknowledgements

Built for the **Pixels to Products — Cloudinary AI Hackathon 2026**.
* Special thanks to **Cloudinary** for their media APIs and AI transformation engine.
* Special thanks to **HackIndia** for organizing the national hackathon.

---
*Smart Media Content Factory — "One upload. Every format."*
