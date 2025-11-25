# Musaphir Tour Backend

| Status | Live Link |
| :---: | :---: |
| ✅ Deploy Success | [https://tour-management-system-backend-seven.vercel.app/](https://tour-management-system-backend-seven.vercel.app/) |

-----

## 🌟 Overview

The **Musaphir Tour Backend** is a robust and scalable server application built for a comprehensive tour management system. It is developed using **Node.js**, **Express**, and **TypeScript** with **Mongoose** for MongoDB interaction, following a modular architecture.

This backend handles all core functionalities, including user authentication (local and Google OAuth), tour and division management, booking, secure payment integration (SSLCommerz), image hosting (Cloudinary), and detailed statistical data tracking.

-----

## ✨ Key Features

The system is structured with dedicated modules to handle different parts of the tour management workflow:

  * **User Management (`/user`)**: Handles user profiles, roles, and administrative tasks.
  * **Authentication (`/auth`)**: Supports traditional email/password login and **Google OAuth 2.0** integration.
  * **Division Management (`/division`)**: Manages geographical divisions for tour organization.
  * **Tour Management (`/tour`)**: CRUD operations for tours, including image uploading to **Cloudinary**.
  * **Booking (`/booking`)**: Facilitates tour bookings by users.
  * **Payment (`/payment`)**: Integration with **SSLCommerz** for secure payment processing and payment status handling.
  * **OTP (`/otp`)**: Manages One-Time Passwords for verification processes, utilizing **Nodemailer** for email delivery.
  * **Stats (`/stats`)**: Provides aggregated statistical data for administrative dashboards.
  * **Invoice Generation**: Generates PDF invoices for successful bookings using **PDFKit**.
  * **Error Handling**: Implements global error handling for `Zod` validation errors, MongoDB cast errors, duplicate key errors, and other application errors.

-----

## 🛠️ Technologies Used

The project is built on the following core technologies and libraries:

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | **Node.js, Express.js** | Runtime environment and web framework |
| **Language** | **TypeScript** | For static typing and code quality |
| **Database** | **MongoDB (via Mongoose)** | NoSQL Database for data persistence |
| **Validation** | **Zod** | Schema declaration and validation |
| **Authentication** | **Passport.js (Local & Google OAuth)** | User authentication strategy |
| **Session** | **Express-Session, Redis** | Session management and caching |
| **Payments** | **SSLCommerz, Axios** | Payment gateway integration |
| **File Storage** | **Cloudinary, Multer** | Image and file cloud storage |
| **Emailing** | **Nodemailer, EJS** | Email sending for OTP and password reset, using EJS for templates |
| **Security** | **Bcrypt.js, JSON Web Token (JWT)** | Password hashing and secure token generation |
| **Utility** | **PDFKit** | Generating PDF invoices |

-----

## 🚀 Installation and Setup

Follow these steps to set up the project locally.

### Prerequisites

  * Node.js (LTS version recommended)
  * MongoDB instance (local or remote)
  * Redis instance (local or remote)

### Step 1: Clone the Repository

```bash
git clone <repository_url_here>
cd tour-management-system-backend
```

### Step 2: Install Dependencies

Use the package manager to install all required dependencies and development dependencies.

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a file named `.env` in the root directory and populate it with the required configuration variables. The application will throw an error if any required variable is missing.

**Required Environment Variables (`.env` file content structure):**

```env
# SERVER
PORT=5000
NODE_ENV=development

# MONGODB
DB_URL=<Your_MongoDB_Connection_String>
BCRYPT_SALT_ROUND=10
SUPER_ADMIN_EMAIL=<Initial_Super_Admin_Email>
SUPER_ADMIN_PASSWORD=<Initial_Super_Admin_Password>

# JWT
JWT_ACCESS_SECRET=<Your_JWT_Access_Secret>
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_SECRET=<Your_JWT_Refresh_Secret>
JWT_REFRESH_EXPIRES=7d

# AUTHENTICATION
EXPRESS_SESSION_SECRET=<Your_Express_Session_Secret>
GOOGLE_CLIENT_ID=<Your_Google_Client_ID>
GOOGLE_CLIENT_SECRET=<Your_Google_Client_Secret>
GOOGLE_CALLBACK_URL=<Your_Google_OAuth_Callback_URL>
FRONTEND_URL=<Your_Frontend_URL>

# CLOUDINARY
CLOUDINARY_CLOUD_NAME=<Your_Cloudinary_Cloud_Name>
CLOUDINARY_API_KEY=<Your_Cloudinary_API_KEY>
CLOUDINARY_API_SECRET=<Your_Cloudinary_API_SECRET>

# EMAIL SENDER (Nodemailer)
SMTP_HOST=<SMTP_Host>
SMTP_PORT=<SMTP_Port>
SMTP_USER=<SMTP_User>
SMTP_PASS=<SMTP_Password>
SMTP_FROM=<SMTP_From_Email>

# REDIS
REDIS_HOST=<Redis_Host>
REDIS_PORT=<Redis_Port>
REDIS_USERNAME=<Redis_Username>
REDIS_PASSWORD=<Redis_Password>

# SSLCOMMERZ PAYMENT (Required for payment functionality)
SSL_STORE_ID=<Your_SSL_Store_ID>
SSL_STORE_PASS=<Your_SSL_Store_PASS>
SSL_PAYMENT_API=<SSL_Payment_API_URL>
SSL_VALIDATION_API=<SSL_Validation_API_URL>
SSL_SUCCESS_BACKEND_URL=<Backend_Success_Callback_URL>
SSL_FAIL_BACKEND_URL=<Backend_Fail_Callback_URL>
SSL_CANCEL_BACKEND_URL=<Backend_Cancel_Callback_URL>
SSL_SUCCESS_FRONTEND_URL=<Frontend_Success_Redirect_URL>
SSL_FAIL_FRONTEND_URL=<Frontend_Fail_Redirect_URL>
SSL_CANCEL_FRONTEND_URL=<Frontend_Cancel_Redirect_URL>
SSL_IPN_URL=<SSL_IPN_URL>
```

### Step 4: Run the Server

You can run the server in development mode (with hot reloading) or production mode:

#### Development

```bash
npm run dev
```

This script uses `ts-node-dev` to start the server and automatically restart on file changes.

#### Production

```bash
# 1. Compile TypeScript to JavaScript
npm run build

# 2. Start the compiled application
npm start
```

The `build` script compiles the TypeScript code into the `dist` directory, and `start` executes the compiled JavaScript file.

-----

## ⚙️ Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `start` | `node ./dist/server.js` | Runs the compiled application in production mode. |
| `dev` | `ts-node-dev --respawn --transpile-only src/server.ts` | Runs the application in development mode with watch and restart. |
| `build` | `tsc` | Compiles TypeScript source files into JavaScript. |
| `lint` | `npx eslint ./src` | Executes the ESLint configuration for code quality. |
| `stage` | `tsc && git status && git add .` | Compiles code and prepares files for a Git commit. |
| `test` | `echo "Error: no test specified" && exit 1` | Placeholder for running tests |

-----

## 🛣️ API Endpoints

The base route for all API endpoints is `/api/v1`.

| Path | Description | Module |
| :--- | :--- | :--- |
| `/api/v1/user` | User profile management and administrative user actions | `user` |
| `/api/v1/auth` | User registration, login, token refresh, and social login | `auth` |
| `/api/v1/division` | CRUD operations for tour divisions/locations | `division` |
| `/api/v1/tour` | CRUD operations and public access for tour packages | `tour` |
| `/api/v1/booking` | Managing tour bookings | `booking` |
| `/api/v1/payment` | Initiating and handling payment gateway responses | `payment` |
| `/api/v1/otp` | Generating and verifying one-time passwords | `otp` |
| `/api/v1/stats` | Retrieving dashboard and analytical statistics | `stats` |

The server's entry point is: [https://tour-management-system-backend-seven.vercel.app/](https://tour-management-system-backend-seven.vercel.app/).
Accessing the root path (`/`) returns a welcome message:

```
Welcome to the tour management system server
```

-----

## 🤝 Contribution

For any suggestions, bug reports, or contributions, please refer to the project's repository.