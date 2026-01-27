# Donet.in - Drivers Online Network

A hyper-local marketplace connecting car owners with professional temporary drivers across India.

## Features

- **For Customers**: Find nearby drivers, book hourly services, real-time chat
- **For Drivers**: Create profiles (driver only or with car), set rates, manage bookings
- **Admin Panel**: Moderate drivers, manage platform
- **Secure Payments**: Razorpay integration for subscriptions
- **File Storage**: Cloudflare R2 for documents and photos
- **Real-time Communication**: Chat system for coordination

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, TypeScript, Drizzle ORM, PostgreSQL
- **Auth**: Passport.js with sessions
- **Payments**: Razorpay
- **Storage**: Cloudflare R2
- **Email**: Nodemailer
- **Logging**: Winston
- **Deployment**: Vercel

## Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database
- Razorpay account
- Cloudflare R2 bucket

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env` and fill in your values

4. Set up database:
   ```bash
   npm run db:push
   npm run db:migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env` file for required variables.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript check
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:push` - Push database schema
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio

## Deployment

### Vercel
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Manual
1. Build the app: `npm run build`
2. Start server: `npm run start`

## API Documentation

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout

### Drivers
- `GET /api/drivers` - Get nearby drivers
- `POST /api/drivers` - Create driver profile
- `PATCH /api/drivers/:id` - Update driver profile

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id` - Update booking status

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment

### Admin
- `GET /api/admin/pending-drivers` - Get pending drivers
- `POST /api/admin/drivers/:id/verify` - Verify driver

## Contributing

1. Fork the repository
2. Create feature branch
3. Run tests and linting
4. Submit pull request

## License

MIT License
