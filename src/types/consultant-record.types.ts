import type { Student } from "@/services/student.service";

export interface ConsultantRecord {
  id: string;
  studentId: string;
  title: string;
  content: string;
  consultationDate: string; // Date of the actual consultation
  createdAt: string;
  updatedAt: string;
  student?: Student;
}
