# 📊 Smart Delivery App - System Flowcharts

## 🎯 Main Workflow Flowchart

```mermaid
graph TD
    A[Customer Opens App] --> B{Select Service}
    B --> |Book Locker| C[Select Available Locker]
    B --> |Track Package| D[View Package Status]
    
    C --> E[Choose Recipient & Description]
    E --> F[Select Rider]
    F --> G[💳 Pay Service Fee]
    G --> H[🔒 Locker Reserved]
    
    H --> I[Rider Receives Assignment]
    I --> J[Rider Picks Up Package]
    J --> K{Package Collected?}
    K --> |Yes| L[Rider Goes to Locker]
    K --> |No| M[Update Status: Failed Pickup]
    
    L --> N[🔑 Rider Gets Access Code]
    N --> O[Rider Stores Package in Locker]
    O --> P[📱 Customer Notification Sent]
    
    P --> Q[Customer Receives Alert]
    Q --> R[Customer Goes to Locker]
    R --> S[🔢 Customer Requests OTP]
    S --> T[System Generates OTP]
    T --> U[📋 OTP Display Modal]
    
    U --> V[Customer Opens Locker]
    V --> W[Customer Retrieves Package]
    W --> X[✅ Customer Confirms Receipt]
    X --> Y[🟢 Locker Becomes Available]
    
    M --> Z[End: Failed Delivery]
    Y --> AA[End: Successful Delivery]
```

## 🔐 Locker Management Flowchart

```mermaid
graph TD
    A[System Startup] --> B[Initialize All Lockers as Available 🟢]
    
    C[Customer Books Locker] --> D[Select Locker from Available List]
    D --> E[Locker Status: Reserved 🟡]
    E --> F[Payment Processing]
    F --> |Success| G[Locker Status: Occupied 🔴]
    F --> |Failed| H[Locker Status: Available 🟢]
    
    G --> I[Generate Rider Access Code]
    I --> J[Rider Stores Package]
    J --> K[Generate Customer OTP]
    
    K --> L[Customer Uses OTP]
    L --> M{OTP Valid?}
    M --> |Yes| N[Locker Opens]
    M --> |No| O[Error: Invalid OTP]
    
    N --> P[Customer Retrieves Package]
    P --> Q[Customer Confirms Receipt]
    Q --> R[Locker Status: Available 🟢]
    
    O --> S[Customer Requests New OTP]
    S --> K
    
    H --> T[Refund Customer]
    T --> U[Notify Customer of Failure]
```

## 👥 User Role Flowchart

```mermaid
graph TD
    A[User Enters App] --> B{Select User Type}
    
    B --> |Customer| C[Customer Dashboard]
    B --> |Rider| D[Rider Dashboard]
    
    C --> E[Book New Locker]
    C --> F[Track My Packages]
    C --> G[View Notifications]
    C --> H[Retrieve Package with OTP]
    
    D --> I[View Assigned Deliveries]
    D --> J[Update Package Status]
    D --> K[Store Package in Locker]
    D --> L[Complete Delivery]
    
    E --> M[Payment Process]
    F --> N[Package Status Display]
    G --> O[Notification List]
    H --> P[OTP Verification]
    
    I --> Q[Pickup Package from Sender]
    J --> R[Status Update Options]
    K --> S[Get Locker Access Code]
    L --> T[Mark as Delivered]
```

## 🔄 Payment Flow

```mermaid
graph TD
    A[Customer Selects Locker] --> B[Calculate Service Fee]
    B --> C[Display Payment Modal]
    C --> D{Customer Confirms Payment?}
    
    D --> |Yes| E[Process Payment]
    D --> |No| F[Cancel Booking]
    
    E --> G{Payment Successful?}
    G --> |Yes| H[Update Package Status: Paid]
    G --> |No| I[Payment Failed]
    
    H --> J[Reserve Locker]
    J --> K[Assign Rider]
    K --> L[Send Confirmation to Customer]
    
    I --> M[Show Error Message]
    M --> N[Return to Payment Options]
    N --> C
    
    F --> O[Release Locker]
    O --> P[Return to Locker Selection]
```

## 📱 Notification System Flow

```mermaid
graph TD
    A[System Monitor] --> B{Check for Status Changes}
    
    B --> |Package Stored| C[Generate Customer Notification]
    B --> |Rider Assigned| D[Generate Rider Notification]
    B --> |Payment Processed| E[Generate Payment Confirmation]
    
    C --> F[Customer: Package Ready for Pickup]
    D --> G[Rider: New Delivery Assignment]
    E --> H[Customer: Payment Successful]
    
    F --> I[Show Notification in Customer Dashboard]
    G --> J[Show Notification in Rider Dashboard]
    H --> K[Show Payment Confirmation]
    
    I --> L[Customer Can Request OTP]
    J --> M[Rider Can View Package Details]
    K --> N[Customer Can Track Package]
    
    L --> O[OTP Generation Process]
    M --> P[Package Pickup Process]
    N --> Q[Real-time Status Updates]
```

## 🎨 3D Locker Interaction Flow

```mermaid
graph TD
    A[User Views Locker Grid] --> B[Locker 3D CSS Loads]
    B --> C{Locker Status Check}
    
    C --> |Available| D[🟢 Green LED + Available Animation]
    C --> |Occupied| E[🔴 Red LED + Occupied Animation]
    C --> |Reserved| F[🟡 Yellow LED + Reserved Animation]
    
    D --> G[Customer Can Click to Select]
    E --> H[Show Occupied Message]
    F --> I[Show Reserved Message]
    
    G --> J[Locker Selection Modal]
    J --> K[3D Hover Effects]
    K --> L[Digital Display Shows Info]
    L --> M[Keypad Interface Animation]
    M --> N[Booking Confirmation]
    
    H --> O[Customer Waits for Availability]
    I --> P[Customer Waits for Availability]
```
