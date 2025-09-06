# Student Management Implementation

This document outlines the implementation of the student management system following the established code patterns and architecture in the capstone project.

## Architecture Overview

The implementation follows the Atomic Design pattern with proper separation of concerns:

### 🔧 **Hook Layer** (`/hooks`)

- **`useStudents.ts`** - Custom hook for student state management
  - Follows the same pattern as `useStress`, `useAnxiety`, etc.
  - Provides CRUD operations for students
  - Manages loading states, errors, and pagination
  - Returns: `students`, `loading`, `error`, `fetchStudents`, `createStudent`, `updateStudent`, `deleteStudent`, etc.

### 🧩 **Molecule Layer** (`/molecules`)

#### **`StudentsTable.tsx`**

- **Purpose**: Display students in a searchable, paginated table
- **Features**:
  - Search functionality (name, student number, program, year, email)
  - Infinite scroll for large datasets
  - Edit and Delete action buttons
  - Responsive design
  - Loading and error states
- **Props**: `onEdit`, `onDelete`, `onCreate` callbacks
- **Pattern**: Follows `StressAssessmentTable` structure

#### **`StudentModal.tsx`**

- **Purpose**: Create/Edit student form modal
- **Features**:
  - Form validation for required fields
  - Responsive form layout
  - Create and Edit modes
  - Delete confirmation
  - Error handling
  - Program and year dropdowns
- **Props**: `isOpen`, `onClose`, `onSubmit`, `onUpdate`, `onDelete`, `student`, `loading`, `error`
- **Pattern**: Follows `AnnouncementModal` structure

### 🏗️ **Organism Layer** (`/organisms`)

#### **`StudentsContent.tsx`**

- **Purpose**: Main container for student management features
- **Features**:
  - Integrates `StudentsTable` and `StudentModal`
  - Handles all CRUD operations
  - Manages modal state and data flow
  - Error handling and user feedback
- **Pattern**: Follows other content organisms like `AccountsContent`

### 📄 **Page Layer** (`/pages`)

#### **`StudentsPage.tsx`**

- **Purpose**: Main students page component
- **Implementation**: Uses `MainLayout` + `StudentsContent`
- **Route**: `/students` (guidance-only route)

## API Integration

### Service Layer Updates

- **`StudentService.getAllStudents()`** - Updated to return paginated response format
- **Response Format**: `{ data: Student[], total: number, page: number, totalPages: number }`
- **Matches Pattern**: Same as `StressService.getAllAssessments()`

### Student Data Structure

```typescript
interface Student {
  id: string;
  studentNumber: string;
  program: string;
  year: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    email?: string;
    contactNumber?: string;
    gender?: string;
    // ... other person fields
  };
}
```

## Key Features Implemented

### ✅ **CRUD Operations**

- **Create**: Add new students with comprehensive form
- **Read**: Display students in searchable, paginated table
- **Update**: Edit existing student information
- **Delete**: Soft delete with confirmation modal

### ✅ **User Experience**

- **Search & Filter**: Real-time search across multiple fields
- **Responsive Design**: Mobile-friendly layouts
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Confirmation Dialogs**: Prevent accidental deletions

### ✅ **Data Validation**

- **Required Fields**: Student number, program, year, first name, last name, email
- **Format Validation**: Email format, numeric fields
- **Duplicate Prevention**: Handled by backend API

## Code Patterns Followed

1. **Hook Pattern**: Same structure as `useStress`, `useAnxiety`
2. **Table Pattern**: Same structure as `StressAssessmentTable`
3. **Modal Pattern**: Same structure as `AnnouncementModal`
4. **Content Pattern**: Same structure as other content organisms
5. **Service Pattern**: Paginated response format like assessment services
6. **Error Handling**: Consistent error states and user feedback
7. **TypeScript**: Strong typing throughout the component tree

## Integration Points

### Navigation

- Added to sidebar navigation (guidance-only)
- Route: `/students`

### Permissions

- **Guidance Users**: Full CRUD access
- **Students**: No access (follows existing permission patterns)

### Styling

- **Consistent**: Uses existing Tailwind classes and component styles
- **Icons**: Lucide React icons matching the design system
- **Colors**: Primary color scheme and semantic colors

## Files Created/Modified

### New Files

- `src/hooks/useStudents.ts`
- `src/components/molecules/StudentsTable.tsx`
- `src/components/molecules/StudentModal.tsx`
- `src/components/organisms/StudentsContent.tsx`

### Modified Files

- `src/services/student.service.ts` (Updated `getAllStudents` to return paginated response)
- `src/hooks/index.ts` (Added useStudents export)
- `src/components/molecules/index.ts` (Added new molecule exports)
- `src/components/organisms/index.ts` (Added StudentsContent export)
- `src/pages/StudentsPage.tsx` (Implemented using StudentsContent)

## Usage Example

```tsx
// The StudentsPage is now fully functional
// Navigate to /students to see:
// 1. Table of all students with search functionality
// 2. Add Student button to create new students
// 3. Edit buttons for updating student information
// 4. Delete buttons with confirmation dialogs
// 5. Responsive design for mobile and desktop
```

This implementation provides a complete, production-ready student management system that seamlessly integrates with the existing codebase architecture and design patterns.
