# BillFlow – WhatsApp Billing SaaS

BillFlow is a comprehensive billing solution designed for small to medium enterprises, featuring tight integration with WhatsApp for seamless invoicing and customer communication.

## 🚀 Features

- **Automated Invoicing**: Generate professional PDF invoices using React and jsPDF.
- **WhatsApp Integration**: Send invoices and payment reminders directly via WhatsApp.
- **Inventory Management**: Keep track of your stock in real-time.
- **Customer Portal**: Dedicated space for customers to view their billing history.
- **Cross-Platform**: Available as a Web App and a Desktop Application (Windows/Linux).

## 🛠️ Architecture

The project is organized as a monorepo:

- `frontend/`: React + Vite application for the user interface.
- `backend/`: Express.js API with Prisma ORM for data management.
- `electron/`: Desktop application wrapper using Electron.

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/billflow.git
   cd billflow
   ```2. Install dependencies for all components:
   ```bash
   npm run install:all
   ```3. Set up environment variables:
   - Copy `.env.example` to `.env` in the root (and in subdirectories if necessary).
   - Configure your `DATABASE_URL` and `JWT_SECRET`.

### Development

Run both frontend and backend concurrently in development mode:
```bash
npm run dev
```

### Desktop App

To run the desktop application in development mode:
```bash
npm run start:desktop
```

## 🏗️ Production Build

### Web Build
Build the frontend for production deployment:
```bash
npm run build:frontend
```

### Server Deployment (e.g., Render)
The project is configured to start the backend by default when running `npm start`. Ensure your deployment platform's root directory is set to the repository root.

### Desktop Packaging
Package the application for distribution:
```bash
# For Windows
npm run package:win

# For Linux
npm run package:linux
```

## 📄 License

This project is licensed under the MIT License.
