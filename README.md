# PayPak Digital Bank (React beginner project)

A simple digital banking dashboard built with React, React Router and Context API.
All data is stored in the browser's **localStorage** (no backend).

## Setup
```bash
npm install
npm run dev
```
Open the link shown in the terminal (usually http://localhost:5173).

## Test users (password for all: 123456)
- ali@test.com
- sara@test.com
- usman@test.com

## Technology choices
- React 18 (functional components + hooks), Vite
- React Router v6 for pages
- Context API (`src/context/BankContext.jsx`) for state; all banking logic is in this one file
- Plain CSS in `src/css`, with media queries for mobile (<=768px), tablet (<=1024px) and desktop

## Folder structure
- `src/pages` - Login, Register, Dashboard, Transactions, Transfer, Settings
- `src/components` - reusable parts (Sidebar, Modal, Toast, StatCard, TransactionTable, FormInput, AmountForm)
- `src/context` - global state + localStorage
- `src/hooks` - `useBusy` (stops double-click submissions)
- `src/css` - all styles
- `src/utils` - money/date formatting

## How transfers stay consistent
Sender debit, receiver credit and both transaction records are written in a single `save()` call,
so one side can never change without the other. Failed attempts (e.g. insufficient balance) are
recorded with status "Failed".

## Assumptions
- Currency is Rs. (PKR). Max single amount is Rs. 10,000,000.
- Phone number must be 10-13 digits.

## Known limitations (important)
- Passwords are hashed with SHA-256 (salted with the email) before saving, so they are not stored as plain text. But localStorage is still not secure: anyone can open browser dev tools and read or edit balances. A real bank needs a backend (bcrypt/argon2 hashing, sessions/JWT).
- Data lives only in one browser; users on different devices cannot transfer to each other.
- Multiple tabs: the app re-reads localStorage before every operation and syncs between tabs, which reduces conflicts, but it is still not a real database transaction (two exactly simultaneous writes can still collide).
- A real bank needs a backend with server-side validation, password hashing and database transactions.
