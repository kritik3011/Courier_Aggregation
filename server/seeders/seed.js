const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Load models
const User = require('../models/User');
const Courier = require('../models/Courier');
const Shipment = require('../models/Shipment');
const TrackingLog = require('../models/TrackingLog');
const Notification = require('../models/Notification');
const SystemLog = require('../models/SystemLog');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample Data
const users = [
  {
    name: 'Admin User',
    email: 'admin@courier.com',
    password: 'admin123',
    role: 'admin',
    company: 'Courier Dashboard Inc.',
    phone: '+91 9876543210',
    isActive: true
  },
  {
    name: 'Business Owner',
    email: 'user@business.com',
    password: 'user123',
    role: 'business',
    company: 'TechMart Electronics',
    phone: '+91 9876543211',
    isActive: true
  },
  {
    name: 'Staff Member',
    email: 'staff@courier.com',
    password: 'staff123',
    role: 'staff',
    company: 'Courier Dashboard Inc.',
    phone: '+91 9876543212',
    isActive: true
  }
];

const couriers = [
  {
    name: 'Delhivery',
    code: 'DEL',
    logo: '/couriers/delhivery.png',
    description: 'India\'s largest fully-integrated logistics provider',
    isActive: true,
    pricing: {
      baseRate: 40,
      weightRate: 25,
      expressMultiplier: 1.5,
      overnightMultiplier: 2.2,
      codCharges: 35,
      fuelSurcharge: 15
    },
    coverage: {
      domestic: true,
      international: false
    },
    performance: {
      avgDeliveryDays: 3,
      deliverySuccessRate: 94,
      avgRating: 4.2
    },
    contact: {
      supportEmail: 'support@delhivery.com',
      supportPhone: '1800-123-4567',
      website: 'https://www.delhivery.com'
    }
  },
  {
    name: 'BlueDart',
    code: 'BLU',
    logo: '/couriers/bluedart.png',
    description: 'South Asia\'s premier courier and logistics company',
    isActive: true,
    pricing: {
      baseRate: 55,
      weightRate: 30,
      expressMultiplier: 1.4,
      overnightMultiplier: 2.0,
      codCharges: 45,
      fuelSurcharge: 18
    },
    coverage: {
      domestic: true,
      international: true
    },
    performance: {
      avgDeliveryDays: 2,
      deliverySuccessRate: 97,
      avgRating: 4.5
    },
    contact: {
      supportEmail: 'support@bluedart.com',
      supportPhone: '1800-233-1234',
      website: 'https://www.bluedart.com'
    }
  },
  {
    name: 'DTDC',
    code: 'DTD',
    logo: '/couriers/dtdc.png',
    description: 'Delivering happiness across India',
    isActive: true,
    pricing: {
      baseRate: 35,
      weightRate: 20,
      expressMultiplier: 1.6,
      overnightMultiplier: 2.5,
      codCharges: 30,
      fuelSurcharge: 12
    },
    coverage: {
      domestic: true,
      international: false
    },
    performance: {
      avgDeliveryDays: 4,
      deliverySuccessRate: 91,
      avgRating: 3.9
    },
    contact: {
      supportEmail: 'support@dtdc.com',
      supportPhone: '1800-456-7890',
      website: 'https://www.dtdc.com'
    }
  }
];

const cities = [
  { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
  { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
  { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
  { city: 'Pune', state: 'Maharashtra', pincode: '411001' },
  { city: 'Kolkata', state: 'West Bengal', pincode: '700001' },
  { city: 'Ahmedabad', state: 'Gujarat', pincode: '380001' }
];

const names = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh', 
               'Ananya Reddy', 'Rohan Mehta', 'Divya Nair', 'Karthik Iyer', 'Neha Verma'];

const statuses = ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];
const serviceTypes = ['standard', 'express', 'overnight', 'economy'];
const categories = ['documents', 'electronics', 'clothing', 'food', 'fragile', 'other'];

// Generate tracking ID
const generateTrackingId = (courierName) => {
  const prefix = courierName.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Helper to generate random shipments
const generateShipments = (userId, courierId, courierName, count) => {
  const shipments = [];
  
  for (let i = 0; i < count; i++) {
    const senderCity = cities[Math.floor(Math.random() * cities.length)];
    const receiverCity = cities[Math.floor(Math.random() * cities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const serviceType = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
    const weight = Math.round((Math.random() * 10 + 0.5) * 10) / 10;
    const shippingCost = Math.round(40 + weight * 25 + Math.random() * 100);
    
    // Create date within last 60 days
    const createdAt = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    const expectedDeliveryDate = new Date(createdAt.getTime() + (3 + Math.random() * 4) * 24 * 60 * 60 * 1000);
    
    let actualDeliveryDate = null;
    if (status === 'delivered') {
      actualDeliveryDate = new Date(createdAt.getTime() + (2 + Math.random() * 5) * 24 * 60 * 60 * 1000);
    }

    // Generate unique tracking ID
    const trackingId = generateTrackingId(courierName) + i.toString().padStart(3, '0');

    shipments.push({
      trackingId: trackingId,
      user: userId,
      courier: courierId,
      courierName: courierName,
      sender: {
        name: names[Math.floor(Math.random() * names.length)],
        phone: `+91 98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        email: `sender${i}@example.com`,
        address: `${Math.floor(Math.random() * 500) + 1}, Block ${String.fromCharCode(65 + Math.floor(Math.random() * 10))}`,
        city: senderCity.city,
        state: senderCity.state,
        pincode: senderCity.pincode
      },
      receiver: {
        name: names[Math.floor(Math.random() * names.length)],
        phone: `+91 98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        email: `receiver${i}@example.com`,
        address: `${Math.floor(Math.random() * 500) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}`,
        city: receiverCity.city,
        state: receiverCity.state,
        pincode: receiverCity.pincode
      },
      package: {
        weight: weight,
        length: Math.floor(Math.random() * 40) + 10,
        width: Math.floor(Math.random() * 30) + 10,
        height: Math.floor(Math.random() * 20) + 5,
        description: `Package ${i + 1}`,
        value: Math.floor(Math.random() * 5000) + 500,
        category: categories[Math.floor(Math.random() * categories.length)]
      },
      serviceType: serviceType,
      paymentMode: Math.random() > 0.7 ? 'cod' : 'prepaid',
      codAmount: Math.random() > 0.7 ? Math.floor(Math.random() * 2000) + 500 : 0,
      shippingCost: shippingCost,
      totalCost: shippingCost,
      status: status,
      expectedDeliveryDate: expectedDeliveryDate,
      actualDeliveryDate: actualDeliveryDate,
      createdAt: createdAt
    });
  }
  
  return shipments;
};

// Seed function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Courier.deleteMany();
    await Shipment.deleteMany();
    await TrackingLog.deleteMany();
    await Notification.deleteMany();
    await SystemLog.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create couriers
    const createdCouriers = await Courier.create(couriers);
    console.log(`✅ Created ${createdCouriers.length} couriers`);

    // Create shipments for business user
    const businessUser = createdUsers.find(u => u.role === 'business');
    let allShipments = [];

    for (const courier of createdCouriers) {
      const shipments = generateShipments(businessUser._id, courier._id, courier.name, 20);
      allShipments = allShipments.concat(shipments);
    }

    const createdShipments = await Shipment.insertMany(allShipments);
    console.log(`✅ Created ${createdShipments.length} shipments`);

    // Create tracking logs for each shipment
    const trackingLogs = [];
    const statusFlow = ['order_created', 'pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];

    for (const shipment of createdShipments) {
      const statusIndex = statuses.indexOf(shipment.status);
      const logsToCreate = Math.min(statusIndex + 2, statusFlow.length);
      
      for (let i = 0; i < logsToCreate; i++) {
        const logTimestamp = new Date(shipment.createdAt.getTime() + i * 12 * 60 * 60 * 1000);
        trackingLogs.push({
          shipment: shipment._id,
          trackingId: shipment.trackingId,
          status: statusFlow[i],
          description: `Status: ${statusFlow[i].replace('_', ' ')}`,
          location: {
            city: i < 3 ? shipment.sender.city : shipment.receiver.city,
            state: i < 3 ? shipment.sender.state : shipment.receiver.state
          },
          timestamp: logTimestamp,
          updatedBy: 'System'
        });
      }
    }

    await TrackingLog.insertMany(trackingLogs);
    console.log(`✅ Created ${trackingLogs.length} tracking logs`);

    // Create sample notifications
    const notifications = [
      {
        user: businessUser._id,
        type: 'shipment_delivered',
        title: 'Shipment Delivered',
        message: 'Your shipment has been delivered successfully',
        isRead: false
      },
      {
        user: businessUser._id,
        type: 'system',
        title: 'Welcome!',
        message: 'Welcome to Courier Dashboard. Start shipping today!',
        isRead: true
      }
    ];

    await Notification.insertMany(notifications);
    console.log(`✅ Created ${notifications.length} notifications`);

    // Create system log
    await SystemLog.create({
      action: 'system',
      module: 'system',
      description: 'Database seeded with sample data',
      status: 'success'
    });

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('Demo Accounts:');
    console.log('─────────────────────────────────');
    console.log('Admin:    admin@courier.com / admin123');
    console.log('Business: user@business.com / user123');
    console.log('Staff:    staff@courier.com / staff123');
    console.log('─────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
