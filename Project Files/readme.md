project Executable files
# HouseHunt 

A full-stack web application for property rental and buying, connecting property owners with potential renters/buyers. Built with React.js and Node.js/Express with MongoDB.

## Abstract

HouseHunt is a modern real estate platform that simplifies the property hunting experience. It provides a seamless interface for property owners to list their properties and for renters/buyers to discover, book, and review properties. The platform features role-based access control (Admin, Owner, Renter), secure authentication, integrated payment processing via Razorpay, real-time chat, and a comprehensive notification system.

---

## Functional Features

### User Management
- **User Registration & Authentication** - Secure signup/login with JWT tokens
- **Forgot Password** - Password recovery functionality
- **Role-based Access** - Three user roles: Admin, Owner, and Renter

### Property Management
- **Add Property** - Owners can list properties with images and videos
- **Property Listing** - Browse all available properties with filters
- **Property Details** - View property information including bedrooms, bathrooms, area, amenities, etc.
- **Property Analytics** - Track property views and engagement

### Booking System
- **Book Property** - Renters can book available properties
- **Booking Management** - View, approve/reject, and cancel bookings
- **Booking Status Tracking** - Real-time booking status updates

### Payment Integration
- **Razorpay Integration** - Secure payment processing
- **Payment History** - Track all transactions
- **Payment Verification** - Secure payment verification

### Communication
- **In-app Chat** - Direct messaging between owners and renters
- **Notification Center** - Real-time notifications for bookings, messages, etc.

### Reviews & Ratings
- **Submit Reviews** - Renters can review properties after booking
- **View Reviews** - Property owners can see reviews on their listings

### Admin Features
- **User Management** - View and manage all users
- **Property Oversight** - Monitor all listed properties
- **Booking Dashboard** - Overview of all bookings

---

## API Endpoints

### Backend Base URL: `http://localhost:8001/api`

#### User Routes (`/api/user`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| POST | `/forgotpassword` | Password recovery |
| GET | `/getAllProperties` | Get all properties |
| POST | `/bookinghandle/:propertyid` | Book a property |
| GET | `/getallbookings` | Get user bookings |
| PATCH | `/cancelbooking/:bookingId` | Cancel a booking |
| POST | `/submitreview` | Submit property review |
| GET | `/getreviews/:propertyId` | Get property reviews |

#### Owner Routes (`/api/owner`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/postproperty` | Add new property |
| GET | `/getallproperties` | Get owner's properties |
| GET | `/getallbookings` | Get property bookings |
| POST | `/handlebookingstatus` | Approve/reject booking |
| GET | `/getbookedproperties` | Get booked properties |
| GET | `/getreviews` | Get owner reviews |
| DELETE | `/deleteproperty/:propertyid` | Delete property |

#### Admin Routes (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/getallusers` | Get all users |
| POST | `/handlestatus` | Update user status |
| GET | `/getallproperties` | Get all properties |
| GET | `/getallbookings` | Get all bookings |

#### Payment Routes (`/api/payment`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-order` | Create payment order |
| POST | `/verify` | Verify payment |
| GET | `/history` | Get payment history |
| GET | `/check/:bookingId` | Check payment status |

#### Chat Routes (`/api/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/send` | Send message |
| GET | `/conversations` | Get conversations |
| GET | `/messages/:otherUserId` | Get messages |
| GET | `/unread-count` | Get unread count |

#### Notification Routes (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get notifications |
| PATCH | `/read/:id` | Mark as read |
| PATCH | `/readall` | Mark all as read |
| DELETE | `/:id` | Delete notification |

### Frontend Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/login` | User login |
| `/register` | User registration |
| `/forgotpassword` | Password recovery |
| `/adminhome` | Admin dashboard |
| `/ownerhome` | Property owner dashboard |
| `/renterhome` | Renter dashboard |

---

## Tech Stack

### Frontend
- **React.js** - UI framework
- **Material UI (MUI)** - Component library
- **Ant Design** - Additional UI components
- **React Bootstrap** - Styling
- **Axios** - HTTP client
- **React Router DOM** - Routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **Razorpay** - Payment gateway
- **bcryptjs** - Password hashing

---

## How to Run

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas connection)
- npm or yarn

### Environment Setup

Create a `.env` file in the `code/backend` directory:

```env
PORT=8001
MONGO_DB=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Running the Backend

```bash
# Navigate to backend directory
cd code/backend

# Install dependencies
npm install

# Start the server
npm start
```

The backend server will run on `http://localhost:8001`

### Running the Frontend

```bash
# Navigate to frontend directory
cd code/frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`

### Quick Start (Windows)

Use the provided batch file:
```bash
# From the root househunt directory
start-backend.bat
```

---

## Project Structure

```
househunt/
├── code/
│   ├── backend/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Auth middleware
│   │   ├── routes/          # API routes
│   │   ├── schemas/         # Mongoose models
│   │   ├── uploads/         # Uploaded files
│   │   └── index.js         # Entry point
│   └── frontend/
│       ├── public/          # Static files
│       └── src/
│           ├── modules/     # React components
│           │   ├── admin/   # Admin components
│           │   ├── common/  # Shared components
│           │   └── user/    # User components
│           ├── styles/      # CSS files
│           └── App.js       # Main app component
└── start-backend.bat        # Quick start script
```

---

## License

ISC

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
