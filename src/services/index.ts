// API Configuration
export { HttpClient, TokenManager, API_CONFIG } from "./api.config";
export type { ApiResponse, PaginatedResponse, QueryParams } from "./api.config";

// Authentication Service
export { AuthService } from "./auth.service";
export type { LoginRequest, RegisterRequest, User, Student, AuthResponse } from "./auth.service";

// User Service
export { UserService } from "./user.service";
export type { User as UserProfile, UpdateUserRequest } from "./user.service";

// Student Service
export { StudentService } from "./student.service";
export type {
  Student as StudentProfile,
  CreateStudentRequest,
  UpdateStudentRequest,
} from "./student.service";

// Consent Service
export { ConsentService } from "./consent.service";
export type {
  ConsentFormData,
  ConsentResponse,
  GetConsentResponse,
  MentalHealthPrediction,
} from "./consent.service";

// Person Service
export { PersonService } from "./person.service";
export type { Person, CreatePersonRequest, UpdatePersonRequest } from "./person.service";

// Assessment Services
export { AnxietyService } from "./anxiety.service";
export type {
  AnxietyAssessment,
  CreateAnxietyAssessmentRequest,
  UpdateAnxietyAssessmentRequest,
} from "./anxiety.service";

export { DepressionService } from "./depression.service";
export type {
  DepressionAssessment,
  CreateDepressionAssessmentRequest,
  UpdateDepressionAssessmentRequest,
} from "./depression.service";

export { StressService } from "./stress.service";
export type {
  StressAssessment,
  CreateStressAssessmentRequest,
  UpdateStressAssessmentRequest,
} from "./stress.service";

export { SuicideService } from "./suicide.service";
export type {
  SuicideAssessment,
  CreateSuicideAssessmentRequest,
  UpdateSuicideAssessmentRequest,
} from "./suicide.service";

// Announcement Service
export { AnnouncementService } from "./announcement.service";
export type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementPaginatedResponse,
} from "./announcement.service";

// Logging Service
export { LoggingService } from "./logging.service";
export type { LogEntry, CreateLogRequest } from "./logging.service";

// Metrics Service
export { MetricsService } from "./metrics.service";
export type {
  MetricFilter,
  MetricRequest,
  MetricResponse,
  ProgramMetric,
  YearMetric,
  GenderMetric,
} from "./metrics.service";
