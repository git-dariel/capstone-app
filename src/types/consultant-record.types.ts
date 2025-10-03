import type { Student } from "@/services/student.service";

export interface ConsultantRecord {
  id: string;
  studentId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  student?: Student;
}
