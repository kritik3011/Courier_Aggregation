# 🚚 Courier Aggregation Dashboard

A professional full-stack logistics dashboard that aggregates multiple courier services into one platform. Compare shipping rates, track shipments, manage orders, and view analytics - all in one place.

![Dashboard Preview](./docs/preview.png)

## ✨ Features

### Authentication & Authorization

- JWT-based secure authentication
- Role-based access control (Admin, Business User, Staff)
- Password reset functionality

### Dashboard Home

- Real-time shipment statistics
- Cost summary cards with glassmorphism design
- Recent shipments table

### Courier Integration

- Multiple courier partners (Delhivery, BlueDart, DTDC)
- Price comparison across couriers
- Delivery time estimation
- Smart courier recommendations

### Shipment Management

- Create individual shipments
- Bulk upload via CSV
- Generate shipping labels
- Schedule pickups

### Real-Time Tracking

- Live shipment tracking
- Visual status timeline
- Search by tracking ID

### Analytics & Reports

- Courier performance comparison
- Monthly shipping cost trends
- Delivery success rates
- Average delivery time analysis

### Admin Panel

- User management
- Courier partner management
- System logs
- Complete shipment overview

## 🛠️ Tech Stack

### Frontend

- React.js 18
- Tailwind CSS
- Recharts for data visualization
- React Router v6
- Axios for API calls
- React Hot Toast for notifications

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Express Validator

## 📁 Project Structure

```
courier-dashboard/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── server/                 # Express Backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js v16 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd courier-aggregation-dashboard
   ```

2. **Setup Backend**

   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run seed  # Seed sample data
   npm run dev
   ```

3. **Setup Frontend**

   ```bash
   cd client
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Environment Variables

#### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/courier_dashboard
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
NODE_ENV=development
```

## 📡 API Documentation

### Authentication

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| POST   | `/api/auth/register`        | Register new user      |
| POST   | `/api/auth/login`           | Login user             |
| POST   | `/api/auth/forgot-password` | Request password reset |
| GET    | `/api/auth/me`              | Get current user       |

### Shipments

| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| GET    | `/api/shipments`      | Get all shipments     |
| POST   | `/api/shipments`      | Create shipment       |
| GET    | `/api/shipments/:id`  | Get single shipment   |
| PUT    | `/api/shipments/:id`  | Update shipment       |
| DELETE | `/api/shipments/:id`  | Delete shipment       |
| POST   | `/api/shipments/bulk` | Bulk create shipments |

### Couriers

| Method | Endpoint                  | Description           |
| ------ | ------------------------- | --------------------- |
| GET    | `/api/couriers`           | Get all couriers      |
| POST   | `/api/couriers/compare`   | Compare courier rates |
| GET    | `/api/couriers/recommend` | Get recommendations   |

### Tracking

| Method | Endpoint                             | Description           |
| ------ | ------------------------------------ | --------------------- |
| GET    | `/api/tracking/:trackingId`          | Track shipment        |
| GET    | `/api/tracking/:trackingId/timeline` | Get tracking timeline |

### Analytics

| Method | Endpoint                             | Description       |
| ------ | ------------------------------------ | ----------------- |
| GET    | `/api/analytics/dashboard`           | Dashboard stats   |
| GET    | `/api/analytics/courier-performance` | Courier metrics   |
| GET    | `/api/analytics/monthly-costs`       | Monthly cost data |

### Admin

| Method | Endpoint               | Description     |
| ------ | ---------------------- | --------------- |
| GET    | `/api/admin/users`     | Get all users   |
| PUT    | `/api/admin/users/:id` | Update user     |
| DELETE | `/api/admin/users/:id` | Delete user     |
| GET    | `/api/admin/logs`      | Get system logs |

## 🎨 UI Theme

The dashboard features a modern SaaS design with:

- **Primary Color**: Purple (#8B5CF6)
- **Dark Theme**: Deep navy backgrounds
- **Glassmorphism**: Frosted glass card effects
- **Responsive**: Mobile-first design

## 👥 Demo Accounts

| Role     | Email             | Password |
| -------- | ----------------- | -------- |
| Admin    | admin@courier.com | admin123 |
| Business | user@business.com | user123  |
| Staff    | staff@courier.com | staff123 |

## 📊 Sample Data

The seed script creates:

- 3 demo users (Admin, Business, Staff)
- 3 courier partners (Delhivery, BlueDart, DTDC)
- 50+ sample shipments
- Tracking history for each shipment
- Analytics data

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based route protection
- Input validation & sanitization
- CORS configuration
- Rate limiting

## 📝 License

MIT License - feel free to use this project for your portfolio!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for logistics professionals
