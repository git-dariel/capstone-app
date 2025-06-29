# Service Layer Documentation

This directory contains all API service implementations for the capstone app. The services are organized to match the backend API structure and provide type-safe interfaces for all API operations.

## Architecture

The service layer follows these principles:

- **Centralized HTTP Client**: All services use a common `HttpClient` for consistent request handling
- **Type Safety**: Full TypeScript support with interfaces for all requests and responses
- **Token Management**: Automatic JWT token handling for authentication
- **Error Handling**: Consistent error handling across all services
- **Request/Response Patterns**: Following the same patterns as the backend API

## File Structure

```
services/
├── api.config.ts          # Base configuration and HTTP client
├── auth.service.ts        # Authentication (login, register, logout)
├── user.service.ts        # User management
├── student.service.ts     # Student management
├── person.service.ts      # Person management
├── anxiety.service.ts     # Anxiety assessments
├── depression.service.ts  # Depression assessments
├── stress.service.ts      # Stress assessments
├── announcement.service.ts # Announcement management
├── logging.service.ts     # Application logging
├── index.ts              # Main exports
└── README.md             # This documentation
```

## Quick Start

### Basic Usage

```typescript
import { AuthService, StudentService, AnxietyService } from "@/services";

// Login
try {
  const response = await AuthService.login({
    email: "user@example.com",
    password: "password",
    type: "student",
  });
  console.log("Login successful:", response.user);
} catch (error) {
  console.error("Login failed:", error);
}

// Get all students
try {
  const students = await StudentService.getAllStudents({
    page: 1,
    limit: 10,
    sort: "createdAt",
    order: "desc",
  });
  console.log("Students:", students.data);
} catch (error) {
  console.error("Failed to fetch students:", error);
}

// Create anxiety assessment
try {
  const assessment = await AnxietyService.createAssessment({
    studentId: "student-id-here",
    responses: {
      "0": 2, // Question 1 answer
      "1": 1, // Question 2 answer
      // ... more responses
    },
  });
  console.log("Assessment created:", assessment);
} catch (error) {
  console.error("Failed to create assessment:", error);
}
```

### Configuration

The API base URL is configured in `api.config.ts`:

```typescript
export const API_CONFIG = {
  baseURL: "http://localhost:3000/api", // Change for production
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};
```

For production, you should set the `baseURL` to your production API endpoint.

## Service Details

### Authentication Service (`AuthService`)

Handles user authentication and session management.

**Methods:**

- `login(credentials)` - Authenticate user
- `register(userData)` - Register new user
- `logout()` - Clear authentication data
- `getCurrentUser()` - Get current user from storage
- `isAuthenticated()` - Check if user is authenticated

**Example:**

```typescript
import { AuthService } from "@/services";

// Login
const response = await AuthService.login({
  email: "user@example.com",
  password: "password123",
  type: "student",
});

// Check if authenticated
if (AuthService.isAuthenticated()) {
  const currentUser = AuthService.getCurrentUser();
  console.log("Current user:", currentUser);
}

// Logout
await AuthService.logout();
```

### Assessment Services

#### Anxiety Service (`AnxietyService`)

**Scoring**: GAD-7 scale (0-21 points)

- Minimal: 0-4
- Mild: 5-9
- Moderate: 10-14
- Severe: 15-21

#### Depression Service (`DepressionService`)

**Scoring**: PHQ-9 scale (0-27 points)

- Minimal: 0-4
- Mild: 5-9
- Moderate: 10-14
- Moderately Severe: 15-19
- Severe: 20-27

#### Stress Service (`StressService`)

**Scoring**: Perceived Stress Scale (0-40 points with reverse scoring)

- Low: 0-13
- Moderate: 14-26
- High: 27-40

**Example:**

```typescript
import { AnxietyService, DepressionService, StressService } from "@/services";

// Create anxiety assessment
const anxietyAssessment = await AnxietyService.createAssessment({
  studentId: "student-id",
  responses: {
    "0": 2, // "Feeling nervous, anxious, or on edge" - More than half the days
    "1": 1, // "Not being able to stop or control worrying" - Several days
    // ... continue for all 7 questions
  },
});

// Calculate score locally (optional)
const { totalScore, severityLevel } = AnxietyService.calculateAnxietyScore({
  0: 2,
  1: 1,
  2: 3,
  3: 2,
  4: 1,
  5: 2,
  6: 1,
});
console.log(`Score: ${totalScore}, Severity: ${severityLevel}`);
```

### CRUD Services

All CRUD services (`UserService`, `StudentService`, `PersonService`, etc.) follow the same pattern:

**Methods:**

- `getAll(params?)` - Get paginated list
- `getById(id, params?)` - Get single item
- `create(data)` - Create new item
- `update(id, data)` - Update existing item
- `delete(id)` - Delete item

**Query Parameters:**

```typescript
interface QueryParams {
  page?: number; // Page number for pagination
  limit?: number; // Items per page
  select?: string; // Fields to select
  sort?: string; // Sort field
  populate?: string; // Relations to populate
  fields?: string; // Comma-separated fields
  query?: string; // Search query
  order?: "asc" | "desc"; // Sort order
}
```

## Error Handling

All services throw errors that can be caught with try-catch blocks:

```typescript
try {
  const result = await SomeService.someMethod();
  // Handle success
} catch (error) {
  console.error("API Error:", error.message);
  // Handle error - show user message, retry, etc.
}
```

## Token Management

The `TokenManager` class handles JWT tokens automatically:

```typescript
import { TokenManager } from "@/services";

// Get current token
const token = TokenManager.getToken();

// Set token (usually done automatically during login)
TokenManager.setToken("your-jwt-token");

// Remove token (usually done during logout)
TokenManager.removeToken();

// Get user data
const user = TokenManager.getUser();

// Set user data
TokenManager.setUser(userObject);
```

## Integration Examples

### Using in React Components

```typescript
import React, { useEffect, useState } from "react";
import { StudentService, type StudentProfile } from "@/services";

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await StudentService.getAllStudents({
          page: 1,
          limit: 20,
          sort: "createdAt",
          order: "desc",
        });
        setStudents(response.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {students.map((student) => (
        <div key={student.id}>
          {student.person.firstName} {student.person.lastName}
        </div>
      ))}
    </div>
  );
};
```

### Assessment Form Integration

```typescript
import React, { useState } from "react";
import { AnxietyService } from "@/services";

const AnxietyAssessmentForm: React.FC = () => {
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const assessment = await AnxietyService.createAssessment({
        studentId: "current-student-id", // Get from auth context
        responses,
      });

      // Show success message with results
      alert(
        `Assessment completed! Score: ${assessment.totalScore}, Severity: ${assessment.severityLevel}`
      );
    } catch (error) {
      console.error("Assessment submission failed:", error);
      alert("Failed to submit assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ... rest of component
};
```

## Environment Configuration

For different environments, update the `API_CONFIG.baseURL`:

```typescript
// Development
baseURL: "http://localhost:3000/api";

// Staging
baseURL: "https://api-staging.yourapp.com/api";

// Production
baseURL: "https://api.yourapp.com/api";
```

Consider using environment variables:

```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  // ... other config
};
```

## Best Practices

1. **Always handle errors**: Wrap API calls in try-catch blocks
2. **Use TypeScript**: Import types for better development experience
3. **Validate data**: Check responses before using them
4. **Loading states**: Show loading indicators during API calls
5. **Authentication**: Check authentication status before making authenticated requests
6. **Caching**: Consider implementing caching for frequently accessed data
7. **Retry logic**: Implement retry mechanisms for failed requests when appropriate

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure your API server allows requests from your frontend domain
2. **Authentication errors**: Check if token is valid and not expired
3. **Network errors**: Verify API server is running and accessible
4. **Type errors**: Ensure you're using the correct interfaces for requests

### Debug Mode

Enable debugging by checking network requests in browser DevTools. All API calls will be logged with their full request/response details.
