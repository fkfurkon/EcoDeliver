import React, { useState, useEffect } from 'react';

// Tailwind CSS is assumed to be available in the environment.

// Utility function to generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// --- Shared Components ---

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    <p className="ml-3 text-white">กำลังโหลด...</p>
  </div>
);

// Message box for user feedback
const MessageBox = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : (type === 'info' ? 'bg-blue-500' : 'bg-red-500');
  const textColor = 'text-white';

  return (
    <div className={`${bgColor} ${textColor} p-3 md:p-4 rounded-lg shadow-lg mb-4 flex justify-between items-center text-sm md:text-base`}>
      <p>{message}</p>
      <button onClick={onClose} className="text-white font-bold text-xl leading-none ml-2">
        &times;
      </button>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({ packageId, serviceFee, onConfirmPayment, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleConfirm = () => {
    setLoading(true);
    setMessage('');
    setTimeout(() => {
      setLoading(false);
      setMessageType('success');
      setMessage('ชำระเงินสำเร็จแล้ว! คุณสามารถรับพัสดุได้');
      onConfirmPayment(packageId);
      // Automatically close after a short delay for better UX
      setTimeout(onClose, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-sm md:max-w-md">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">ชำระค่าบริการสำหรับพัสดุ #{packageId}</h3>
        <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
        <div className="text-center mb-4 md:mb-6">
          <p className="text-gray-700 text-base md:text-lg mb-2">ยอดที่ต้องชำระ: <span className="font-extrabold text-green-600 text-2xl md:text-3xl">${serviceFee.toFixed(2)}</span></p>
          <div className="bg-gray-100 p-3 md:p-4 rounded-lg inline-block">
            {/* Simulated QR Code */}
            <img
              src={`https://placehold.co/180x180/E0E7FF/4F46E5?text=QR+Code+for+%24${serviceFee.toFixed(2)}`}
              alt="QR Code"
              className="w-36 h-36 md:w-48 md:h-48 mx-auto rounded-lg shadow-md"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/180x180?text=QR+Code"; }}
            />
            <p className="text-xs md:text-sm text-gray-500 mt-2">สแกนรหัส QR เพื่อชำระเงิน</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg text-sm md:text-base transition duration-300 ease-in-out w-full md:w-auto"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm md:text-base transition duration-300 ease-in-out transform hover:scale-105 w-full md:w-auto"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : 'ยืนยันการชำระเงิน'}
          </button>
        </div>
      </div>
    </div>
  );
};

// New: Retrieval Confirmation Modal Component
const RetrievalConfirmationModal = ({ packageId, expectedOTP, onConfirmRetrievalAndPay, onClose }) => {
  const [inputOTP, setInputOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleConfirm = (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    setTimeout(() => {
      setLoading(false);
      if (inputOTP === expectedOTP) {
        setMessageType('success');
        setMessage('OTP ถูกต้อง! กำลังดำเนินการชำระเงิน...');
        onConfirmRetrievalAndPay(packageId); // This will trigger the payment modal
      } else {
        setMessageType('error');
        setMessage('OTP ไม่ถูกต้อง กรุณาลองอีกครั้ง');
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-sm md:max-w-md">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">ยืนยันการรับพัสดุ #{packageId}</h3>
        <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
        <form onSubmit={handleConfirm}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otpInput">
              ป้อน OTP เพื่อยืนยันการรับพัสดุ:
            </label>
            <input
              type="text"
              id="otpInput"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-lg md:text-xl font-bold tracking-widest"
              placeholder="XXXXXX"
              maxLength="6"
              value={inputOTP}
              onChange={(e) => setInputOTP(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg text-sm md:text-base transition duration-300 ease-in-out w-full md:w-auto"
              disabled={loading}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm md:text-base transition duration-300 ease-in-out transform hover:scale-105 w-full md:w-auto"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'ยืนยันและชำระเงิน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Authentication Component ---
const AuthScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleLogin = (role) => {
    setLoading(true);
    setMessage(''); // Clear previous messages

    // Simulate API call for authentication
    setTimeout(() => {
      setLoading(false);
      // In a real app, you'd send credentials to a backend API
      // and receive a token and user role.
      // For simulation, we'll just "log in" with the chosen role.
      setMessageType('success');
      setMessage(`เข้าสู่ระบบในฐานะ ${role} สำเร็จ!`);
      onLoginSuccess(role);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-sm md:max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-6">
          เข้าสู่ระบบ UniDeliver
        </h2>
        <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
        <form onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
          <div className="mb-3 md:mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-1 md:mb-2" htmlFor="email">
              อีเมลมหาวิทยาลัย (จำลอง)
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4 md:mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-1 md:mb-2" htmlFor="password">
              รหัสผ่าน (จำลอง)
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-2 md:mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-3">
            <button
              type="button" // Change to type="button" to prevent form submission
              onClick={() => handleLogin('customer')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-base md:text-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 w-full"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'เข้าสู่ระบบในฐานะลูกค้า'}
            </button>
            <button
              type="button"
              onClick={() => handleLogin('rider')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-base md:text-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 w-full"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'เข้าสู่ระบบในฐานะไรเดอร์'}
            </button>
            <button
              type="button"
              onClick={() => handleLogin('admin')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-base md:text-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 w-full"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'เข้าสู่ระบบในฐานะผู้ดูแลระบบ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Customer Dashboard ---
const CustomerDashboard = ({ packages, onUpdatePackage, userId, serviceFee, lockers, riders, onUpdateLocker }) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [packageToPay, setPackageToPay] = useState(null);

  const [showBookLockerModal, setShowBookLockerModal] = useState(false);
  const [selectedLockerId, setSelectedLockerId] = useState('');
  const [selectedRiderId, setSelectedRiderId] = useState(''); // New state for selected rider
  const [recipientName, setRecipientName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');

  const [showRetrievalConfirmationModal, setShowRetrievalConfirmationModal] = useState(false);
  const [packageToRetrieve, setPackageToRetrieve] = useState(null);


  const handleBookLocker = (e) => {
    e.preventDefault();
    setMessage('');
    if (!selectedLockerId) {
      setMessageType('error');
      setMessage('กรุณาเลือกล็อกเกอร์');
      return;
    }
    if (!selectedRiderId) {
      setMessageType('error');
      setMessage('กรุณาเลือกไรเดอร์');
      return;
    }

    // Simulate booking a locker and creating a new package
    const newPackageId = 'PK' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const newPackage = {
      id: newPackageId,
      customer: userId, // The customer is the one booking/sending
      recipient: recipientName || 'Self', // Can be self or another recipient
      description: packageDescription || 'N/A',
      status: 'Locker Reserved, Awaiting Rider Pickup', // New status for customer-initiated booking
      rider: selectedRiderId, // Assign the selected rider
      targetLockerId: selectedLockerId,
      riderLockerAccessCode: null, // Will be generated when rider accepts
      customerRetrievalOTP: null, // Will be generated when package is stored
      paid: false,
    };

    onUpdatePackage([...packages, newPackage]);
    // Mark the selected locker as occupied
    onUpdateLocker(lockers.map(l => l.id === selectedLockerId ? { ...l, status: 'Occupied' } : l));

    setMessageType('success');
    setMessage(`จองล็อกเกอร์ ${selectedLockerId} และมอบหมายให้ ${riders.find(r => r.id === selectedRiderId)?.name} สำหรับพัสดุ ${newPackageId} แล้ว`);
    setShowBookLockerModal(false);
    setSelectedLockerId('');
    setSelectedRiderId(''); // Clear selected rider
    setRecipientName('');
    setPackageDescription('');
  };

  const handleRequestLocker = (packageId) => {
    setMessage('');
    // This flow is for existing 'Out for Delivery' packages being redirected to locker
    const updatedPackages = packages.map(pkg =>
      pkg.id === packageId && pkg.status === 'Out for Delivery'
        ? { ...pkg, status: 'Locker Requested', rider: 'Pending Assignment' } // This flow doesn't involve customer selecting rider
        : pkg
    );
    onUpdatePackage(updatedPackages);
    setMessageType('success');
    setMessage(`ร้องขอจัดเก็บพัสดุ ${packageId} ในล็อกเกอร์แล้ว ไรเดอร์จะได้รับการแจ้งเตือน`);
  };

  const handleReceiveOTP = (packageId) => {
    setMessage('');
    const pkg = packages.find(p => p.id === packageId);
    if (pkg && pkg.status.includes('Locker') && pkg.customerRetrievalOTP) {
      setMessageType('info');
      setMessage(`OTP สำหรับพัสดุ ${packageId}: ${pkg.customerRetrievalOTP}. ใช้รหัสนี้เพื่อเปิดล็อกเกอร์`);
    } else {
      setMessageType('error');
      setMessage('พัสดุยังไม่อยู่ในล็อกเกอร์ หรือ OTP ยังไม่พร้อมใช้งาน');
    }
  };

  const handleConfirmRetrievalAndPayClick = (packageId) => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg && (pkg.status === 'Stored in Locker') && !pkg.paid && pkg.customerRetrievalOTP) {
      setPackageToRetrieve(pkg);
      setShowRetrievalConfirmationModal(true);
    } else if (pkg && pkg.paid) {
      setMessageType('info');
      setMessage('พัสดุนี้ได้รับการยืนยันและชำระเงินแล้ว');
    } else {
      setMessageType('error');
      setMessage('ไม่สามารถยืนยันการรับพัสดุได้: พัสดุไม่อยู่ในล็อกเกอร์, ยังไม่ชำระเงิน หรือ OTP ไม่พร้อมใช้งาน');
    }
  };

  const handleConfirmRetrievalAndPay = (packageId) => {
    // This is called from RetrievalConfirmationModal after successful OTP
    setShowRetrievalConfirmationModal(false); // Close OTP modal
    setPackageToPay(packageId); // Set package for payment
    setShowPaymentModal(true); // Open Payment modal
  };

  const handleConfirmPayment = (packageId) => {
    const updatedPackages = packages.map(p =>
      p.id === packageId ? { ...p, paid: true, status: 'Retrieved & Paid' } : p
    );
    onUpdatePackage(updatedPackages);

    // Find the locker associated with this package and mark it as Available
    const retrievedPackage = packages.find(p => p.id === packageId);
    if (retrievedPackage && (retrievedPackage.lockerId || retrievedPackage.targetLockerId)) {
      const lockerIdToUpdate = retrievedPackage.lockerId || retrievedPackage.targetLockerId;
      onUpdateLocker(lockers.map(l => l.id === lockerIdToUpdate ? { ...l, status: 'Available' } : l));
    }

    setMessageType('success');
    setMessage(`ชำระค่าบริการสำหรับพัสดุ ${packageId} แล้ว`);
    setShowPaymentModal(false);
    setPackageToPay(null);
  };

  const customerPackages = packages.filter(pkg => pkg.customer === userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700 p-4 md:p-6 font-inter text-gray-800">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-6 md:mb-8">
          แดชบอร์ดลูกค้า
        </h2>
        <p className="text-center text-gray-600 mb-4 md:mb-6 text-sm md:text-base">ยินดีต้อนรับลูกค้า! รหัสผู้ใช้ของคุณ: <span className="font-mono text-xs md:text-sm bg-gray-100 p-1 rounded">{userId}</span></p>
        <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />

        {/* Section to book a locker for sending/storing a package */}
        <div className="mb-6 md:mb-8 p-4 md:p-6 bg-blue-50 rounded-lg shadow-inner">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">ส่งพัสดุ / จองล็อกเกอร์</h3>
          <button
            onClick={() => setShowBookLockerModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg text-base md:text-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            จองล็อกเกอร์สำหรับพัสดุใหม่
          </button>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">สถานะพัสดุของคุณ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {customerPackages.length === 0 ? (
            <p className="col-span-full text-center text-gray-600 text-sm md:text-base">ไม่มีพัสดุให้แสดง</p>
          ) : (
            customerPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-gray-50 p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">พัสดุ #{pkg.id}</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-1">
                  <span className="font-semibold">สถานะ:</span>{' '}
                  <span className={`font-medium ${pkg.status.includes('Delivered') || pkg.status.includes('Paid') || pkg.status.includes('Retrieved') ? 'text-green-600' : pkg.status.includes('Locker') || pkg.status.includes('Awaiting Rider') || pkg.status.includes('En Route') ? 'text-blue-600' : 'text-orange-600'}`}>
                    {pkg.status}
                  </span>
                </p>
                <p className="text-xs md:text-sm text-gray-600 mb-1">
                  <span className="font-semibold">ไรเดอร์:</span> {riders.find(r => r.id === pkg.rider)?.name || pkg.rider || 'N/A'}
                </p>
                {pkg.targetLockerId && (
                  <p className="text-xs md:text-sm text-gray-600 mb-1">
                    <span className="font-semibold">ล็อกเกอร์เป้าหมาย:</span> {pkg.targetLockerId}
                  </p>
                )}
                {pkg.riderLockerAccessCode && pkg.status === 'Picked Up, En Route to Locker' && (
                  <p className="text-xs md:text-sm text-gray-600 mb-1 text-red-500">
                    <span className="font-semibold">รหัสเข้าถึงล็อกเกอร์ไรเดอร์:</span> {pkg.riderLockerAccessCode} (สำหรับไรเดอร์)
                  </p>
                )}
                <div className="mt-3 md:mt-4 space-y-2">
                  {/* Only show "Request Locker Storage" if it's an "Out for Delivery" package that needs redirection */}
                  {pkg.status === 'Out for Delivery' && (
                    <button
                      onClick={() => handleRequestLocker(pkg.id)}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg text-xs md:text-sm transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      ร้องขอจัดเก็บในล็อกเกอร์ (เปลี่ยนเส้นทาง)
                    </button>
                  )}
                  {pkg.status === 'Stored in Locker' && (
                    <>
                      <button
                        onClick={() => handleReceiveOTP(pkg.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs md:text-sm transition duration-300 ease-in-out transform hover:scale-105"
                      >
                        รับ OTP ล็อกเกอร์
                      </button>
                      {!pkg.paid && (
                        <button
                          onClick={() => handleConfirmRetrievalAndPayClick(pkg.id)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs md:text-sm transition duration-300 ease-in-out transform hover:scale-105"
                        >
                          ยืนยันการรับพัสดุและชำระเงิน
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {showPaymentModal && (
        <PaymentModal
          packageId={packageToPay}
          serviceFee={serviceFee}
          onConfirmPayment={handleConfirmPayment}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
      {showBookLockerModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-sm md:max-w-md">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">จองล็อกเกอร์สำหรับพัสดุใหม่</h3>
            <form onSubmit={handleBookLocker}>
              <div className="mb-3 md:mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-1 md:mb-2" htmlFor="recipientName">
                  ชื่อผู้รับ (ถ้าแตกต่างจากคุณ):
                </label>
                <input
                  type="text"
                  id="recipientName"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  placeholder="เช่น สมชาย"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div className="mb-3 md:mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-1 md:mb-2" htmlFor="packageDescription">
                  คำอธิบายพัสดุ:
                </label>
                <input
                  type="text"
                  id="packageDescription"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  placeholder="เช่น หนังสือ, เสื้อผ้า"
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3 md:mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-1 md:mb-2" htmlFor="lockerSelect">
                  เลือกล็อกเกอร์สำหรับจัดเก็บ:
                </label>
                <select
                  id="lockerSelect"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  value={selectedLockerId}
                  onChange={(e) => setSelectedLockerId(e.target.value)}
                  required
                >
                  <option value="">-- เลือกล็อกเกอร์ --</option>
                  {lockers.filter(l => l.status === 'Available').map(locker => ( // Filter only available lockers
                    <option key={locker.id} value={locker.id}>
                      {locker.id} ({locker.location})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4 md:mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-1 md:mb-2" htmlFor="riderSelect">
                  เลือกไรเดอร์:
                </label>
                <select
                  id="riderSelect"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  required
                >
                  <option value="">-- เลือกไรเดอร์ --</option>
                  {riders.map(rider => (
                    <option key={rider.id} value={rider.id}>
                      {rider.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-4">
                <button
                  type="button"
                  onClick={() => setShowBookLockerModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg text-sm md:text-base transition duration-300 ease-in-out w-full md:w-auto"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm md:text-base transition duration-300 ease-in-out transform hover:scale-105 w-full md:w-auto"
                >
                  จองล็อกเกอร์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showRetrievalConfirmationModal && packageToRetrieve && (
        <RetrievalConfirmationModal
          packageId={packageToRetrieve.id}
          expectedOTP={packageToRetrieve.customerRetrievalOTP}
          onConfirmRetrievalAndPay={handleConfirmRetrievalAndPay}
          onClose={() => setShowRetrievalConfirmationModal(false)}
        />
      )}
    </div>
  );
};

// --- Rider Dashboard ---
const RiderDashboard = ({ packages, onUpdatePackage, lockers, userId, serviceFee, commissionRate, riders }) => {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [lockerNumber, setLockerNumber] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Filter jobs for the current rider: either assigned directly or 'Pending' for general pickup
  const currentRiderId = userId; // Use userId directly as the rider ID
  const availableJobs = packages.filter(pkg =>
    (pkg.status === 'Locker Reserved, Awaiting Rider Pickup' && pkg.rider === currentRiderId) || // Assigned to this rider
    (pkg.status === 'Out for Delivery' && pkg.rider === currentRiderId) || // Assigned direct delivery
    (pkg.status === 'Locker Requested' && pkg.rider === 'Pending Assignment') // Any rider can pick up redirection requests
    // Note: 'Pending' status (unassigned initial jobs) can be added here if needed
  );

  const handleAcceptJob = (packageId) => {
    setMessage('');
    const updatedPackages = packages.map(pkg => {
      if (pkg.id === packageId) {
        let newStatus = pkg.status;
        let riderLockerAccessCode = pkg.riderLockerAccessCode;

        if (pkg.status === 'Locker Reserved, Awaiting Rider Pickup' || pkg.status === 'Locker Requested') {
          newStatus = 'Picked Up, En Route to Locker';
          riderLockerAccessCode = generateOTP(); // Generate code for rider to open the target locker
        } else if (pkg.status === 'Pending') { // For general unassigned jobs if we add them later
          newStatus = 'Out for Delivery';
        }
        return { ...pkg, status: newStatus, rider: currentRiderId, riderLockerAccessCode: riderLockerAccessCode };
      }
      return pkg;
    });
    onUpdatePackage(updatedPackages);
    setMessageType('success');
    setMessage(`รับงานสำหรับพัสดุ ${packageId} แล้ว`);
  };

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    setMessage('');
    if (!selectedJobId || !deliveryStatus) {
      setMessageType('error');
      setMessage('กรุณาเลือกพัสดุและสถานะ');
      return;
    }

    let updatedPackages = [...packages];
    let currentPackage = updatedPackages.find(pkg => pkg.id === selectedJobId);

    if (!currentPackage) return;

    if (deliveryStatus === 'Delivered') {
      currentPackage.status = 'Delivered';
      currentPackage.lockerId = null;
      currentPackage.customerRetrievalOTP = null; // Clear customer OTP
      currentPackage.riderLockerAccessCode = null; // Clear rider access code
      currentPackage.paid = true; // Assume direct delivery means paid
      setMessageType('success');
      setMessage(`พัสดุ ${selectedJobId} ถูกทำเครื่องหมายว่าจัดส่งแล้ว`);
    } else if (deliveryStatus === 'Stored in Locker') {
      // For both 'Locker Requested' and 'Picked Up, En Route to Locker' flows
      // Use targetLockerId if pre-booked, otherwise require manual input
      const finalLockerId = currentPackage.targetLockerId || lockerNumber;
      if (!finalLockerId) {
         setMessageType('error');
         setMessage('กรุณาป้อนหมายเลขล็อกเกอร์หรือเลือกงานที่มีล็อกเกอร์เป้าหมาย');
         return;
      }
      const customerOtp = generateOTP(); // OTP for customer retrieval

      currentPackage.status = 'Stored in Locker';
      currentPackage.lockerId = finalLockerId;
      currentPackage.customerRetrievalOTP = customerOtp;
      currentPackage.riderLockerAccessCode = null; // Rider's code is no longer needed
      currentPackage.paid = false; // Customer needs to pay for locker storage

      // Simulate updating locker availability (if a real locker system)
      // In a real app, this would be an API call to the locker system.
      // E.g., `updateLockerStatus(lockerNumber, 'occupied', packageId)`
      // The locker status is updated in App.js when the package is retrieved and paid.

      setMessageType('success');
      setMessage(`พัสดุ ${selectedJobId} จัดเก็บในล็อกเกอร์ ${finalLockerId} แล้ว OTP สร้างขึ้น: ${customerOtp}`);
    } else if (deliveryStatus === 'Failed') {
      currentPackage.status = 'Delivery Failed';
      currentPackage.lockerId = null;
      currentPackage.customerRetrievalOTP = null;
      currentPackage.riderLockerAccessCode = null;
      currentPackage.paid = false;
      setMessageType('error');
      setMessage(`การจัดส่งพัสดุ ${selectedJobId} ล้มเหลว`);
    }

    onUpdatePackage(updatedPackages);
    setSelectedJobId(null);
    setDeliveryStatus('');
    setLockerNumber('');
  };

  const completedDeliveries = packages.filter(pkg => pkg.status === 'Delivered' || pkg.status === 'Retrieved & Paid');
  const totalEarningsFromPackages = completedDeliveries.length * serviceFee;
  const riderShare = totalEarningsFromPackages * (1 - commissionRate);


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-teal-700 p-4 md:p-6 font-inter text-gray-800">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-6 md:mb-8">
          แดชบอร์ดไรเดอร์
        </h2>
        <p className="text-center text-gray-600 mb-4 md:mb-6 text-sm md:text-base">ยินดีต้อนรับไรเดอร์! รหัสผู้ใช้ของคุณ: <span className="font-mono text-xs md:text-sm bg-gray-100 p-1 rounded">{userId}</span></p>
        <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />

        <div className="mb-6 md:mb-8 p-4 md:p-6 bg-blue-50 rounded-lg shadow-inner">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">งานจัดส่งที่พร้อมใช้งาน</h3>
          {availableJobs.length === 0 ? (
            <p className="text-gray-600 text-sm md:text-base">ไม่มีงานใหม่ในขณะนี้</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableJobs.map(job => (
                <div key={job.id} className="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                  <div>
                    <p className="font-semibold text-base md:text-lg">พัสดุ #{job.id}</p>
                    <p className="text-xs md:text-sm text-gray-600">สถานะ: {job.status}</p>
                    {job.targetLockerId && <p className="text-xs md:text-sm text-gray-600">ล็อกเกอร์เป้าหมาย: {job.targetLockerId}</p>}
                  </div>
                  <button
                    onClick={() => handleAcceptJob(job.id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs md:text-sm transition duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
                  >
                    รับงาน
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 md:mb-8 p-4 md:p-6 bg-blue-50 rounded-lg shadow-inner">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">อัปเดตสถานะการจัดส่ง</h3>
          <form onSubmit={handleUpdateStatus}>
            <div className="mb-3 md:mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-1 md:mb-2" htmlFor="packageSelect">
                เลือกพัสดุ:
              </label>
              <select
                id="packageSelect"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                value={selectedJobId || ''}
                onChange={(e) => setSelectedJobId(e.target.value)}
                required
              >
                <option value="">-- เลือกพัสดุ --</option>
                {packages.filter(pkg => pkg.rider === currentRiderId && !pkg.status.includes('Delivered') && !pkg.status.includes('Failed') && !pkg.status.includes('Stored in Locker') && !pkg.status.includes('Retrieved')).map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    พัสดุ #{pkg.id} (สถานะปัจจุบัน: {pkg.status}) {pkg.riderLockerAccessCode ? `(รหัสล็อกเกอร์ไรเดอร์: ${pkg.riderLockerAccessCode})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3 md:mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-1 md:mb-2" htmlFor="deliveryStatus">
                สถานะการจัดส่ง:
              </label>
              <select
                id="deliveryStatus"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                required
              >
                <option value="">-- เลือกสถานะ --</option>
                <option value="Delivered">จัดส่งแล้ว (ถึงผู้รับโดยตรง)</option>
                <option value="Stored in Locker">จัดเก็บในล็อกเกอร์</option>
                <option value="Failed">ล้มเหลว</option>
              </select>
            </div>

            {deliveryStatus === 'Stored in Locker' && !packages.find(p => p.id === selectedJobId)?.targetLockerId && (
              <div className="mb-3 md:mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-1 md:mb-2" htmlFor="lockerNumber">
                  หมายเลขล็อกเกอร์ (ถ้าไม่ได้จองไว้ล่วงหน้า):
                </label>
                <input
                  type="text"
                  id="lockerNumber"
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                  placeholder="เช่น A101"
                  value={lockerNumber}
                  onChange={(e) => setLockerNumber(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 w-full"
            >
              อัปเดตสถานะ
            </button>
          </form>
        </div>

        <div className="p-4 md:p-6 bg-purple-50 rounded-lg shadow-inner">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">รายได้ของคุณ</h3>
          <p className="text-sm md:text-lg">
            <span className="font-semibold">จำนวนพัสดุที่จัดส่ง/จัดเก็บแล้ว:</span>{' '}
            <span className="font-bold text-lg md:text-xl text-indigo-700">{completedDeliveries.length}</span>
          </p>
          <p className="text-sm md:text-lg">
            <span className="font-semibold">รายได้รวมจากค่าบริการ (ก่อนหักคอมมิชชัน):</span>{' '}
            <span className="font-bold text-lg md:text-xl text-green-700">${totalEarningsFromPackages.toFixed(2)}</span>
          </p>
          <p className="text-sm md:text-lg">
            <span className="font-semibold">ส่วนแบ่งไรเดอร์ (หลังหัก {commissionRate * 100}% คอมมิชชัน):</span>{' '}
            <span className="font-bold text-lg md:text-xl text-orange-700">${riderShare.toFixed(2)}</span>
          </p>
          <p className="text-xs md:text-sm text-gray-600 mt-2">
            (รายได้จำลองตามการจัดส่งที่เสร็จสมบูรณ์)
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Admin Dashboard ---
const AdminDashboard = ({ packages, lockers, onUpdateLocker, userId }) => {
  const [serviceFee, setServiceFee] = useState(2.50); // Default fee
  const [commissionRate, setCommissionRate] = useState(0.15); // Default 15% commission
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    setMessage('');
    // Simulate API call to update settings
    setMessageType('success');
    setMessage('ค่าบริการและอัตราคอมมิชชันได้รับการอัปเดตแล้ว!');
  };

  const handleLockerStatusChange = (lockerId, newStatus) => {
    setMessage('');
    const updatedLockers = lockers.map(locker =>
      locker.id === lockerId ? { ...locker, status: newStatus } : locker
    );
    onUpdateLocker(updatedLockers);
    setMessageType('success');
    setMessage(`สถานะล็อกเกอร์ ${lockerId} อัปเดตเป็น ${newStatus} แล้ว`);
  };

  const paidPackages = packages.filter(pkg => pkg.paid);
  const totalRevenue = paidPackages.length * serviceFee;
  const platformEarnings = totalRevenue * commissionRate;
  const riderPayouts = totalRevenue * (1 - commissionRate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-700 p-4 md:p-6 font-inter text-gray-800">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-6 md:mb-8">
          แดชบอร์ดผู้ดูแลระบบ
        </h2>
        <p className="text-center text-gray-600 mb-4 md:mb-6 text-sm md:text-base">ยินดีต้อนรับผู้ดูแลระบบ! รหัสผู้ใช้ของคุณ: <span className="font-mono text-xs md:text-sm bg-gray-100 p-1 rounded">{userId}</span></p>
        <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />

        <div className="mb-6 md:mb-8 p-4 md:p-6 bg-blue-50 rounded-lg shadow-inner">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">การตั้งค่าแพลตฟอร์ม</h3>
          <form onSubmit={handleUpdateSettings}>
            <div className="mb-3 md:mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-1 md:mb-2" htmlFor="serviceFee">
                ค่าบริการ ($):
              </label>
              <input
                type="number"
                id="serviceFee"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                step="0.01"
                min="0"
                value={serviceFee}
                onChange={(e) => setServiceFee(parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="mb-4 md:mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-1 md:mb-2" htmlFor="commissionRate">
                อัตราคอมมิชชัน (%):
              </label>
              <input
                type="number"
                id="commissionRate"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm md:text-base"
                step="0.01"
                min="0"
                max="1"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 w-full"
            >
              อัปเดตการตั้งค่า
            </button>
          </form>
        </div>

        <div className="mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">การจัดการล็อกเกอร์</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockers.map(locker => (
              <div key={locker.id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                <h4 className="font-semibold text-base md:text-lg">ล็อกเกอร์ {locker.id}</h4>
                <p className="text-xs md:text-sm text-gray-600">ที่ตั้ง: {locker.location}</p>
                <p className="text-xs md:text-sm text-gray-600 mb-2">
                  สถานะ:{' '}
                  <span className={`font-medium ${locker.status === 'Available' ? 'text-green-600' : 'text-red-600'}`}>
                    {locker.status}
                  </span>
                </p>
                <select
                  className="w-full p-2 border rounded-lg text-xs md:text-sm"
                  value={locker.status}
                  onChange={(e) => handleLockerStatusChange(locker.id, e.target.value)}
                >
                  <option value="Available">พร้อมใช้งาน</option>
                  <option value="Occupied">ไม่ว่าง</option>
                  <option value="Maintenance">อยู่ระหว่างการบำรุงรักษา</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6 bg-purple-50 rounded-lg shadow-inner">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">รายงานแพลตฟอร์ม</h3>
          <div className="space-y-2 text-sm md:text-base">
            <p>
              <span className="font-semibold">จำนวนพัสดุที่จัดส่ง/จัดเก็บแล้วทั้งหมด:</span>{' '}
              <span className="font-bold text-lg md:text-xl text-indigo-700">{packages.filter(p => p.status.includes('Delivered') || p.status.includes('Stored in Locker') || p.status.includes('Retrieved')).length}</span>
            </p>
            <p>
              <span className="font-semibold">รายได้รวม (จากค่าธรรมเนียมล็อกเกอร์ที่ชำระแล้ว):</span>{' '}
              <span className="font-bold text-lg md:text-xl text-green-700">${totalRevenue.toFixed(2)}</span>
            </p>
            <p>
              <span className="font-semibold">รายได้แพลตฟอร์ม:</span>{' '}
              <span className="font-bold text-lg md:text-xl text-blue-700">${platformEarnings.toFixed(2)}</span>
            </p>
            <p>
              <span className="font-semibold">ยอดจ่ายให้ไรเดอร์ (โดยประมาณ):</span>{' '}
              <span className="font-bold text-lg md:text-xl text-orange-700">${riderPayouts.toFixed(2)}</span>
            </p>
            <p>
              <span className="font-semibold">อัตราการใช้งานล็อกเกอร์:</span>{' '}
              <span className="font-bold text-lg md:text-xl text-gray-700">
                {lockers.filter(l => l.status === 'Occupied').length} / {lockers.length}
              </span>
            </p>
          </div>
          <button
            onClick={() => { setMessageType('info'); setMessage('กำลังสร้างรายงานโดยละเอียด (จำลอง)...'); }}
            className="mt-4 md:mt-6 bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 w-full"
          >
            สร้างรายงานโดยละเอียด
          </button>
        </div>

        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-yellow-50 rounded-lg shadow-inner">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">ส่วนต่อประสานการสนับสนุนลูกค้า</h3>
          <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
            (ในแอปพลิเคชันจริง นี่จะเป็นส่วนต่อประสานเพื่อดูและตอบกลับข้อซักถามของลูกค้า
            จัดการข้อพิพาท และให้ความช่วยเหลือ)
          </p>
          <button
            onClick={() => { setMessageType('info'); setMessage('กำลังเปิดพอร์ทัลสนับสนุนลูกค้า (จำลอง)...'); }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 w-full"
          >
            เข้าถึงพอร์ทัลสนับสนุน
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [currentUserRole, setCurrentUserRole] = useState(null); // 'customer', 'rider', 'admin', or null (for not logged in)
  const [userId, setUserId] = useState(''); // To simulate a unique user ID
  const [serviceFee, setServiceFee] = useState(2.50); // Default fee, passed down to CustomerDashboard
  const [commissionRate, setCommissionRate] = useState(0.15); // Default 15% commission, passed down to RiderDashboard

  // Mock data for riders
  const [riders, setRiders] = useState([
    { id: 'Rider A', name: 'ไรเดอร์ A' },
    { id: 'Rider B', name: 'ไรเดอร์ B' },
    { id: 'Rider C', name: 'ไรเดอร์ C' },
  ]);

  // Mock data for packages and lockers
  const [packages, setPackages] = useState([
    { id: 'PK001', customer: 'user_customer_sim', recipient: 'Alice', description: 'Books', status: 'Locker Reserved, Awaiting Rider Pickup', rider: 'Rider A', targetLockerId: 'L-A01', riderLockerAccessCode: null, customerRetrievalOTP: null, paid: false },
    { id: 'PK002', customer: 'user_customer_sim', recipient: 'Bob', description: 'Clothes', status: 'Picked Up, En Route to Locker', rider: 'Rider B', targetLockerId: 'L-A02', riderLockerAccessCode: generateOTP(), customerRetrievalOTP: null, paid: false },
    { id: 'PK003', customer: 'user_customer_sim', recipient: 'Charlie', description: 'Gadget', status: 'Stored in Locker', rider: 'Rider C', targetLockerId: 'L-C01', riderLockerAccessCode: null, customerRetrievalOTP: generateOTP(), paid: false },
    { id: 'PK004', customer: 'user_customer_sim', recipient: 'Diana', description: 'Documents', status: 'Retrieved & Paid', rider: 'Rider A', targetLockerId: null, riderLockerAccessCode: null, customerRetrievalOTP: null, paid: true },
  ]);

  const [lockers, setLockers] = useState([
    // Updated initial locker statuses to reflect mock package data
    { id: 'L-A01', location: 'North Campus', status: 'Occupied' }, // Reserved by PK001
    { id: 'L-A02', location: 'North Campus', status: 'Occupied' }, // En route to by PK002
    { id: 'L-B01', location: 'South Campus', status: 'Available' },
    { id: 'L-C01', location: 'Central Library', status: 'Occupied' }, // Occupied by PK003
    { id: 'L-C02', location: 'Central Library', status: 'Available' },
  ]);

  useEffect(() => {
    // Simulate initial authentication check or generate a random user ID
    // For demonstration, we'll generate a simple ID.
    const newUserId = 'user_' + Math.random().toString(36).substring(2, 7);
    setUserId(newUserId);
  }, []);

  const handleLoginSuccess = (role) => {
    setCurrentUserRole(role);
    // Set a specific userId based on role for simulation purposes
    if (role === 'customer') {
      setUserId('user_customer_sim'); // A consistent ID for customer simulation
    } else if (role === 'rider') {
      // For rider, we need to pick one of the mock rider IDs
      // Let's default to 'Rider A' for simplicity, or you can extend this to choose
      setUserId('Rider A');
    } else if (role === 'admin') {
      setUserId('user_admin_sim'); // A consistent ID for admin simulation
    }
  };

  const handleLogout = () => {
    setCurrentUserRole(null);
    setUserId('user_' + Math.random().toString(36).substring(2, 7)); // Generate new ID on logout
  };

  const renderDashboard = () => {
    switch (currentUserRole) {
      case 'customer':
        return <CustomerDashboard packages={packages} onUpdatePackage={setPackages} userId={userId} serviceFee={serviceFee} lockers={lockers} riders={riders} onUpdateLocker={setLockers} />;
      case 'rider':
        return <RiderDashboard packages={packages} onUpdatePackage={setPackages} lockers={lockers} userId={userId} serviceFee={serviceFee} commissionRate={commissionRate} riders={riders} />;
      case 'admin':
        return <AdminDashboard packages={packages} lockers={lockers} onUpdateLocker={setLockers} userId={userId} />;
      default:
        return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {currentUserRole && (
        <nav className="bg-gray-800 p-3 md:p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <h1 className="text-white text-xl md:text-2xl font-bold">UniDeliver</h1>
            <div className="flex items-center space-x-3 md:space-x-4">
              <span className="text-gray-300 text-sm md:text-lg capitalize">{currentUserRole} แดชบอร์ด</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg text-sm transition duration-300 ease-in-out transform hover:scale-105"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </nav>
      )}
      {renderDashboard()}
    </div>
  );
}

export default App;
