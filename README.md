# 🚚 Delivery App with Smart Locker System

A modern delivery application featuring a 3D realistic smart locker system for secure package storage and retrieval.

## ✨ Features

### 🔐 Smart Locker System
- **3D Realistic Design**: CSS-powered 3D lockers with LED indicators, digital displays, and keypad interface
- **Real-time Status**: Available (green) and occupied (red) locker visualization
- **Secure Access**: OTP-based locker access system

### 📱 User Experience
- **Customer Dashboard**: Book lockers, track packages, receive notifications
- **Rider Dashboard**: Manage deliveries, store packages in lockers
- **Payment Integration**: Immediate payment upon locker booking
- **Notification System**: Real-time alerts when packages are stored

### 🎯 Workflow
1. **Book Locker** → Customer selects locker and pays immediately
2. **Rider Pickup** → Assigned rider collects package from sender
3. **Store in Locker** → Rider securely stores package using access code
4. **Customer Notification** → Automatic alert with retrieval instructions
5. **Package Retrieval** → Customer uses OTP to open locker
6. **Confirmation** → Customer confirms receipt, locker becomes available

## 🛠️ Technology Stack

- **Frontend**: React 18.2.0 with TypeScript
- **Styling**: Tailwind CSS + Custom 3D CSS
- **State Management**: React Hooks
- **UI Components**: Custom modals and notifications

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
   \`\`\`bash
   git clone <repository-url>
   cd delevery
   \`\`\`

2. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server
   \`\`\`bash
   npm start
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📁 Project Structure

\`\`\`
delevery/
├── public/
│   └── index.html          # Contains 3D CSS for realistic lockers
├── src/
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Application entry point
├── package.json           # Project dependencies
└── README.md             # Project documentation
\`\`\`

## 🎨 Key Components

### Smart Locker Interface
- **LED Indicators**: Visual status representation
- **Digital Display**: Locker information panel
- **Keypad Interface**: Security access simulation
- **3D Animation**: Hover and interaction effects

### Modal System
- **OTP Display Modal**: Secure code presentation with copy functionality
- **Package Confirmation Modal**: Receipt confirmation interface
- **Payment Modal**: Transaction processing interface

### Notification System
- **Real-time Updates**: Automatic package status monitoring
- **Customer Alerts**: Immediate notification when packages are stored
- **Status Messages**: Clear feedback for all user actions

## 🔧 Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm test\` - Launches the test runner
- \`npm run build\` - Builds the app for production
- \`npm run eject\` - Ejects from Create React App

## 🌟 Recent Updates

- ✅ Removed duplicate payment system (no payment after package retrieval)
- ✅ Streamlined user experience with single payment flow
- ✅ Enhanced 3D locker visualization
- ✅ Improved notification system
- ✅ Added OTP popup modal with copy functionality

## 📋 Future Enhancements

- [ ] Backend API integration
- [ ] Database persistence
- [ ] GPS tracking for riders
- [ ] SMS/Email notifications
- [ ] Admin dashboard
- [ ] Analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Contact

For questions or support, please contact the development team.

---

**Built with ❤️ for efficient and secure package delivery**
