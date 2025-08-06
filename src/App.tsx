import React, { useState, useEffect } from 'react';
import { StoreIcon, Unlock, Box, Pin } from './component/IconLibrary';

// Type definitions
interface Package {
  id: string;
  customer: string;
  recipient?: string;
  description?: string;
  status: string;
  rider: string;
  customerRetrievalOTP: string | null;
  riderLockerAccessCode: string | null;
  paid: boolean;
  targetLockerId: string | null;
  lockerId: string | null;
}

interface Locker {
  id: string;
  location: string;
  status: string;
}

interface Rider {
  id: string;
  name: string;
}

// Carbon Tracking Interfaces
interface RecyclingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  co2Impact: number; // grams of CO2 saved
}

interface EcoStats {
  totalCO2Saved: number;
  packagesDelivered: number;
  recyclingRate: number;
  ecoScore: number;
}

// Points System Interfaces
interface EcoPoints {
  totalPoints: number;
  level: string;
  nextLevelPoints: number;
  currentLevelPoints: number;
  badges: Badge[];
  history: PointTransaction[];
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate?: Date;
  earned: boolean;
}

interface PointTransaction {
  id: string;
  activity: string;
  points: number;
  date: Date;
  type: 'earn' | 'redeem';
  icon: string;
}

// Photo Upload Interface
interface PhotoUpload {
  id: string;
  file: File | null;
  preview: string;
  uploaded: boolean;
}

interface MessageBoxProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

interface PaymentModalProps {
  packageId: string;
  serviceFee: number;
  onConfirmPayment: (packageId: string) => void;
  onClose: () => void;
}

interface OTPDisplayModalProps {
  packageId: string;
  otp: string;
  onClose: () => void;
}

interface PackageReceiptConfirmationModalProps {
  package: Package;
  onConfirmReceipt: () => void;
  onClose: () => void;
}

interface AuthScreenProps {
  onLoginSuccess: (role: string) => void;
}

// Carbon Tracking Modal Props
interface CarbonTrackingModalProps {
  isOpen: boolean;
  packageId: string;
  onClose: () => void;
  ecoStats: EcoStats;
}

interface RecyclingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteStep: (stepId: string) => void;
}

// Photo Upload Modal Props
interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoSubmit: (photo: File) => void;
  stepTitle: string;
}

// Points Dashboard Modal Props
interface PointsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  ecoPoints: EcoPoints;
}

interface CustomerDashboardProps {
  packages: Package[];
  onUpdatePackage: (packages: Package[]) => void;
  userId: string;
  serviceFee: number;
  lockers: Locker[];
  riders: Rider[];
  onUpdateLocker: (lockers: Locker[]) => void;
}

interface RiderDashboardProps {
  packages: Package[];
  onUpdatePackage: (packages: Package[]) => void;
  lockers: Locker[];
  userId: string;
  serviceFee: number;
  commissionRate: number;
  riders: Rider[];
}

interface AdminDashboardProps {
  packages: Package[];
  lockers: Locker[];
  onUpdateLocker: (lockers: Locker[]) => void;
  userId: string;
}

// Tailwind CSS is assumed to be available in the environment.

// Utility function to generate a random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// --- Shared Components ---

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center space-x-3 py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-400 border-t-transparent"></div>
    <p className="text-green-400 font-semibold select-none">กำลังโหลด...</p>
  </div>
);

// Message box for user feedback
const MessageBox: React.FC<MessageBoxProps> = ({ message, type, onClose }) => {
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
const PaymentModal: React.FC<PaymentModalProps> = ({ packageId, serviceFee, onConfirmPayment, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const handleConfirm = () => {
    setLoading(true);
    setMessage('');
    setTimeout(() => {
      setLoading(false);
      setMessageType('success');
      setMessage('ชำระเงินสำเร็จแล้ว! ไรเดอร์จะมารับพัสดุของคุณ');
      onConfirmPayment(packageId);
      // Automatically close after a short delay for better UX
      setTimeout(onClose, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-sm md:max-w-md">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">ชำระค่าบริการ EcoDeliver</h3>
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">พัสดุ #{packageId}</p>
          <p className="text-xs text-green-600 mt-1">💳 ชำระเงินเพื่อยืนยันการจอง</p>
        </div>
        <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
        <div className="text-center mb-4 md:mb-6">
          <p className="text-gray-700 text-base md:text-lg mb-2">ยอดที่ต้องชำระ: <span className="font-extrabold text-green-600 text-2xl md:text-3xl">${serviceFee.toFixed(2)}</span></p>
          <div className="bg-gray-100 p-3 md:p-4 rounded-lg inline-block">
            {/* Simulated QR Code */}
            <img
              src="./Image/Qr-PromtPay.jpeg"
              alt="QR Code"
              className="w-36 h-36 md:w-48 md:h-48 mx-auto rounded-lg shadow-md"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "https://placehold.co/180x180?text=QR+Code";
              }}
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

// OTP Display Modal Component
const OTPDisplayModal: React.FC<OTPDisplayModalProps> = ({ packageId, otp, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyOTP = async () => {
    try {
      await navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy OTP:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-green-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="eco-card p-6 md:p-8 w-full max-w-sm md:max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 float-animation">
            <span className="text-white font-bold text-2xl">🔑</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold eco-text-primary mb-2">รหัส OTP ของคุณ</h3>
          <p className="eco-text-secondary text-sm">สำหรับพัสดุ #{packageId}</p>
        </div>

        {/* OTP Display */}
        <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 text-center">
          <p className="eco-text-secondary text-sm mb-3">รหัส OTP เพื่อเปิดล็อกเกอร์:</p>
          <div className="text-3xl md:text-4xl font-bold eco-text-primary tracking-widest mb-4 font-mono">
            {otp}
          </div>
          <button
            onClick={handleCopyOTP}
            className="inline-flex items-center space-x-2 bg-green-100 hover:bg-green-200 eco-text-primary px-4 py-2 rounded-lg text-sm transition-all duration-300"
          >
            <span>{copied ? '✅' : '📋'}</span>
            <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกรหัส'}</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-500">ℹ️</span>
            <span className="text-sm font-semibold eco-text-primary">วิธีใช้งาน:</span>
          </div>
          <ul className="text-xs eco-text-secondary space-y-1">
            <li>• ไปที่ล็อกเกอร์ที่ระบุ</li>
            <li>• ป้อนรหัส OTP นี้ที่หน้าจอล็อกเกอร์</li>
            <li>• ล็อกเกอร์จะเปิดให้คุณรับพัสดุ</li>
            <li>• ชำระค่าบริการหลังรับพัสดุ</li>
          </ul>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="eco-button font-semibold py-3 px-6 rounded-lg text-sm md:text-base w-full flex items-center justify-center space-x-2"
        >
          <span>✅</span>
          <span>เข้าใจแล้ว</span>
        </button>
      </div>
    </div>
  );
};

// Package Receipt Confirmation Modal Component
const PackageReceiptConfirmationModal: React.FC<PackageReceiptConfirmationModalProps> = ({ package: pkg, onConfirmReceipt, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirmReceipt();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-green-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="eco-card p-6 md:p-8 w-full max-w-sm md:max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 float-animation">
            <Box className="text-xl text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold eco-text-primary mb-2">ยืนยันการรับพัสดุ</h3>
          <p className="eco-text-secondary text-sm">คุณได้รับพัสดุจากล็อกเกอร์แล้วใช่หรือไม่?</p>
        </div>

        {/* Package Details */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm eco-text-secondary font-semibold">หมายเลขพัสดุ:</span>
              <span className="text-sm eco-text-primary font-bold">#{pkg.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm eco-text-secondary font-semibold">ล็อกเกอร์:</span>
              <span className="text-sm eco-text-primary bg-green-100 px-2 py-1 rounded-full">
                {pkg.lockerId || pkg.targetLockerId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm eco-text-secondary font-semibold">คำอธิบายพัสดุ:</span>
              <span className="text-sm eco-text-primary">{pkg.description || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Confirmation Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-500">ℹ️</span>
            <span className="text-sm font-semibold eco-text-primary">โปรดยืนยัน:</span>
          </div>
          <ul className="text-xs eco-text-secondary space-y-1">
            <li>• คุณได้ใช้ OTP เปิดล็อกเกอร์แล้ว</li>
            <li>• คุณได้รับพัสดุจากล็อกเกอร์แล้ว</li>
            <li>• ล็อกเกอร์ได้ปิดเรียบร้อยแล้ว</li>
            <li>• การยืนยันจะทำให้ล็อกเกอร์พร้อมใช้งานใหม่</li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 eco-text-primary font-semibold py-3 px-6 rounded-lg text-sm md:text-base transition-all duration-300 w-full md:w-auto border border-gray-300"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            className="eco-button font-semibold py-3 px-6 rounded-lg text-sm md:text-base w-full md:w-auto flex items-center justify-center space-x-2"
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <span>ยืนยันการรับพัสดุ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Carbon Tracking Modal ---
const CarbonTrackingModal: React.FC<CarbonTrackingModalProps> = ({ isOpen, packageId, onClose, ecoStats }) => {
  if (!isOpen) return null;

  const carbonSteps = [
    { id: 'order', title: 'การสั่งซื้อ', icon: '📱', co2Saved: 50, completed: true },
    { id: 'pickup', title: 'การรับพัสดุ', icon: '📦', co2Saved: 100, completed: true },
    { id: 'delivery', title: 'การจัดส่ง', icon: '🚴‍♂️', co2Saved: 200, completed: true },
    { id: 'recycling', title: 'การรีไซเคิล', icon: '♻️', co2Saved: 150, completed: false }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">🌱 Carbon Tracking</h3>
              <p className="text-green-100 text-sm">แนวทางการลดคาร์บอน</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* CO2 Stats */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{ecoStats.totalCO2Saved}g</div>
              <div className="text-sm text-green-700">CO₂ ที่ประหยัดได้</div>
            </div>
          </div>

          {/* Carbon Steps */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 flex items-center space-x-2">
              <span>📋</span>
              <span>ขั้นตอนการลดคาร์บอน</span>
            </h4>
            
            {carbonSteps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{step.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">STEP {index + 1}: {step.title}</div>
                  <div className="text-sm text-gray-600">CO₂ ประหยัด: {step.co2Saved}g</div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-500 text-white' : 'bg-gray-300'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Eco Impact */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h5 className="font-bold text-blue-800 mb-3">🌍 ผลกระทบด้านสิ่งแวดล้อม</h5>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{ecoStats.packagesDelivered}</div>
                <div className="text-xs text-blue-700">พัสดุที่จัดส่ง</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">{ecoStats.recyclingRate}%</div>
                <div className="text-xs text-blue-700">อัตราการรีไซเคิล</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="eco-button font-semibold py-3 px-6 rounded-lg text-sm w-full flex items-center justify-center space-x-2"
          >
            <span>🌱</span>
            <span>เข้าใจแล้ว</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Recycling Guide Modal ---
const RecyclingGuideModal: React.FC<RecyclingGuideModalProps> = ({ isOpen, onClose, onCompleteStep }) => {
  if (!isOpen) return null;

  const recyclingSteps: RecyclingStep[] = [
    {
      id: 'unpack',
      title: 'แกะพัสดุ',
      description: 'แกะพัสดุและแยกกล่องออกจากสินค้า',
      icon: '📦',
      completed: false,
      co2Impact: 30
    },
    {
      id: 'sort',
      title: 'แยกประเภท',
      description: 'แยกวัสดุแต่ละประเภท (กระดาษ, พลาสติก, อื่นๆ)',
      icon: '🗂️',
      completed: false,
      co2Impact: 50
    },
    {
      id: 'clean',
      title: 'ทำความสะอาด',
      description: 'ทำความสะอาดบรรจุภัณฑ์ให้พร้อมรีไซเคิล',
      icon: '🧼',
      completed: false,
      co2Impact: 40
    },
    {
      id: 'recycle',
      title: 'นำไปรีไซเคิล',
      description: 'นำวัสดุไปยังจุดรีไซเคิลหรือใช้ซ้ำ',
      icon: '♻️',
      completed: false,
      co2Impact: 80
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">♻️ คู่มือการรีไซเคิล</h3>
              <p className="text-emerald-100 text-sm">ลดผลกระทบสิ่งแวดล้อม</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Impact Summary */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border-2 border-emerald-200 text-center">
            <div className="text-2xl font-bold text-emerald-600">200g CO₂</div>
            <div className="text-sm text-emerald-700">ประหยัดได้จากการรีไซเคิล</div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-800 flex items-center space-x-2">
              <span>📋</span>
              <span>ขั้นตอนการรีไซเคิล</span>
            </h4>
            
            {recyclingSteps.map((step, index) => (
              <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{step.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      ขั้นตอนที่ {index + 1}: {step.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{step.description}</div>
                    <div className="text-xs text-emerald-600 mt-2">
                      CO₂ ประหยัด: {step.co2Impact}g
                    </div>
                  </div>
                  <button
                    onClick={() => onCompleteStep(step.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      step.completed 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700'
                    }`}
                  >
                    {step.completed ? '✅ เสร็จ' : '⏳ ทำ'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h5 className="font-bold text-yellow-800 mb-2">💡 เคล็ดลับ</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• กล่องกระดาษสามารถนำมาใช้ซ้ำได้</li>
              <li>• ฟองน้ำห่อหุ้มสามารถใช้ป้องกันของเปราะได้</li>
              <li>• รีไซเคิลช่วยลดขยะและประหยัดพลังงาน</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="eco-button font-semibold py-3 px-6 rounded-lg text-sm w-full flex items-center justify-center space-x-2"
          >
            <span>♻️</span>
            <span>เข้าใจแล้ว</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Photo Upload Modal ---
const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ isOpen, onClose, onPhotoSubmit, stepTitle }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      setUploading(true);
      setTimeout(() => {
        onPhotoSubmit(selectedFile);
        setUploading(false);
        onClose();
        setSelectedFile(null);
        setPreview('');
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">📸 อัปโหลดรูปภาพ</h3>
              <p className="text-blue-100 text-sm">{stepTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">📋 วิธีการ</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• ถ่ายรูปการแยกขยะหรือการรีไซเคิล</li>
              <li>• แสดงให้เห็นการใช้กล่องซ้ำ</li>
              <li>• ได้รับ 50 แต้ม + badge พิเศษ</li>
            </ul>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {preview ? (
              <div className="space-y-4">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="mx-auto max-h-48 rounded-lg shadow-md"
                />
                <p className="text-green-600 font-medium">✅ รูปภาพพร้อมอัปโหลด</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-6xl">📷</div>
                <div>
                  <p className="text-gray-600 mb-2">คลิกเพื่อเลือกรูปภาพ</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors"
                  >
                    เลือกรูปภาพ
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Points Reward */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-200">
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-lg font-bold text-orange-600">+50 แต้ม</div>
              <div className="text-sm text-orange-700">สำหรับการรีไซเคิล</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              disabled={uploading}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || uploading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>กำลังอัปโหลด...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>อัปโหลด</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Points Dashboard Modal ---
const PointsDashboardModal: React.FC<PointsDashboardModalProps> = ({ isOpen, onClose, ecoPoints }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">🏆 แต้มสะสม EcoPoints</h3>
              <p className="text-purple-100 text-sm">Level: {ecoPoints.level}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Points Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200 text-center">
            <div className="text-4xl font-bold text-purple-600">{ecoPoints.totalPoints}</div>
            <div className="text-purple-700 font-medium">แต้มทั้งหมด</div>
            <div className="mt-2 text-sm text-purple-600">
              อีก {ecoPoints.nextLevelPoints - ecoPoints.currentLevelPoints} แต้ม จะขึ้นเลเวล
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress to next level</span>
              <span className="text-purple-600 font-medium">{ecoPoints.currentLevelPoints}/{ecoPoints.nextLevelPoints}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(ecoPoints.currentLevelPoints / ecoPoints.nextLevelPoints) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-800 flex items-center space-x-2">
              <span>🏅</span>
              <span>Badges ที่ได้รับ</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {ecoPoints.badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`p-3 rounded-lg border text-center ${
                    badge.earned 
                      ? 'bg-yellow-50 border-yellow-300' 
                      : 'bg-gray-50 border-gray-300 opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-medium text-gray-800">{badge.name}</div>
                  {badge.earned && badge.earnedDate && (
                    <div className="text-xs text-yellow-600 mt-1">
                      {badge.earnedDate.toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-800 flex items-center space-x-2">
              <span>📊</span>
              <span>กิจกรรมล่าสุด</span>
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {ecoPoints.history.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{transaction.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{transaction.activity}</div>
                      <div className="text-xs text-gray-600">{transaction.date.toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'earn' ? '+' : '-'}{transaction.points}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>🏆</span>
            <span>ปิด</span>
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Authentication Component ---
const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const handleLogin = (role: string) => {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="eco-card p-6 md:p-8 w-full max-w-sm md:max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-end py-5">
            <button
              type="button"
              onClick={() => handleLogin('admin')}
              className="bg-white border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 transition duration-200"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : (
                <>
                  <span>สำหรับแอดมิน</span>
                </>
              )}
            </button>
          </div>
          <div className="flex justify-center items-center">
            <div className="w-20 h-20 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center float-animation overflow-hidden">
              <img
                src="/Image/EcoDeliver.jpg"
                alt="plant-icon"
                className="w-25 h-25 object-contain"
              />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold eco-text-primary mb-2">
            EcoDeliver
          </h2>
          <p className="eco-text-secondary text-sm">ระบบจัดส่งเพื่อสิ่งแวดล้อม</p>
          <div className="carbon-badge mt-3">
            <span>Carbon Neutral Platform</span>
          </div>
        </div>

        <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />
        <form onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
          <div className="mb-4">
            <label className="block eco-text-primary text-sm font-semibold mb-2" htmlFor="email">
              อีเมลมหาวิทยาลัย (จำลอง)
            </label>
            <input
              type="email"
              id="email"
              className="eco-card border-2 border-green-200 rounded-lg w-full py-3 px-4 eco-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm md:text-base transition-all duration-300"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block eco-text-primary text-sm font-semibold mb-2" htmlFor="password">
              รหัสผ่าน (จำลอง)
            </label>
            <input
              type="password"
              id="password"
              className="eco-card border-2 border-green-200 rounded-lg w-full py-3 px-4 eco-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm md:text-base transition-all duration-300"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Eco Stats */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="text-center">
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="font-bold text-green-600">95%</div>
                  <div className="eco-text-secondary">Carbon Reduced</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">1000+</div>
                  <div className="eco-text-secondary">Green Deliveries</div>
                </div>
                <div>
                  <div className="font-bold text-green-600">50</div>
                  <div className="eco-text-secondary">Trees Saved</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={() => handleLogin('customer')}
              className="eco-button font-semibold py-3 px-6 rounded-lg text-base focus:outline-none w-full flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : (
                <>
                  <span>เข้าสู่ระบบในฐานะลูกค้า</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleLogin('rider')}
              className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-900 hover:to-green-950 text-white font-semibold py-3 px-6 rounded-lg text-base focus:outline-none transition-all duration-300 transform hover:scale-105 w-full flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : (
                <>
                  <span>เข้าสู่ระบบในฐานะไรเดอร์</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs eco-text-secondary">
            ร่วมกันสร้างอนาคตที่ยั่งยืน
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Customer Dashboard ---
const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ packages, onUpdatePackage, userId, serviceFee, lockers, riders, onUpdateLocker }) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [packageToPay, setPackageToPay] = useState<string | null>(null);

  const [showBookLockerModal, setShowBookLockerModal] = useState(false);
  const [selectedLockerId, setSelectedLockerId] = useState('');
  const [selectedRiderId, setSelectedRiderId] = useState(''); // New state for selected rider
  const [recipientName, setRecipientName] = useState('');
  const [packageDescription, setPackageDescription] = useState('');

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpToShow, setOtpToShow] = useState('');
  const [otpPackageId, setOtpPackageId] = useState('');

  // New state for notifications and package confirmation
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showConfirmReceiptModal, setShowConfirmReceiptModal] = useState(false);
  const [packageToConfirmReceipt, setPackageToConfirmReceipt] = useState<Package | null>(null);

  // Carbon tracking and recycling states
  const [showCarbonModal, setShowCarbonModal] = useState(false);
  const [carbonProgress] = useState({
    orderDelivery: 50,
    pickup: 100,
    delivery: 200,
    recycling: 150
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false]);
  const [showRecyclingGuide, setShowRecyclingGuide] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showPointsDashboard, setShowPointsDashboard] = useState(false);
  const [ecoPoints, setEcoPoints] = useState<EcoPoints>({
    totalPoints: 250,
    level: "3",
    nextLevelPoints: 300,
    currentLevelPoints: 250,
    badges: [
      {
        id: '1',
        name: 'Green Starter',
        icon: '🌱',
        description: 'เริ่มต้นการลดคาร์บอน',
        earned: true,
        earnedDate: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Eco Warrior',
        icon: '♻️',
        description: 'รีไซเคิล 5 ครั้ง',
        earned: true,
        earnedDate: new Date('2024-01-20')
      },
      {
        id: '3',
        name: 'Carbon Saver',
        icon: '🌍',
        description: 'ประหยัด CO2 100g',
        earned: false,
        earnedDate: undefined
      },
      {
        id: '4',
        name: 'Delivery Hero',
        icon: '🚚',
        description: 'ใช้บริการ 10 ครั้ง',
        earned: false,
        earnedDate: undefined
      }
    ],
    history: [
      {
        id: '1',
        activity: 'อัปโหลดรูปการรีไซเคิล',
        points: 50,
        date: new Date(),
        type: 'earn',
        icon: '📸'
      },
      {
        id: '2', 
        activity: 'เสร็จสิ้นการสั่งอาหาร',
        points: 25,
        date: new Date(Date.now() - 86400000),
        type: 'earn',
        icon: '🍕'
      },
      {
        id: '3',
        activity: 'แลกคูปองลดราคา',
        points: 100,
        date: new Date(Date.now() - 172800000),
        type: 'redeem',
        icon: '🎟️'
      }
    ]
  });

  // Check for new packages stored in locker and notify customer
  React.useEffect(() => {
    const customerPackages = packages.filter(pkg => pkg.customer === userId);
    const newStoredPackages = customerPackages.filter(pkg =>
      pkg.status === 'Stored in Locker' &&
      pkg.customerRetrievalOTP &&
      !notifications.includes(pkg.id)
    );

    if (newStoredPackages.length > 0) {
      const newNotifications = newStoredPackages.map(pkg => pkg.id);
      setNotifications(prev => [...prev, ...newNotifications]);

      // Show notification message
      if (newStoredPackages.length === 1) {
        const pkg = newStoredPackages[0];
        setMessageType('success');
        if (pkg.paid) {
          setMessage(`ดีใจด้วย! พัสดุ #${pkg.id} ของคุณถูกจัดเก็บในล็อกเกอร์ ${pkg.lockerId} แล้ว! 
คุณสามารถรับ OTP และไปรับพัสดุได้เลย 
ไม่ต้องชำระเงินเพิ่ม (ชำระแล้วตอนจอง)
ขอบคุณที่ใช้บริการ EcoDeliver`);
        } else {
          setMessage(`ดีใจด้วย! พัสดุ #${pkg.id} ของคุณถูกจัดเก็บในล็อกเกอร์ ${pkg.lockerId} แล้ว! 
คุณสามารถรับ OTP และไปรับพัสดุได้เลย 
จะต้องชำระค่าบริการล็อกเกอร์ก่อนรับพัสดุ
ขอบคุณที่ใช้บริการ EcoDeliver`);
        }
      } else {
        setMessageType('success');
        setMessage(`ดีใจด้วย! มีพัสดุ ${newStoredPackages.length} ชิ้นของคุณถูกจัดเก็บในล็อกเกอร์แล้ว! 
คุณสามารถรับ OTP และไปรับพัสดุได้เลย`);
      }
    }
  }, [packages, userId, notifications]);


  const handleBookLocker = (e: React.FormEvent) => {
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
    const newPackage: Package = {
      id: newPackageId,
      customer: userId, // The customer is the one booking/sending
      recipient: recipientName || 'Self', // Can be self or another recipient
      description: packageDescription || 'N/A',
      status: 'Locker Reserved, Awaiting Rider Pickup', // New status for customer-initiated booking
      rider: selectedRiderId, // Assign the selected rider
      targetLockerId: selectedLockerId,
      riderLockerAccessCode: null, // Will be generated when rider accepts
      customerRetrievalOTP: null, // Will be generated when package is stored
      paid: false, // Will be set to true after payment
      lockerId: null
    };

    onUpdatePackage([...packages, newPackage]);
    // Mark the selected locker as occupied
    onUpdateLocker(lockers.map(l => l.id === selectedLockerId ? { ...l, status: 'Occupied' } : l));

    setMessageType('success');
    setMessage(`จองล็อกเกอร์ ${selectedLockerId} และมอบหมายให้ ${riders.find(r => r.id === selectedRiderId)?.name} สำหรับพัสดุ ${newPackageId} แล้ว`);
    handleCloseBookLockerModal();

    // Open payment modal immediately after booking
    setPackageToPay(newPackageId);
    setShowPaymentModal(true);
  };

  const handleRequestLocker = (packageId: string) => {
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

  const handleReceiveOTP = (packageId: string) => {
    setMessage('');
    const pkg = packages.find(p => p.id === packageId);
    if (pkg && pkg.status.includes('Locker') && pkg.customerRetrievalOTP) {
      // Show OTP in popup instead of message
      setOtpToShow(pkg.customerRetrievalOTP);
      setOtpPackageId(packageId);
      setShowOTPModal(true);
    } else {
      setMessageType('error');
      setMessage('พัสดุยังไม่อยู่ในล็อกเกอร์ หรือ OTP ยังไม่พร้อมใช้งาน');
    }
  };

  const handleConfirmPackageReceipt = (packageId: string) => {
    setMessage('');
    const pkg = packages.find(p => p.id === packageId);
    if (pkg && pkg.status === 'Stored in Locker' && pkg.customerRetrievalOTP) {
      setPackageToConfirmReceipt(pkg);
      setShowConfirmReceiptModal(true);
    } else {
      setMessageType('error');
      setMessage('ไม่สามารถยืนยันการรับพัสดุได้ในขณะนี้');
    }
  };

  const handleFinalConfirmReceipt = () => {
    if (!packageToConfirmReceipt) return;

    const packageId = packageToConfirmReceipt.id;
    const lockerId = packageToConfirmReceipt.lockerId || packageToConfirmReceipt.targetLockerId;

    // Update package status to retrieved
    const updatedPackages = packages.map(p =>
      p.id === packageId ? {
        ...p,
        status: 'Package Retrieved',
        customerRetrievalOTP: null,
        lockerId: null
      } : p
    );
    onUpdatePackage(updatedPackages);

    // Free the locker - change status to Available
    if (lockerId) {
      const updatedLockers = lockers.map(l =>
        l.id === lockerId ? { ...l, status: 'Available' } : l
      );
      onUpdateLocker(updatedLockers);
    }

    setMessageType('success');
    setMessage(`🎉 ยืนยันการรับพัสดุ #${packageId} เรียบร้อยแล้ว! 
ล็อกเกอร์ ${lockerId} ได้ถูกปลดล็อกและพร้อมใช้งาน 
ขอบคุณที่ใช้บริการ EcoDeliver`);

    setShowConfirmReceiptModal(false);
    setPackageToConfirmReceipt(null);
  };

  const handleCloseBookLockerModal = () => {
    setShowBookLockerModal(false);
    setSelectedLockerId('');
    setSelectedRiderId('');
    setRecipientName('');
    setPackageDescription('');
  };

  // Photo upload handler for recycling step
  const handlePhotoSubmit = (file: File) => {
    // Add points for recycling photo submission
    setEcoPoints(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + 50,
      currentLevelPoints: prev.currentLevelPoints + 50,
      history: [
        {
          id: Date.now().toString(),
          activity: 'อัปโหลดรูปการรีไซเคิล',
          points: 50,
          date: new Date(),
          type: 'earn',
          icon: '📸'
        },
        ...prev.history
      ]
    }));

    // Mark recycling step as completed
    setCompletedSteps(prev => {
      const newSteps = [...prev];
      newSteps[3] = true; // Step 4 (recycling)
      return newSteps;
    });

    setMessage('🎉 ยินดีด้วย! คุณได้รับ 50 แต้มจากการอัปโหลดรูปการรีไซเคิล');
    setMessageType('success');
    setShowPhotoUpload(false);
  };

  const handleConfirmPayment = (packageId: string) => {
    const packageToUpdate = packages.find(p => p.id === packageId);

    if (!packageToUpdate) return;

    let newStatus = '';
    let shouldFreeLocker = false;

    // Determine new status based on current status
    if (packageToUpdate.status === 'Locker Reserved, Awaiting Rider Pickup') {
      // Payment after booking locker - ready for rider pickup
      newStatus = 'Paid, Ready for Rider Pickup';
    } else if (packageToUpdate.status === 'Stored in Locker') {
      // Payment after retrieving package - completely done
      newStatus = 'Retrieved & Paid';
      shouldFreeLocker = true;
    } else {
      // Default case - mark as paid
      newStatus = 'Retrieved & Paid';
      shouldFreeLocker = true;
    }

    const updatedPackages = packages.map(p =>
      p.id === packageId ? { ...p, paid: true, status: newStatus } : p
    );
    onUpdatePackage(updatedPackages);

    // Free the locker only if package is completely done
    if (shouldFreeLocker) {
      const retrievedPackage = packages.find(p => p.id === packageId);
      if (retrievedPackage && (retrievedPackage.lockerId || retrievedPackage.targetLockerId)) {
        const lockerIdToUpdate = retrievedPackage.lockerId || retrievedPackage.targetLockerId;
        onUpdateLocker(lockers.map(l => l.id === lockerIdToUpdate ? { ...l, status: 'Available' } : l));
      }
    }

    setMessageType('success');
    if (newStatus === 'Paid, Ready for Rider Pickup') {
      setMessage(`ชำระเงินสำเร็จ! พัสดุ ${packageId} พร้อมสำหรับไรเดอร์มารับแล้ว`);
    } else {
      setMessage(`ชำระค่าบริการสำหรับพัสดุ ${packageId} แล้ว`);
    }
    setShowPaymentModal(false);
    setPackageToPay(null);
  };

  const customerPackages = packages.filter(pkg => pkg.customer === userId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-inter">
      <div className="w-full">
        {/* Mobile-First Hero Section */}
        <div className="eco-card m-2 md:m-6 p-4 md:p-8 text-center">
          <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center float-animation overflow-hidden">
              <img
                src="/Image/EcoDeliver.jpg"
                alt="plant icon"
                className="w-20 h-20 md:w-20 md:h-20 object-contain"
              />
            </div>
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold eco-text-primary">
              แดชบอร์ดลูกค้า
            </h2>
          </div>
          <p className="eco-text-secondary mb-3 md:mb-4 text-sm md:text-base">
            ยินดีต้อนรับสู่ระบบจัดส่งเพื่อสิ่งแวดล้อม
          </p>
          <div className="inline-block mb-3 md:mb-4 px-2 md:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs md:text-sm font-semibold">
            ID: {userId}
          </div>

          {/* Mobile-optimized eco features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
            <div className="flex items-center justify-center space-x-1 md:space-x-2 p-2 bg-green-50 rounded-lg">
              <span className="eco-text-secondary">Carbon Neutral</span>
            </div>
            <div className="flex items-center justify-center space-x-1 md:space-x-2 p-2 bg-green-50 rounded-lg">
              <span className="text-green-500 text-sm md:text-base">♻️</span>
              <span className="eco-text-secondary">Eco-Friendly</span>
            </div>
            <div className="flex items-center justify-center space-x-1 md:space-x-2 p-2 bg-green-50 rounded-lg">
              <span className="eco-text-secondary">Green Transport</span>
            </div>
          </div>
        </div>

        <div className="px-2 md:px-6">
          <MessageBox message={message} type={messageType} onClose={() => setMessage('')} />

          {/* Mobile-Optimized Available Lockers Section */}
          <div className="eco-card mb-4 md:mb-6 p-4 md:p-6">
            <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-4 md:mb-6">
              <StoreIcon className="text-xl md:text-2xl text-green-700" />
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold eco-text-primary">ล็อกเกอร์ที่พร้อมใช้งาน</h3>
              <div className="carbon-badge text-xs hidden md:block">
                <span>Zero Emission</span>
              </div>
            </div>

            {/* Mobile-friendly grid layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
              {lockers.filter(locker => locker.status === 'Available').length === 0 ? (
                <div className="col-span-full text-center eco-text-secondary p-4">
                  <p className="text-sm md:text-base">ไม่มีล็อกเกอร์ว่างในขณะนี้</p>
                </div>
              ) : (
                lockers.filter(locker => locker.status === 'Available').map((locker) => (
                  <div
                    key={locker.id}
                    className="realistic-locker available cursor-pointer h-24 sm:h-32 md:h-40 lg:h-48 transition-transform hover:scale-105 active:scale-95"
                    onClick={() => {
                      console.log(`Eco Locker ${locker.id} selected - *soft beep*`);
                      setSelectedLockerId(locker.id);
                      setShowBookLockerModal(true);
                    }}
                  >
                    {/* LED Status Light */}
                    <div className="locker-led available"></div>

                    {/* Digital Display - responsive text */}
                    <div className="locker-display text-xs md:text-sm">READY</div>

                    {/* Locker Door */}
                    <div className="locker-door">
                      {/* Handle */}
                      <div className="locker-handle"></div>

                      {/* Lock Mechanism */}
                      <div className="locker-lock"></div>

                      {/* Ventilation */}
                      <div className="locker-vents"></div>
                    </div>

                    {/* Locker Number - responsive sizing */}
                    <div className="locker-number text-xs md:text-sm lg:text-base">{locker.id}</div>

                    {/* Location Badge - hide on very small screens */}
                    <div className="absolute top-1 md:top-2 left-1/2 transform -translate-x-1/2 
                bg-green-100 text-green-700 text-xs px-2 py-1 
                rounded-full font-semibold hidden sm:flex items-center gap-1">
                      <Pin className="text-sm md:text-base text-green-700" />
                      {locker.location}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* Occupied Lockers Section - Minimal Eco Design */}
          <div className="eco-card mb-6 md:mb-8 p-6 md:p-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Unlock className="text-xl text-orange-700" />
              <h3 className="text-orange-700 text-xl md:text-2xl font-bold eco-text-primary">ล็อกเกอร์ที่ใช้งานอยู่</h3>
              <div className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-semibold">
                <span>In Use</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {lockers.filter(locker => locker.status === 'Occupied').length === 0 ? (
                <p className="col-span-full text-center eco-text-secondary">ไม่มีล็อกเกอร์ที่ถูกใช้งานในขณะนี้</p>
              ) : (
                lockers.filter(locker => locker.status === 'Occupied').map((locker) => (
                  <div
                    key={locker.id}
                    className="realistic-locker occupied cursor-not-allowed h-40 md:h-48"
                  >
                    {/* LED Status Light */}
                    <div className="locker-led occupied"></div>

                    {/* Digital Display */}
                    <div className="locker-display occupied">BUSY</div>

                    {/* Locker Door */}
                    <div className="locker-door">
                      {/* Handle */}
                      <div className="locker-handle"></div>

                      {/* Lock Mechanism */}
                      <div className="locker-lock"></div>

                      {/* Ventilation */}
                      <div className="locker-vents"></div>

                      {/* Package Indicator */}
                      <div className="package-indicator">
                        <Box className="text-4xl md:text-6xl mb-3 md:mb-4 text-yellow-400" />
                      </div>
                    </div>

                    {/* Keypad */}
                    <div className="locker-keypad">
                      <div className="keypad-button">1</div>
                      <div className="keypad-button">2</div>
                      <div className="keypad-button">3</div>
                      <div className="keypad-button">4</div>
                      <div className="keypad-button">5</div>
                      <div className="keypad-button">6</div>
                      <div className="keypad-button">7</div>
                      <div className="keypad-button">8</div>
                      <div className="keypad-button">9</div>
                    </div>

                    {/* Locker Number */}
                    <div className="locker-number">{locker.id}</div>

                    {/* Location Badge */}
                    <div className="absolute top-2 left-20 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Pin className="text-base text-red-700" />
                      {locker.location}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mobile-Optimized Package Status Section */}
          <div className="eco-card p-4 md:p-6">
            <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-4 md:mb-6">
              <Box className="text-xl text-yellow-400" />
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold eco-text-primary">สถานะพัสดุของคุณ</h3>
              <div className="carbon-badge text-xs hidden md:block">
                <span>Green Delivery</span>
              </div>
            </div>

            {/* Mobile-friendly package grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
              {customerPackages.length === 0 ? (
                <div className="col-span-full text-center py-6 md:py-8">
                  <Box className="text-4xl md:text-6xl mb-3 md:mb-4 text-yellow-400 mx-auto" />                   <p className="eco-text-secondary text-sm md:text-base">ไม่มีพัสดุในขณะนี้</p>
                  <p className="text-xs md:text-sm eco-text-secondary mt-1 md:mt-2">เริ่มต้นการจัดส่งที่เป็นมิตรกับสิ่งแวดล้อม</p>
                </div>
              ) : (
                customerPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="eco-card p-3 md:p-4 hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Mobile-optimized header */}
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <h3 className="text-base md:text-lg font-bold eco-text-primary">พัสดุ #{pkg.id}</h3>
                      <div className="flex items-center space-x-1 md:space-x-2">
                        <span className="bg-green-500 text-white text-xs eco-text-secondary sm:inline rounded-full px-2 py-1">
                          Eco Package
                        </span>
                      </div>
                    </div>

                    {/* Mobile-friendly content layout */}
                    <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                      {/* Status - always visible */}
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <span className="font-semibold eco-text-secondary text-xs md:text-sm">สถานะ:</span>
                        <span className={`text-xs md:text-sm font-medium px-2 py-1 rounded-full inline-block w-fit ${pkg.status.includes('Delivered') || pkg.status.includes('Paid') || pkg.status.includes('Retrieved')
                          ? 'bg-green-100 text-green-600'
                          : pkg.status.includes('Locker') || pkg.status.includes('Awaiting Rider') || pkg.status.includes('En Route')
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-orange-100 text-orange-600'
                          }`}>
                          {pkg.status}
                        </span>
                      </div>

                      {/* Rider info */}
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                        <span className="font-semibold eco-text-secondary text-xs md:text-sm">ไรเดอร์:</span>
                        <span className="text-xs md:text-sm eco-text-primary">
                          {riders.find(r => r.id === pkg.rider)?.name || pkg.rider || 'N/A'}
                        </span>
                      </div>

                      {/* Target locker */}
                      {pkg.targetLockerId && (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <span className="font-semibold eco-text-secondary text-xs md:text-sm">ล็อกเกอร์เป้าหมาย:</span>
                          <span className="text-xs md:text-sm eco-text-primary bg-green-100 px-2 py-1 rounded-full inline-block w-fit">
                            {pkg.targetLockerId}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rider access code - mobile responsive */}
                    {pkg.riderLockerAccessCode && pkg.status === 'Picked Up, En Route to Locker' && (
                      <div className="text-xs md:text-sm text-red-600 mb-2 md:mb-3 p-2 bg-red-50 rounded-lg">
                        <span className="font-semibold block mb-1">รหัสเข้าถึงล็อกเกอร์ไรเดอร์:</span>
                        <span className="font-mono bg-red-100 px-2 py-1 rounded">{pkg.riderLockerAccessCode}</span>
                        <span className="block text-xs mt-1">(สำหรับไรเดอร์)</span>
                      </div>
                    )}

                    {/* Mobile-optimized action buttons */}
                    <div className="mt-2 md:mt-4 space-y-2">
                      {pkg.status === 'Out for Delivery' && (
                        <button
                          onClick={() => handleRequestLocker(pkg.id)}
                          className="w-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white font-bold py-3 md:py-2 px-4 rounded-lg text-sm transition duration-200 ease-in-out transform active:scale-95 touch-manipulation"
                        >
                          ร้องขอจัดเก็บในล็อกเกอร์ (เปลี่ยนเส้นทาง)
                        </button>
                      )}
                      {pkg.status === 'Stored in Locker' && (
                        <>
                          <button
                            onClick={() => handleReceiveOTP(pkg.id)}
                            className="w-full bg-green-400 hover:bg-green-500 active:bg-green-700 text-white font-bold py-3 md:py-2 px-4 rounded-lg text-sm transition duration-200 ease-in-out transform active:scale-95 touch-manipulation"
                          >
                            รับ OTP ล็อกเกอร์
                          </button>
                          <button
                            onClick={() => handleConfirmPackageReceipt(pkg.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 md:py-2 px-4 rounded-lg text-sm transition duration-200 ease-in-out transform active:scale-95 touch-manipulation"
                          >
                            ยืนยันรับพัสดุแล้ว
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {showPaymentModal && packageToPay && (
            <PaymentModal
              packageId={packageToPay}
              serviceFee={serviceFee}
              onConfirmPayment={handleConfirmPayment}
              onClose={() => setShowPaymentModal(false)}
            />
          )}
          {showBookLockerModal && (
            <div className="fixed inset-0 bg-green-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50 overflow-y-auto">
              <div className="eco-card p-4 md:p-6 w-full max-w-sm md:max-w-md mx-2 my-4 max-h-screen overflow-y-auto">
                <div className="text-center mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold eco-text-primary mb-2">จองล็อกเกอร์ Eco-Friendly</h3>
                  <p className="eco-text-secondary text-xs md:text-sm">การจัดส่งที่เป็นมิตรกับสิ่งแวดล้อม</p>
                </div>

                {/* Mobile-optimized selected locker info */}
                {selectedLockerId && (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2 md:mb-3">
                      <span className="text-green-500 text-sm md:text-base">🏪</span>
                      <h4 className="font-semibold eco-text-primary text-sm md:text-base">ล็อกเกอร์ที่เลือก</h4>
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm eco-text-secondary">รหัส:</span>
                        <span className="text-xs md:text-sm font-medium eco-text-primary bg-green-100 px-2 py-1 rounded-full">
                          {selectedLockerId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm eco-text-secondary">ที่ตั้ง:</span>
                        <span className="text-xs md:text-sm eco-text-primary flex items-center gap-1">
                          <Pin className="text-green-600 text-sm md:text-base" />
                          {lockers.find(l => l.id === selectedLockerId)?.location}
                        </span>

                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm eco-text-secondary">สถานะ:</span>
                        <div className="flex items-center space-x-1">
                          <div className="eco-status w-2 h-2"></div>
                          <span className="text-xs md:text-sm text-green-600 font-medium">ว่าง</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleBookLocker}>
                  <div className="mb-3 md:mb-4">
                    <label className="block eco-text-primary text-xs md:text-sm font-semibold mb-1 md:mb-2" htmlFor="recipientName">
                      ชื่อผู้รับ (ถ้าแตกต่างจากคุณ):
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      className="eco-card border-2 border-green-200 rounded-lg w-full py-2 md:py-3 px-3 md:px-4 eco-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm transition-all duration-300 touch-manipulation"
                      placeholder="เช่น สมชาย"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block eco-text-primary text-sm font-semibold mb-2" htmlFor="packageDescription">
                      คำอธิบายพัสดุ:
                    </label>
                    <input
                      type="text"
                      id="packageDescription"
                      className="eco-card border-2 border-green-200 rounded-lg w-full py-3 px-4 eco-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm md:text-base transition-all duration-300"
                      placeholder="เช่น หนังสือ, เสื้อผ้า"
                      value={packageDescription}
                      onChange={(e) => setPackageDescription(e.target.value)}
                      required
                    />
                  </div>

                  {/* Show locker selection only if no locker is pre-selected */}
                  {!selectedLockerId && (
                    <div className="mb-3 md:mb-4">
                      <label className="block eco-text-primary text-xs md:text-sm font-semibold mb-1 md:mb-2" htmlFor="lockerSelect">
                        เลือกล็อกเกอร์สำหรับจัดเก็บ:
                      </label>
                      <select
                        id="lockerSelect"
                        className="eco-card border-2 border-green-200 rounded-lg w-full py-2 md:py-3 px-3 md:px-4 eco-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm transition-all duration-300 touch-manipulation"
                        value={selectedLockerId}
                        onChange={(e) => setSelectedLockerId(e.target.value)}
                        required
                      >
                        <option value="">-- เลือกล็อกเกอร์ --</option>
                        {lockers.filter(l => l.status === 'Available').map(locker => (
                          <option key={locker.id} value={locker.id}>
                            {locker.id} ({locker.location})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-4 md:mb-6">
                    <label className="block eco-text-primary text-xs md:text-sm font-semibold mb-1 md:mb-2" htmlFor="riderSelect">
                      เลือกไรเดอร์:
                    </label>
                    <select
                      id="riderSelect"
                      className="eco-card border-2 border-green-200 rounded-lg w-full py-2 md:py-3 px-3 md:px-4 eco-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm transition-all duration-300 touch-manipulation"
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

                  {/* Mobile-optimized eco-friendly message */}
                  <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-1 md:space-x-2 mb-1 md:mb-2">
                      <span className="text-xs md:text-sm font-semibold eco-text-primary">การจัดส่งเพื่อสิ่งแวดล้อม</span>
                    </div>
                    <p className="text-xs eco-text-secondary">
                      การจัดส่งแต่ละครั้งช่วยลดการปล่อยคาร์บอน และใช้บรรจุภัณฑ์ที่เป็นมิตรกับสิ่งแวดล้อม
                    </p>
                  </div>

                  {/* Mobile-optimized action buttons */}
                  <div className="flex flex-col space-y-2 md:flex-row md:justify-end md:space-y-0 md:space-x-3">
                    <button
                      type="button"
                      onClick={handleCloseBookLockerModal}
                      className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 eco-text-primary font-semibold py-3 px-4 rounded-lg text-sm transition-all duration-200 w-full md:w-auto border border-gray-300 touch-manipulation"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="eco-button font-semibold py-3 px-4 rounded-lg text-sm w-full md:w-auto flex items-center justify-center space-x-2 touch-manipulation active:scale-95 transition-transform duration-200"
                    >
                      <span>จองล็อกเกอร์</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* New Eco Features Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 md:p-6 rounded-lg border-2 border-green-200 mb-6">
            <h3 className="text-lg md:text-xl font-bold text-green-800 mb-4 flex items-center space-x-2">
              <span>🌱</span>
              <span>ฟีเจอร์ลดคาร์บอน</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Carbon Tracking Button */}
              <button
                onClick={() => setShowCarbonModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>🌍</span>
                <span>Carbon Tracking</span>
              </button>

              {/* Recycling Guide Button */}
              <button
                onClick={() => setShowRecyclingGuide(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>♻️</span>
                <span>คู่มือรีไซเคิล</span>
              </button>

              {/* Points Dashboard Button */}
              <button
                onClick={() => setShowPointsDashboard(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>🏆</span>
                <span>แต้มสะสม ({ecoPoints.totalPoints})</span>
              </button>
            </div>

            {/* Quick Photo Upload for Recycling */}
            <div className="mt-4 pt-4 border-t border-green-300">
              <button
                onClick={() => setShowPhotoUpload(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>📸</span>
                <span>อัปโหลดรูปการรีไซเคิล (+50 แต้ม)</span>
              </button>
            </div>
          </div>

          {showOTPModal && (
            <OTPDisplayModal
              packageId={otpPackageId}
              otp={otpToShow}
              onClose={() => setShowOTPModal(false)}
            />
          )}
          {showConfirmReceiptModal && packageToConfirmReceipt && (
            <PackageReceiptConfirmationModal
              package={packageToConfirmReceipt}
              onConfirmReceipt={handleFinalConfirmReceipt}
              onClose={() => setShowConfirmReceiptModal(false)}
            />
          )}

          {/* New Modal Components */}
          {showCarbonModal && (
            <CarbonTrackingModal
              isOpen={showCarbonModal}
              packageId={userId}
              onClose={() => setShowCarbonModal(false)}
              ecoStats={{
                totalCO2Saved: carbonProgress.orderDelivery + carbonProgress.pickup + carbonProgress.delivery + carbonProgress.recycling,
                packagesDelivered: packages.filter(pkg => pkg.customer === userId && pkg.status === 'Delivered').length,
                recyclingRate: completedSteps[3] ? 100 : 0,
                ecoScore: 95
              }}
            />
          )}

          {showRecyclingGuide && (
            <RecyclingGuideModal
              isOpen={showRecyclingGuide}
              onClose={() => setShowRecyclingGuide(false)}
              onCompleteStep={(stepId: string) => {
                const stepIndex = parseInt(stepId) - 1;
                const newSteps = [...completedSteps];
                newSteps[stepIndex] = true;
                setCompletedSteps(newSteps);
                
                if (stepIndex === 3) { // Step 4 (recycling)
                  setShowPhotoUpload(true);
                }
              }}
            />
          )}

          {showPhotoUpload && (
            <PhotoUploadModal
              isOpen={showPhotoUpload}
              onClose={() => setShowPhotoUpload(false)}
              onPhotoSubmit={handlePhotoSubmit}
              stepTitle="ขั้นตอนที่ 4: นำไปรีไซเคิล"
            />
          )}

          {showPointsDashboard && (
            <PointsDashboardModal
              isOpen={showPointsDashboard}
              onClose={() => setShowPointsDashboard(false)}
              ecoPoints={ecoPoints}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// --- Rider Dashboard ---
const RiderDashboard: React.FC<RiderDashboardProps> = ({ packages, onUpdatePackage, lockers, userId, serviceFee, commissionRate, riders }) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState('');
  const [lockerNumber, setLockerNumber] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  // Filter jobs for the current rider: either assigned directly or 'Pending' for general pickup
  const currentRiderId = userId; // Use userId directly as the rider ID
  const availableJobs = packages.filter(pkg =>
    (pkg.status === 'Locker Reserved, Awaiting Rider Pickup' && pkg.rider === currentRiderId) || // Assigned to this rider
    (pkg.status === 'Paid, Ready for Rider Pickup' && pkg.rider === currentRiderId) || // Paid and ready for pickup
    (pkg.status === 'Out for Delivery' && pkg.rider === currentRiderId) || // Assigned direct delivery
    (pkg.status === 'Locker Requested' && pkg.rider === 'Pending Assignment') // Any rider can pick up redirection requests
    // Note: 'Pending' status (unassigned initial jobs) can be added here if needed
  );

  const handleAcceptJob = (packageId: string) => {
    setMessage('');
    const updatedPackages = packages.map(pkg => {
      if (pkg.id === packageId) {
        let newStatus = pkg.status;
        let riderLockerAccessCode = pkg.riderLockerAccessCode;

        if (pkg.status === 'Locker Reserved, Awaiting Rider Pickup' ||
          pkg.status === 'Paid, Ready for Rider Pickup' ||
          pkg.status === 'Locker Requested') {
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

  const handleUpdateStatus = (e: React.FormEvent) => {
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

      // Store the original paid status before changing status
      const wasAlreadyPaid = currentPackage.paid;
      const wasPreBookedLocker = currentPackage.status === 'Paid, Ready for Rider Pickup';

      currentPackage.status = 'Stored in Locker';
      currentPackage.lockerId = finalLockerId;
      currentPackage.customerRetrievalOTP = customerOtp;
      currentPackage.riderLockerAccessCode = null; // Rider's code is no longer needed

      // Keep payment status: if customer already paid (pre-booked locker), don't require payment again
      if (wasPreBookedLocker || wasAlreadyPaid) {
        currentPackage.paid = true; // Customer already paid when booking locker
      } else {
        currentPackage.paid = false; // Customer needs to pay for locker storage (redirected packages)
      }

      // Simulate updating locker availability (if a real locker system)
      // In a real app, this would be an API call to the locker system.
      // E.g., `updateLockerStatus(lockerNumber, 'occupied', packageId)`
      // The locker status is updated in App.js when the package is retrieved and paid.

      setMessageType('success');
      if (wasPreBookedLocker || wasAlreadyPaid) {
        setMessage(`🎉 พัสดุ ${selectedJobId} จัดเก็บในล็อกเกอร์ ${finalLockerId} แล้ว! 
📱 ระบบได้ส่งการแจ้งเตือนไปยังลูกค้าแล้ว 
🔑 OTP สำหรับลูกค้า: ${customerOtp}
✅ ลูกค้าได้ชำระเงินแล้วตั้งแต่จองล็อกเกอร์ ไม่ต้องชำระเพิ่ม
💡 ลูกค้าสามารถใช้ OTP นี้เพื่อเปิดล็อกเกอร์และรับพัสดุได้เลย`);
      } else {
        setMessage(`🎉 พัสดุ ${selectedJobId} จัดเก็บในล็อกเกอร์ ${finalLockerId} แล้ว! 
📱 ระบบได้ส่งการแจ้งเตือนไปยังลูกค้าแล้ว 
🔑 OTP สำหรับลูกค้า: ${customerOtp}
💳 ลูกค้าจะต้องชำระค่าบริการล็อกเกอร์ก่อนรับพัสดุ
💡 ลูกค้าสามารถใช้ OTP นี้เพื่อเปิดล็อกเกอร์และรับพัสดุได้`);
      }
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
const AdminDashboard: React.FC<AdminDashboardProps> = ({ packages, lockers, onUpdateLocker, userId }) => {
  const [serviceFee, setServiceFee] = useState(2.50); // Default fee
  const [commissionRate, setCommissionRate] = useState(0.15); // Default 15% commission
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    // Simulate API call to update settings
    setMessageType('success');
    setMessage('ค่าบริการและอัตราคอมมิชชันได้รับการอัปเดตแล้ว!');
  };

  const handleLockerStatusChange = (lockerId: string, newStatus: string) => {
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
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null); // 'customer', 'rider', 'admin', or null (for not logged in)
  const [userId, setUserId] = useState<string>(''); // To simulate a unique user ID
  const serviceFee = 2.50; // Default fee, passed down to CustomerDashboard
  const commissionRate = 0.15; // Default 15% commission, passed down to RiderDashboard

  // Carbon Tracking States
  const [showCarbonTracking, setShowCarbonTracking] = useState(false);
  const [showRecyclingGuide, setShowRecyclingGuide] = useState(false);
  const [selectedPackageForCarbon, setSelectedPackageForCarbon] = useState<string>('');
  const [ecoStats, setEcoStats] = useState<EcoStats>({
    totalCO2Saved: 485,
    packagesDelivered: 24,
    recyclingRate: 78,
    ecoScore: 92
  });

  // Mock data for riders
  const riders: Rider[] = [
    { id: 'Rider A', name: 'ไรเดอร์ A' },
    { id: 'Rider B', name: 'ไรเดอร์ B' },
    { id: 'Rider C', name: 'ไรเดอร์ C' },
  ];

  // Mock data for packages and lockers
  const [packages, setPackages] = useState<Package[]>([
    { id: 'PK001', customer: 'user_customer_sim', recipient: 'Alice', description: 'Books', status: 'Locker Reserved, Awaiting Rider Pickup', rider: 'Rider A', targetLockerId: 'L-A01', riderLockerAccessCode: null, customerRetrievalOTP: null, paid: false, lockerId: null },
    { id: 'PK002', customer: 'user_customer_sim', recipient: 'Bob', description: 'Clothes', status: 'Paid, Ready for Rider Pickup', rider: 'Rider B', targetLockerId: 'L-A02', riderLockerAccessCode: null, customerRetrievalOTP: null, paid: true, lockerId: null },
    { id: 'PK003', customer: 'user_customer_sim', recipient: 'Charlie', description: 'Gadget', status: 'Stored in Locker', rider: 'Rider C', targetLockerId: 'L-C01', riderLockerAccessCode: null, customerRetrievalOTP: generateOTP(), paid: true, lockerId: 'L-C01' },
    { id: 'PK004', customer: 'user_customer_sim', recipient: 'Diana', description: 'Documents', status: 'Retrieved & Paid', rider: 'Rider A', targetLockerId: null, riderLockerAccessCode: null, customerRetrievalOTP: null, paid: true, lockerId: null },
  ]);

  const [lockers, setLockers] = useState<Locker[]>([
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

  const handleLoginSuccess = (role: string) => {
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

  // Carbon Tracking Functions
  const handleShowCarbonTracking = (packageId: string) => {
    setSelectedPackageForCarbon(packageId);
    setShowCarbonTracking(true);
  };

  const handleShowRecyclingGuide = () => {
    setShowRecyclingGuide(true);
  };

  const handleCompleteRecyclingStep = (stepId: string) => {
    // Update eco stats when recycling step is completed
    setEcoStats(prev => ({
      ...prev,
      totalCO2Saved: prev.totalCO2Saved + 50, // Add CO2 savings for completed step
      recyclingRate: Math.min(100, prev.recyclingRate + 2), // Increase recycling rate
      ecoScore: Math.min(100, prev.ecoScore + 1) // Increase eco score
    }));
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-inter">
      {currentUserRole && (
        <nav className="eco-header bg-white/80 backdrop-blur-xl p-3 md:p-4 shadow-sm border-b border-green-100">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center float-animation overflow-hidden">
                  <img
                    src="/Image/EcoDeliver.jpg"
                    alt="plant icon"
                    className="w-20 h-20 md:w-20 md:h-20 object-contain"
                  />
                </div>

                <h1 className="eco-text-primary text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  EcoDeliver
                </h1>
              </div>
              <div className="carbon-badge">
                <span>Carbon Neutral</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="eco-status"></div>
                <span className="eco-text-secondary text-sm md:text-base capitalize">{currentUserRole} แดชบอร์ด</span>
              </div>
              
              {/* Carbon Tracking Buttons */}
              <button
                onClick={() => handleShowCarbonTracking('current')}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-2 px-3 rounded-lg text-xs md:text-sm transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center space-x-1"
                title="ติดตาม Carbon Footprint"
              >
                <span>🌱</span>
                <span className="hidden md:block">Carbon</span>
              </button>
              
              <button
                onClick={handleShowRecyclingGuide}
                className="bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white font-semibold py-2 px-3 rounded-lg text-xs md:text-sm transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg flex items-center space-x-1"
                title="คู่มือการรีไซเคิล"
              >
                <span>♻️</span>
                <span className="hidden md:block">Recycle</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </nav>
      )}
      {renderDashboard()}
      
      {/* Carbon Tracking Modals */}
      <CarbonTrackingModal
        isOpen={showCarbonTracking}
        packageId={selectedPackageForCarbon}
        onClose={() => setShowCarbonTracking(false)}
        ecoStats={ecoStats}
      />
      
      <RecyclingGuideModal
        isOpen={showRecyclingGuide}
        onClose={() => setShowRecyclingGuide(false)}
        onCompleteStep={handleCompleteRecyclingStep}
      />
    </div>
  );
}

export default App;
