# Appointment Priority Integration with Inventory System

## Overview

This document describes the enhancement to the Appointment system that integrates with the Inventory module to automatically determine appointment priorities based on students' mental health risk assessments.

## Features Implemented

### 1. Automatic Priority Calculation Based on Inventory Data

The system now automatically calculates appointment priority based on a student's latest mental health prediction from their inventory record.

#### Priority Mapping

The system maps mental health risk levels to appointment priorities as follows:

| Mental Health Risk Level | Appointment Priority |
|-------------------------|---------------------|
| Critical                | Urgent              |
| High                    | High                |
| Moderate                | Normal              |
| Low                     | Low                 |
| No Data Available       | Normal (default)    |

#### Implementation Details

**Backend (API):**
- Location: `capstone-api/app/appointment/appointment.controller.ts`
- Function: `calculatePriorityFromInventory(prisma, studentId)`

The function:
1. Fetches the student's inventory record
2. Retrieves the latest mental health prediction
3. Extracts the risk level from `mentalHealthRisk.level`
4. Maps the risk level to an appointment priority
5. Returns the calculated priority or "normal" as default

**When Priority is Calculated:**
- Automatically when creating a new appointment (if priority is not explicitly provided)
- Only applies if the student has an inventory record with mental health predictions
- Does not override manually specified priorities

**Example Usage:**

```typescript
// Creating an appointment without specifying priority
const appointment = await createAppointment({
  studentId: "student123",
  counselorId: "counselor456",
  requestedDate: "2024-01-15T10:00:00Z",
  // priority is automatically calculated based on inventory
});
```

### 2. Enhanced Search Functionality

#### Student Name Search

The system now supports searching appointments by student names with the following features:

**Backend (API):**
- Location: `capstone-api/app/appointment/appointment.controller.ts`
- Function: `getAll()` with `query` parameter

Search capabilities:
- Search by student's first name
- Search by student's last name
- Case-insensitive matching
- Partial string matching

**Query Parameters:**

```
GET /api/appointment?query=John&page=1&limit=10
```

**Frontend (Service):**
- Location: `capstone-app/src/services/appointment.service.ts`
- Method: `searchAppointmentsByStudentName(appointments, searchQuery)`

Client-side filtering:
- Searches through appointment arrays
- Matches against full student names
- Returns filtered results

### 3. Alphabetical Sorting

#### Backend Implementation

**Sort by Student Name:**
```
GET /api/appointment?sort=studentName&order=asc&page=1&limit=10
```

The API supports the following sort options:
- `sort=studentName` - Sorts by student's first name, then last name
- `sort=priority` - Sorts by priority level (urgent → high → normal → low)
- `sort=createdAt` - Sorts by creation date
- `order=asc` - Ascending order (A-Z for names)
- `order=desc` - Descending order (Z-A for names)

**Implementation:**
- Location: `capstone-api/app/appointment/appointment.controller.ts`
- Function: `getAll()` with enhanced sorting logic

```typescript
if (sort === "studentName") {
  orderByClause = [
    { student: { person: { firstName: order as Prisma.SortOrder } } },
    { student: { person: { lastName: order as Prisma.SortOrder } } },
  ];
}
```

#### Frontend Implementation

**Location:** `capstone-app/src/components/molecules/AppointmentsTable.tsx`

Features:
- Dropdown selector for sort options
- Sort by Student A-Z / Z-A
- Sort by Priority (High to Low / Low to High)
- Sort by Date (Newest/Oldest First)
- Sort by Status (A-Z / Z-A)

**UI Integration:**

```jsx
<select value={`${sortBy}-${sortOrder}`} onChange={handleSortChange}>
  <option value="date-desc">Newest First</option>
  <option value="date-asc">Oldest First</option>
  <option value="priority-desc">High Priority First</option>
  <option value="priority-asc">Low Priority First</option>
  <option value="student-asc">Student A-Z</option>
  <option value="student-desc">Student Z-A</option>
  <option value="status-asc">Status A-Z</option>
  <option value="status-desc">Status Z-A</option>
</select>
```

**Service Methods:**
- `AppointmentService.sortAppointmentsByStudentName(appointments, order)`
- `AppointmentService.sortAppointmentsByPriority(appointments, order)`

### 4. Pending Requests Table Enhancement

The Pending Requests table already includes:
- Search by student name
- Alphabetical sorting (A-Z and Z-A)
- Priority-based sorting
- Real-time filtering

**Location:** `capstone-app/src/components/molecules/PendingRequestsTable.tsx`

## API Endpoints

### Get All Appointments with Enhanced Parameters

```http
GET /api/appointment

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- sort: string ("studentName" | "priority" | "createdAt" | field name)
- order: "asc" | "desc" (default: "desc")
- query: string (search term for student names)
- status: string (filter by appointment status)
- studentId: string (filter by student ID)
- counselorId: string (filter by counselor ID)
- dateFrom: string (ISO date)
- dateTo: string (ISO date)
- type: string (appointment type)

Response:
{
  "appointments": Appointment[],
  "total": number,
  "page": number,
  "totalPages": number
}
```

### Create Appointment with Auto-Priority

```http
POST /api/appointment

Request Body:
{
  "studentId": "string",
  "counselorId": "string",
  "scheduleId": "string (optional)",
  "title": "string",
  "description": "string (optional)",
  "appointmentType": "string",
  "requestedDate": "ISO date string",
  "priority": "string (optional)", // If omitted, calculated from inventory
  "location": "string (optional)",
  "duration": number (optional),
  "attachments": array (optional)
}

Response:
{
  "message": "Appointment request created successfully",
  ...appointmentData
}
```

## Data Flow

### Priority Calculation Flow

```
1. Student creates appointment request
   ↓
2. API receives request without priority
   ↓
3. calculatePriorityFromInventory() called
   ↓
4. Fetch student's inventory record
   ↓
5. Get latest mentalHealthPrediction
   ↓
6. Extract mentalHealthRisk.level
   ↓
7. Map risk level to priority
   ↓
8. Create appointment with calculated priority
   ↓
9. Log priority calculation
   ↓
10. Return appointment with priority
```

### Search and Sort Flow

```
1. User types in search box
   ↓
2. Frontend filters appointments by student name
   ↓
3. User selects sort option
   ↓
4. Frontend sorts filtered results
   OR
   API sorts at database level (for paginated requests)
   ↓
5. Display sorted and filtered results
```

## Performance Considerations

### Database Optimization

1. **Indexed Fields:**
   - Student's firstName and lastName should be indexed in Person collection
   - Appointment priority field should be indexed
   - Inventory studentId should be indexed

2. **Query Optimization:**
   - Uses single database query with includes for related data
   - Pagination limits result set size
   - Field selection reduces data transfer

3. **Caching Recommendations:**
   - Cache student inventory mental health predictions (TTL: 24 hours)
   - Cache frequently accessed appointment lists (TTL: 5 minutes)

### Frontend Optimization

1. **Client-Side Filtering:**
   - Used for smaller datasets (< 100 items)
   - Immediate feedback without API calls

2. **Server-Side Sorting:**
   - Recommended for large datasets
   - Uses query parameters for database-level sorting

## Usage Examples

### Example 1: Create Appointment with Auto-Priority

```typescript
import { AppointmentService } from '@/services';

// Student with high mental health risk
const appointment = await AppointmentService.createAppointment({
  studentId: 'student-123',
  counselorId: 'counselor-456',
  title: 'Counseling Session',
  appointmentType: 'individual_counseling',
  requestedDate: '2024-02-01T14:00:00Z',
  // Priority will be automatically set to "high" if student has high risk
});
```

### Example 2: Search Appointments by Student Name

```typescript
import { AppointmentService } from '@/services';

// Get all appointments and search
const response = await AppointmentService.getAllAppointments({
  query: 'John Doe',
  page: 1,
  limit: 20
});

// Or filter client-side
const filtered = AppointmentService.searchAppointmentsByStudentName(
  appointments,
  'John'
);
```

### Example 3: Sort Appointments Alphabetically

```typescript
import { AppointmentService } from '@/services';

// Server-side sort
const response = await AppointmentService.getAllAppointments({
  sort: 'studentName',
  order: 'asc',
  page: 1,
  limit: 50
});

// Client-side sort
const sorted = AppointmentService.sortAppointmentsByStudentName(
  appointments,
  'asc'
);
```

### Example 4: Sort by Priority

```typescript
import { AppointmentService } from '@/services';

// Get urgent appointments first
const response = await AppointmentService.getAllAppointments({
  sort: 'priority',
  order: 'desc'
});

// Client-side priority sort
const sorted = AppointmentService.sortAppointmentsByPriority(
  appointments,
  'desc'
);
```

## Testing Recommendations

### Unit Tests

1. **calculatePriorityFromInventory:**
   - Test with different risk levels (critical, high, moderate, low)
   - Test with missing inventory
   - Test with missing predictions
   - Test error handling

2. **Search Functionality:**
   - Test partial name matching
   - Test case-insensitivity
   - Test empty search
   - Test special characters

3. **Sort Functionality:**
   - Test ascending/descending order
   - Test with null values
   - Test with identical names

### Integration Tests

1. **End-to-End Priority Flow:**
   - Create student with inventory
   - Generate mental health prediction
   - Create appointment
   - Verify priority is set correctly

2. **Search and Sort:**
   - Create multiple appointments
   - Search by various student names
   - Sort by different fields
   - Verify results are correct

## Security Considerations

1. **Access Control:**
   - Only authorized users can create appointments
   - Students can only view their own appointments
   - Guidance counselors can view all appointments

2. **Data Privacy:**
   - Mental health data is protected
   - Priority calculation doesn't expose sensitive details
   - Audit logging for priority calculations

3. **Input Validation:**
   - Validate sort parameters
   - Sanitize search queries
   - Validate date ranges

## Future Enhancements

1. **Smart Scheduling:**
   - Automatically schedule high-priority appointments sooner
   - Suggest optimal time slots based on urgency

2. **Notifications:**
   - Alert counselors of urgent appointments
   - Remind students of high-priority sessions

3. **Analytics:**
   - Track correlation between risk levels and appointment outcomes
   - Generate reports on priority distributions

4. **Machine Learning:**
   - Predict optimal appointment frequency based on risk level
   - Suggest proactive scheduling for at-risk students

## Changelog

### Version 1.0.0 - Initial Implementation
- Added automatic priority calculation based on inventory
- Implemented student name search functionality
- Added alphabetical sorting for student names
- Enhanced AppointmentsTable with sort dropdown
- Updated PendingRequestsTable with consistent sorting

## Support and Maintenance

For questions or issues related to this feature:
- Review this documentation
- Check the codebase comments
- Consult the API logs for priority calculations
- Contact the development team

---

**Last Updated:** January 2024  
**Maintained By:** Development Team  
**Version:** 1.0.0