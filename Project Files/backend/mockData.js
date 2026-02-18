// Mock data storage for development when MongoDB is not available
let users = [];
let properties = [];
let bookings = [];

// Generate mock data
const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: '$2a$10$dummy.hash.for.password123',
    type: 'User'
  },
  {
    _id: '2', 
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: '$2a$10$dummy.hash.for.password123',
    type: 'Owner',
    granted: 'granted'
  }
];

const mockProperties = [
  {
    _id: '1',
    propertyAddress: '123 Main Street, Downtown',
    propertyType: 'residential',
    propertyAdType: 'rent',
    propertyAmt: 12000,
    isAvailable: 'Available',
    ownerContact: '9876543210',
    ownerId: '2',
    additionalInfo: 'Beautiful 2-bedroom apartment with modern amenities',
    propertyImage: [{path: '/uploads/property1.jpg'}]
  },
  {
    _id: '2',
    propertyAddress: '456 Oak Avenue, Suburbs',
    propertyType: 'residential',
    propertyAdType: 'sale',
    propertyAmt: 2500000,
    isAvailable: 'Available',
    ownerContact: '9876543211',
    ownerId: '2',
    additionalInfo: 'Spacious 3-bedroom house with garden',
    propertyImage: [{path: '/uploads/property2.jpg'}]
  },
  {
    _id: '3',
    propertyAddress: '789 Commercial Blvd, City Center',
    propertyType: 'commercial',
    propertyAdType: 'rent',
    propertyAmt: 25000,
    isAvailable: 'Available',
    ownerContact: '9876543212',
    ownerId: '2',
    additionalInfo: 'Prime commercial space perfect for office',
    propertyImage: [{path: '/uploads/property3.jpg'}]
  }
];

// Mock booking data - removed for now
const mockBookings = [];

// Initialize mock data
users.push(...mockUsers);
properties.push(...mockProperties);
bookings.push(...mockBookings);

module.exports = {
  users,
  properties,
  bookings,
  
  // Helper functions
  findUser: (email) => users.find(user => user.email === email),
  findUserById: (id) => users.find(user => user._id === id),
  addUser: (user) => {
    const newUser = { ...user, _id: (users.length + 1).toString() };
    users.push(newUser);
    return newUser;
  },
  updateUser: (email, updates) => {
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      return users[userIndex];
    }
    return null;
  },
  getAllProperties: () => properties,
  addProperty: (property) => {
    const newProperty = { ...property, _id: (properties.length + 1).toString() };
    properties.push(newProperty);
    return newProperty;
  },
  getAllBookings: () => bookings,
  addBooking: (booking) => {
    const newBooking = { ...booking, _id: (bookings.length + 1).toString() };
    bookings.push(newBooking);
    return newBooking;
  }
};