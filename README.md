# Student Mental Health Assessment Platform

A comprehensive web application for mental health screening, counseling appointment management, and wellness resources for university students.

## 🧠 Overview

This platform serves as a digital mental health support system for students and guidance counselors, providing scientific-based assessments, appointment scheduling, real-time messaging, and therapeutic activities.

## ✨ Core Features

### 🔍 Mental Health Assessments

- **Anxiety Assessment (GAD-7)**: 7-question questionnaire with severity categorization
- **Depression Assessment (PHQ-9)**: 9-question screening tool with risk evaluation
- **Stress Assessment (PSS)**: Perceived Stress Scale for monthly stress evaluation
- **Suicide Risk Assessment (CSSRS)**: Columbia Suicide Severity Rating Scale
- **Smart Cooldown System**: Prevents assessment fatigue with severity-based restrictions
- **Real-time Scoring**: Immediate results with severity levels and recommendations

### 📊 Analytics & Insights

- **Dashboard Overview**: Statistics on assessment participation and trends
- **Interactive Charts**: Program-based distribution and severity breakdowns
- **Drill-down Analytics**: Detailed insights by academic program, year, and demographics
- **Predictive Analytics**: ML-powered academic performance and mental health risk predictions
- **Historical Tracking**: Timeline view of student assessment history

### 📅 Appointment Management

- **Schedule System**: Counselors create available time slots
- **Booking Interface**: Students book from available schedules
- **Request System**: Students can request specific appointments
- **Calendar Views**: Both list and calendar visualization
- **Status Tracking**: Pending, confirmed, cancelled, completed states
- **Real-time Updates**: Live status changes and notifications

### 💬 Real-time Messaging

- **Secure Communication**: Encrypted messaging between students and counselors
- **Real-time Delivery**: Socket.io powered instant messaging
- **Thread Management**: Organized conversation history
- **Mobile Responsive**: Touch-friendly interface for mobile users
- **Read Receipts**: Message status tracking

### 🎯 Wellness Activities

- **Guided Activities**: Professional therapeutic exercises
- **Category System**: Breathing, mindfulness, physical, audio, video content
- **Interactive Timer**: Built-in timer for timed activities
- **Step-by-Step Instructions**: Guided practice sessions
- **YouTube Integration**: Embedded therapeutic videos
- **Progress Tracking**: Activity completion monitoring

### 👥 Student Management (Guidance Users)

- **Comprehensive Profiles**: Student records with assessment history
- **Search & Filter**: Advanced student lookup capabilities
- **Assessment Overview**: Latest mental health status per student
- **Contact Management**: Student contact information and details
- **Academic Integration**: Program and year tracking

## 🏗️ Technical Architecture

### Frontend Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.io Client** for real-time features
- **Recharts** for data visualization
- **Lucide React** for icons

### Component Architecture (Atomic Design)

```
src/components/
├── atoms/          # Logo, FormField, StatCard, Toast
├── molecules/      # Assessment tables, questionnaires, modals
├── organisms/      # Page content sections, layout components
└── ui/            # shadcn/ui base components
```

### State Management

- **Custom Hooks**: Modular state logic for each feature
- **Context Providers**: Authentication and socket management
- **Local State**: Component-specific state management

### API Integration

- **HTTP Client**: Axios-based service layer
- **Service Pattern**: Dedicated services for each domain
- **Error Handling**: Comprehensive error management
- **Type Safety**: Full TypeScript integration

## 📱 User Roles & Permissions

### Students

- Take mental health assessments
- View assessment history and results
- Book counseling appointments
- Message with counselors
- Access wellness activities and resources
- Track personal mental health journey

### Guidance Counselors

- View all student assessments and analytics
- Manage appointment schedules
- Communicate with students
- Access detailed insights and reports
- Monitor student mental health trends
- Manage student records

## 🔐 Security Features

### Authentication & Authorization

- **JWT-based Authentication**: Secure token management
- **Role-based Access**: Student vs. Guidance permissions
- **Protected Routes**: Route-level security
- **Session Management**: Automatic token refresh

### Data Protection

- **Input Validation**: Client and server-side validation
- **Secure Communication**: HTTPS enforced
- **Privacy Controls**: FERPA-compliant data handling
- **Consent Management**: Digital consent tracking

## 📊 Assessment Details

### GAD-7 Anxiety Assessment

- 7 core questions measuring anxiety symptoms
- Severity levels: Minimal (0-4), Mild (5-9), Moderate (10-14), Severe (15-21)
- Cooldown periods based on severity (2-30 days)

### PHQ-9 Depression Assessment

- 9 questions measuring depression symptoms
- Severity levels: Minimal, Mild, Moderate, Moderately Severe, Severe
- Includes difficulty/impairment question

### Perceived Stress Scale

- Measures perceived stress over past month
- Risk levels: Low, Moderate, High
- Academic and life stress indicators

### Columbia Suicide Severity Rating Scale

- Comprehensive suicide risk assessment
- Risk levels: Low, Moderate, High
- No cooldown restrictions for immediate access

## 🎨 Design System

### Color Palette

- **Primary**: Blue (#3b82f6) for primary actions
- **Assessment Colors**:
  - Anxiety: Yellow/Amber (#f59e0b)
  - Depression: Purple (#8b5cf6)
  - Stress: Red (#ef4444)
  - Suicide: Neutral with high contrast

### Typography

- **System Fonts**: Optimized for readability
- **Responsive Text**: Mobile-first typography scales
- **Accessibility**: WCAG compliant contrast ratios

### Responsive Design

- **Mobile-first**: Touch-friendly interfaces
- **Breakpoints**: sm, md, lg, xl responsive design
- **Progressive Enhancement**: Core functionality on all devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API server

### Installation

```bash
# Clone the repository
git clone https://github.com/git-dariel/capstone-app.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Configure API endpoints and keys
VITE_API_BASE_URL=your_backend_url
VITE_SOCKET_URL=your_socket_url
```

## 📈 Future Enhancements

- **Mobile App**: React Native companion app
- **AI Chatbot**: 24/7 mental health support
- **Crisis Detection**: Real-time risk assessment alerts
- **Integration**: Canvas/LMS integration for academic correlation
- **Advanced Analytics**: Predictive modeling and trend analysis
- **Telehealth**: Video consultation capabilities

## 🤝 Contributing

This is a capstone project for academic purposes. For suggestions or improvements, please follow standard Git workflow practices.

## 📄 License

Academic use only. All rights reserved.
