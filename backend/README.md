# MITS Lost & Found Portal — Backend API

Production-structured Express + MongoDB API for the MITS Lost & Found Portal.

## Folder Structure

```
backend/
├── config/
│   ├── db.js              # MongoDB Atlas connection
│   └── cloudinary.js      # Secure image upload (Cloudinary + multer)
├── models/
│   ├── User.js
│   ├── LostItem.js
│   ├── FoundItem.js
│   ├── Claim.js
│   └── Notification.js
├── controllers/
│   ├── authController.js
│   ├── lostItemController.js
│   ├── foundItemController.js
│   ├── claimController.js
│   ├── notificationController.js
│   └── adminController.js
├── routes/
│   ├── authRoutes.js
│   ├── lostItemRoutes.js
│   ├── foundItemRoutes.js
│   ├── claimRoutes.js
│   ├── notificationRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── auth.js             # JWT verification + role-based access control
│   ├── validate.js         # express-validator error handler
│   ├── rateLimiters.js      # brute-force / DoS protection
│   └── errorHandler.js
├── utils/
│   └── token.js
├── server.js
├── package.json
└── .env.example
```

## 1. Local Setup

```bash
cd backend
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, CLOUDINARY_*, GOOGLE_CLIENT_ID, SMTP_* etc.
npm run dev        # starts with nodemon on http://localhost:5000
```

## 2. MongoDB Atlas Setup

1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. Database Access → add a user with a strong password.
3. Network Access → add your deployment server's IP (or `0.0.0.0/0` only for testing).
4. Copy the connection string into `MONGO_URI` in `.env`.

## 3. Cloudinary Setup (image storage)

1. Create a free account at https://cloudinary.com.
2. Copy Cloud Name, API Key, API Secret from the dashboard into `.env`.
3. Uploads are validated for MIME type (jpeg/png/webp) and capped at 5MB in `config/cloudinary.js`.

## 4. Google OAuth Setup

1. Go to Google Cloud Console → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID (Web application).
3. Add your frontend URL to Authorized JavaScript origins.
4. Put the Client ID in `.env` as `GOOGLE_CLIENT_ID`.
5. Frontend uses Google Identity Services to get an `idToken`, then calls
   `POST /api/auth/google` with `{ idToken }`.

## 5. Security Features Implemented

| Requirement | Where |
|---|---|
| JWT Authentication | `middleware/auth.js`, `utils/token.js` |
| bcrypt Password Hashing | `models/User.js` (pre-save hook, 12 salt rounds) |
| Role-Based Access Control | `middleware/auth.js` → `authorize(...roles)` |
| Input Validation | `express-validator` in every route file + `middleware/validate.js` |
| XSS Protection | `xss-clean` middleware in `server.js` |
| CSRF Protection | Stateless JWT (Bearer header) is not CSRF-vulnerable by design; the fallback cookie is set with `SameSite=Strict` + `httpOnly`. If you extend the cookie-only flow, add the `csrf-csrf` package for double-submit tokens. |
| Rate Limiting | `middleware/rateLimiters.js` (global + strict auth limiter) |
| Secure File Upload Validation | `config/cloudinary.js` (MIME allow-list + 5MB limit) |
| MongoDB Injection Protection | `express-mongo-sanitize` in `server.js` |
| Protected API Routes | `protect` middleware on every non-public route |
| Security Headers | `helmet()` in `server.js` |

## 6. Core API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
GET    /api/auth/me

GET    /api/lost-items?q=&category=&status=&building=&sort=
POST   /api/lost-items                  (multipart: image)
GET    /api/lost-items/mine
PATCH  /api/lost-items/:id/status       (admin)
DELETE /api/lost-items/:id

GET    /api/found-items?...
POST   /api/found-items                 (multipart: image, required)
GET    /api/found-items/mine
PATCH  /api/found-items/:id/status      (admin)
DELETE /api/found-items/:id

POST   /api/claims                      (multipart: proof)
GET    /api/claims/mine
GET    /api/claims                      (admin)
PATCH  /api/claims/:id/decision         (admin)

GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all

GET    /api/admin/users
PATCH  /api/admin/users/:id/suspend
PATCH  /api/admin/users/:id/reinstate
GET    /api/admin/analytics
DELETE /api/admin/lost-items/:id
DELETE /api/admin/found-items/:id
```

## 7. Deployment

**Backend (Render / Railway / an on-campus Node server):**
1. Push this `backend/` folder to a Git repo.
2. Create a new Web Service, set the build command `npm install` and start command `npm start`.
3. Add all `.env` variables in the host's environment variable settings (never commit `.env`).
4. Set `NODE_ENV=production` and `CLIENT_URL` to your deployed frontend's URL.

**Frontend (Vercel / Netlify):**
1. Build the React app (`npm run build`) and deploy the `dist`/`build` folder.
2. Set an environment variable for the API base URL pointing to your deployed backend.

**Database:** MongoDB Atlas is already cloud-hosted — no extra step needed beyond IP allow-listing your production server.

**Domain & HTTPS:** Put the API behind HTTPS (Render/Railway provide this by default). Update `CLIENT_URL` and CORS origin accordingly.

## 8. Next Steps to Go Fully Production-Ready

- Wire up `nodemailer` in `authController.js` (`forgotPassword`) to actually send the reset email.
- Add an email-verification step (send a verification link on register, gate certain actions on `isEmailVerified`).
- Add automated tests (Jest + Supertest) for each route.
- Add a `POST /api/admin/export` endpoint using a library like `pdfkit` and `exceljs` for the "Export Data to PDF/Excel" admin feature.
- Add WebSocket or Server-Sent Events for real-time (not just polled) notifications.
