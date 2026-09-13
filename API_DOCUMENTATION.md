# Project Vault v2 - REST API & OAuth Documentation

**Base API URL**: `http://localhost:5000/api/auth`  
**Data Format**: `application/json`  
**Authentication Type**: `JWT Cookie (httpOnly)` & `Bearer Header Token`

---

## Table of Contents
1. [User Registration (Sign Up)](#1-user-registration-sign-up)
2. [User Sign In (Password)](#2-user-sign-in-password)
3. [Passport Google OAuth - Trigger Redirect](#3-passport-google-oauth---trigger-redirect)
4. [Passport Google OAuth - Callback](#4-passport-google-oauth---callback)
5. [Passport GitHub OAuth - Trigger Redirect](#5-passport-github-oauth---trigger-redirect)
6. [Passport GitHub OAuth - Callback](#6-passport-github-oauth---callback)
7. [Direct JSON Google OAuth](#7-direct-json-google-oauth)
8. [Direct JSON GitHub OAuth](#8-direct-json-github-oauth)
9. [Get Current Authenticated User](#9-get-current-authenticated-user)
10. [User Sign Out (Logout)](#10-user-sign-out-logout)

---

## 1. User Registration (Sign Up)

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Access**: Public
- **Validation Rules**:
  - `name`: String, minimum 2 characters (Required)
  - `email`: Valid Email format (Required)
  - `password`: Minimum 6 characters (Required)
  - `confirmPassword`: Must match `password` (Required)
  - `accountType`: `'student'` or `'recruiter'` (Default: `'student'`)
  - `subscribeNewsletter`: Boolean (Optional)

### Request Payload Example
```json
{
  "name": "Aarav Sharma",
  "email": "aarav.sharma@iitd.ac.in",
  "accountType": "student",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "subscribeNewsletter": true
}
```

### Success Response (201 Created)
Sets `httpOnly` cookie `token=<jwt_string>`.
```json
{
  "success": true,
  "message": "User account registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "66d85a1f2b4c123456789abc",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@iitd.ac.in",
    "accountType": "student",
    "subscribeNewsletter": true,
    "avatar": "",
    "createdAt": "2026-09-04T15:20:00.000Z"
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

---

## 2. User Sign In (Password)

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Access**: Public

### Request Payload Example
```json
{
  "email": "aarav.sharma@iitd.ac.in",
  "password": "Password123!"
}
```

### Success Response (200 OK)
Sets `httpOnly` cookie `token=<jwt_string>`.
```json
{
  "success": true,
  "message": "Signed in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "66d85a1f2b4c123456789abc",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@iitd.ac.in",
    "accountType": "student"
  }
}
```

---

## 3. Forgot Password / OTP Request

- **URL**: `/api/auth/forgot-password`
- **Method**: `POST`
- **Access**: Public

### Request Payload Example
```json
{
  "email": "aarav.sharma@iitd.ac.in"
}
```

---

## 4. Reset Password With OTP

- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Access**: Public

### Request Payload Example
```json
{
  "email": "aarav.sharma@iitd.ac.in",
  "otp": "492815",
  "newPassword": "NewSecurePassword123!"
}
```

---

## 5. Send Email OTP (Pre-Registration Verification)

- **URL**: `/api/auth/send-otp`
- **Method**: `POST`
- **Access**: Public

### Request Payload Example
```json
{
  "email": "aarav.sharma@iitd.ac.in"
}
```

---

## 6. Verify Email OTP

- **URL**: `/api/auth/verify-otp`
- **Method**: `POST`
- **Access**: Public

### Request Payload Example
```json
{
  "email": "aarav.sharma@iitd.ac.in",
  "otp": "837492"
}
```

---

## 7. Passport Google OAuth - Trigger Redirect

- **URL**: `/api/auth/google`
- **Method**: `GET`
- **Access**: Public
- **Description**: Redirects browser to Google's official OAuth authorization consent screen.

---

## 8. Passport Google OAuth - Callback

- **URL**: `/api/auth/google/callback`
- **Method**: `GET`
- **Access**: Public
- **Description**: Google OAuth redirect destination after user grants access. Authenticates with Passport GoogleStrategy, creates or updates the user in MongoDB Atlas, sets the HTTP-only JWT auth cookie, and redirects the browser back to `http://localhost:5173/?auth=success`.

---

## 9. Passport GitHub OAuth - Trigger Redirect

- **URL**: `/api/auth/github`
- **Method**: `GET`
- **Access**: Public
- **Description**: Redirects browser to GitHub's official OAuth authorization consent screen.

---

## 10. Passport GitHub OAuth - Callback

- **URL**: `/api/auth/github/callback`
- **Method**: `GET`
- **Access**: Public
- **Description**: GitHub OAuth redirect destination after user grants access. Authenticates with Passport GitHubStrategy, creates or updates user in MongoDB, sets HTTP-only JWT auth cookie, and redirects back to `http://localhost:5173/?auth=success`.

---

## 11. Direct JSON Google OAuth

- **URL**: `/api/auth/google`
- **Method**: `POST`
- **Access**: Public

### Request Payload Example
```json
{
  "googleId": "google_123456789",
  "email": "aarav.sharma@gmail.com",
  "name": "Aarav Sharma",
  "avatar": "https://lh3.googleusercontent.com/a/default-avatar",
  "accountType": "student"
}
```

---

## 12. Direct JSON GitHub OAuth

- **URL**: `/api/auth/github`
- **Method**: `POST`
- **Access**: Public

### Request Payload Example
```json
{
  "githubId": "github_987654321",
  "email": "aarav.sharma@github.com",
  "name": "Aarav Sharma",
  "avatar": "https://avatars.githubusercontent.com/u/987654321",
  "accountType": "student"
}
```

---

## 13. Get Current Authenticated User

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Access**: Private (Requires valid `token` cookie or `Authorization: Bearer <token>` header)

### Success Response (200 OK)
```json
{
  "success": true,
  "user": {
    "_id": "66d85a1f2b4c123456789abc",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@iitd.ac.in",
    "accountType": "student",
    "avatar": ""
  }
}
```

---

## 10. User Sign Out (Logout)

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Access**: Public
- **Description**: Clears the `token` cookie on the user client.

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```
