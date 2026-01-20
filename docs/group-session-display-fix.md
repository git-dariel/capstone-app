# Group Session Multiple Students Display Fix

## Issue Description

When creating a group session appointment with multiple students, only one student name was being displayed in:
- The appointments table (both mobile and desktop views)
- The appointment view modal when clicking on an appointment row

## Root Cause

The backend API was fetching User records for the `studentIds` array, but was not fetching the corresponding Student records. This caused the following issues:

1. **Missing Student Data**: The User table doesn't contain student-specific fields like `studentNumber`, `program`, `year`, etc.
2. **Incomplete Data Structure**: The frontend expects Student records that include both the User relationship (for `person` data) and student-specific fields.

### Data Model Relationships

```
User (id, personId, type, etc.)
  └─> Person (firstName, lastName, email, contactNumber)

Student (id, personId, studentNumber, program, year, etc.)
  └─> Person (firstName, lastName, email, contactNumber)

Appointment (studentId, studentIds[], ...)
  ├─> student (User) - primary student (backward compatibility)
  └─> studentIds[] - array of User IDs for group sessions
```

## Solution

### Backend Changes (`capstone-api/app/appointment/appointment.controller.ts`)

Modified **FOUR** functions to properly fetch Student records:

#### 1. `getById` Function (Lines 168-220)

**Before:**
- Only fetched User records using `studentIds`
- Returned User objects that lacked `studentNumber` and other student fields

**After:**
```typescript
// First get the User records to get personIds
const users = await prisma.user.findMany({
  where: { id: { in: appointment.studentIds }, isDeleted: false },
  include: { person: true },
});

// Then get Student records using personIds
const personIds = users.map((user) => user.personId);
const students = await prisma.student.findMany({
  where: { personId: { in: personIds }, isDeleted: false },
  include: { person: true },
});

// Merge user and student data
allStudents = users.map((user) => {
  const studentRecord = students.find((s) => s.personId === user.personId);
  return studentRecord || user;
});
```

#### 2. `getAll` Function (Lines 393-485)

**Before:**
- Only fetched User records for each appointment's `studentIds`
- Returned incomplete student information

**After:**
- Applied the same two-step fetch process:
  1. Get User records to obtain `personIds`
  2. Get Student records using those `personIds`
  3. Merge the data, prioritizing Student records

#### 3. `getByStudentId` Function (Lines 1225-1310)

**Before:**
- Only fetched basic appointment data without students array for group sessions

**After:**
- Applied the same two-step fetch and merge process
- Returns complete student information for all appointments

#### 4. `getByCounselorId` Function (Lines 1283-1368)

**Before:**
- Only fetched basic appointment data without students array for group sessions
- **THIS WAS THE MAIN ISSUE** - the frontend uses this endpoint to fetch counselor appointments

**After:**
- Applied the same two-step fetch and merge process
- Returns complete student information for all appointments
- **This fix resolved the display issue in the appointments table**

### How It Works

1. **User Lookup**: First, we query the User table with the `studentIds` array to get User records and their associated `personId` values.

2. **Student Lookup**: Using the collected `personIds`, we query the Student table to get full student records (which include `studentNumber`, `program`, `year`, etc.).

3. **Data Merging**: We map through the users and find the matching Student record by comparing `personId`. If a Student record exists, we use it; otherwise, we fall back to the User record.

4. **Frontend Display**: The frontend receives complete Student objects with all necessary fields:
   - `person.firstName` and `person.lastName` (from Person relation)
   - `studentNumber` (from Student table)
   - `person.email` and `person.contactNumber` (from Person relation)
   - Other student-specific fields

## Frontend Components (Already Compatible)

The following components were already designed to handle multiple students correctly:

### 1. `AppointmentsTable.tsx`
- **Mobile View** (Lines 289-298): Displays student count for group sessions or individual name
- **Desktop View** (Lines 502-541): Shows "X students" or individual student name with student number

### 2. `AppointmentViewModal.tsx`
- **Group Session** (Lines 252-284): Maps through `students` array and displays each student's:
  - Full name
  - Student ID
  - Email
  - Contact number
- **Single Student** (Lines 286-312): Displays individual student information

## Testing Checklist

- [ ] Create a group session with multiple students
- [ ] Verify all student names appear in the appointment table
- [ ] Click on the group appointment row
- [ ] Verify all students are listed in the modal with complete information
- [ ] Verify student numbers are displayed for each student
- [ ] Test with single-student appointments (backward compatibility)
- [ ] Verify existing single-student appointments still display correctly

## Troubleshooting

### Issue: Only One Student Name Shows in Group Appointment

If you're seeing only one student name in a group appointment table/modal, check the following:

#### 1. **Did you check the "Group Session" checkbox?**
   - When creating a group appointment, you MUST check the "Group Session (Multiple Students)" checkbox
   - This checkbox sets `appointmentType` to `"group_counseling"`
   - Without this, `studentIds` won't be sent to the backend

#### 2. **Verify Multiple Students Were Added**
   - Before submitting, check the "Selected Students" section
   - You should see all students listed with "Remove" buttons
   - If you only see one student, add more students before submitting

#### 3. **Check Browser Console Logs**
   - Open browser DevTools (F12) → Console tab
   - Look for: `=== SUBMITTING APPOINTMENT ===`
   - Verify `studentIds` array contains multiple IDs:
     ```javascript
     studentIds: ["userId1", "userId2", "userId3"]
     ```
   - If `studentIds` is empty or has only 1 ID, the issue is in the frontend

#### 4. **Check Backend Logs**
   - Look in your API server console for:
     ```
     Creating appointment with studentIds: ["id1","id2"]
     Appointment created with ID: xxx, studentIds saved: ["id1","id2"]
     ```
   - If only 1 ID is logged, the frontend didn't send all IDs

#### 5. **Verify Database Record**
   - For existing appointments, check if `studentIds` field is populated:
     - In MongoDB Compass or similar tool
     - Find the appointment document
     - Check the `studentIds` array field
     - If it only has 1 ID, the appointment was created incorrectly

#### 6. **Old Appointments Created Before Fix**
   - Appointments created BEFORE this fix won't have multiple students
   - You need to delete and recreate them
   - Or manually update the database to add `studentIds` array

#### 7. **Appointment Type Mismatch**
   - The appointment must have `appointmentType: "group_counseling"`
   - Check in the database or in the edit form
   - If it's a different type, the `studentIds` won't be included in submission

### Common Mistakes

1. **Forgetting to check "Group Session" checkbox**
   - Solution: Always check this checkbox when adding multiple students

2. **Not removing the previous student when switching to group mode**
   - Solution: Clear the student selection before switching modes

3. **Adding students but not seeing them in "Selected Students" list**
   - This indicates the students aren't being added to `formData.studentIds`
   - Check that you're clicking students from the dropdown
   - Verify the students appear in the selected list before submitting

### Debug Commands

To check an appointment in the database:
```javascript
// In MongoDB shell or Compass
db.appointments.findOne({ _id: ObjectId("your-appointment-id") })

// Check the studentIds field - should be an array with multiple IDs
// Example result:
{
  studentIds: ["user-id-1", "user-id-2", "user-id-3"],
  maxStudents: 10,
  appointmentType: "group_counseling"
}
```

To check backend logs:
```bash
# In your API terminal, look for:
grep "studentIds" logs/app.log  # or wherever your logs are
```

## Files Modified

1. **Backend**
   - `capstone-api/app/appointment/appointment.controller.ts`
     - Modified `getById()` function (line 168)
     - Modified `getAll()` function (line 393)
     - Modified `getByStudentId()` function (line 1225)
     - Modified `getByCounselorId()` function (line 1283) **← Main fix**

2. **Frontend** (No changes required - already compatible)
   - `capstone-app/src/components/molecules/AppointmentsTable.tsx`
   - `capstone-app/src/components/molecules/AppointmentViewModal.tsx`

## Deployment Steps

1. **Backend**
   ```bash
   cd capstone-api
   npm install  # if needed
   npm run build  # if using TypeScript compilation
   # Restart the server
   ```

2. **Frontend**
   ```bash
   cd capstone-app
   # No changes needed, but rebuild if necessary
   npm run build
   ```

3. **Database**
   - No schema changes required
   - No migration needed

## Backward Compatibility

✅ The fix maintains full backward compatibility:
- Single-student appointments continue to work (using the `student` relation)
- The `studentId` field is still populated as the primary student
- The `studentIds` array is used for group sessions
- Frontend gracefully handles both single and multiple student scenarios

## Related Documentation

- Original feature implementation: [Group Session Multiple Students Support](../threads/group-session-multiple-students-support.md)
- Appointment API documentation: (link when available)
- Frontend component guide: (link when available)

---

**Date:** January 22, 2025  
**Issue:** Only one student displayed in group sessions  
**Root Cause:** `getByCounselorId` endpoint was not populating the `students` array  
**Status:** ✅ Resolved  
**Version:** 1.1.0  

## Critical Finding

The main issue was that **`getByCounselorId`** was not fetching the students array. The frontend (guidance/admin side) uses this endpoint, NOT `getAll`, to fetch counselor appointments. This is why the table showed only one student even though the database had multiple student IDs.

All four appointment retrieval endpoints now properly populate the `students` array for group sessions.