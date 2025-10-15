# Authentication System Guide

## Overview
The Aam Wala Business Solutions app now includes a complete multi-user authentication system with role-based access control.

## Default Admin Credentials
- **User ID**: `Aam-admin-1`
- **Password**: `AamWala$Cloud#2025!`

## User Roles

### Admin
- Full access to all features
- Can create and delete writer accounts
- Can change admin password
- Access to Reports and Settings

### Writer
- Full access to: Farm, Agent, Voucher, and Sales management
- View-only access to: Farmer Ledgers and Agent Ledgers
- No access to: Reports, Settings, Backup & Reset

## Key Features

### 1. Login System
- Login page appears before any dashboard access
- Validates User ID and Password
- Redirects to dashboard on successful login
- Shows error message for invalid credentials

### 2. User Management (Admin Only)
Located in Settings > User Management section:

#### Create Writer Account
- Enter Full Name, Phone, and Password
- System automatically generates ID: `Aam-Wrt-1`, `Aam-Wrt-2`, etc.
- New writer can immediately login with their credentials

#### Delete Writer Account
- Admin can remove any writer account
- Writer is permanently removed from system

#### Change Admin Password
- Admin can update their password at any time
- Minimum 6 characters required

### 3. Role-Based Dashboard
The dashboard automatically shows/hides modules based on user role:

**Admin sees**: All modules
**Writer sees**: Farm, Agent, Voucher, Sales, and Ledgers (view-only)

### 4. Session Management
- User session persists across page refreshes
- Logout button in navbar clears session
- Logged-in user's name and role displayed in navbar

## Data Storage
- All user data stored in localStorage
- User accounts: `aam_wala_users`
- Passwords: `aam_wala_passwords`
- Current session: `aam_wala_current_user`

## Security Features
- Password protection for all accounts
- Session-based authentication
- Protected routes - must be logged in to access
- Automatic redirect to login if not authenticated

## Usage Instructions

### First Time Setup
1. Open the application
2. You'll see the login page
3. Enter default admin credentials
4. You're now logged in as Administrator

### Creating Writer Accounts
1. Login as Admin
2. Navigate to Settings
3. Scroll to "User Management" section
4. Fill in Full Name, Phone, and Password
5. Click "Create Writer"
6. Share the generated User ID with the writer

### Changing Admin Password
1. Login as Admin
2. Navigate to Settings
3. Scroll to "User Management" section
4. Find "Change Admin Password"
5. Enter new password (min 6 characters)
6. Click "Update Password"

### Logging Out
Click the logout button (log out icon) in the top-right navbar

## Technical Implementation

### Components
- `AuthContext.tsx` - Authentication state management
- `ProtectedRoute.tsx` - Route protection wrapper
- `Login.tsx` - Login page component
- Updated `Navbar.tsx` - Shows user info and logout
- Updated `Settings.tsx` - User management section
- Updated `Index.tsx` - Role-based dashboard filtering

### Authentication Flow
1. App loads → AuthProvider initializes
2. User not logged in → Redirected to /login
3. User enters credentials → Validated against stored users
4. Valid credentials → User object stored in context and localStorage
5. User navigates → ProtectedRoute checks authentication
6. User logs out → Session cleared, redirected to login

## Notes
- The system uses localStorage for simplicity and offline functionality
- All passwords are stored as plain text in localStorage (suitable for local/offline use)
- For production with online database, implement proper password hashing
- Writer accounts can only be created by admin
- Admin account cannot be deleted
