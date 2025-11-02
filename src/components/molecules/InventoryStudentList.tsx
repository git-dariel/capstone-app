import React, { useState, useMemo } from "react";
import type { StudentDetails } from "@/types/inventory-insights";
import { StudentDetailsModal } from "./StudentDetailsModal";
import { useStudents } from "@/hooks";
import { Search } from "lucide-react";
import type { Student } from "@/services/student.service";

interface InventoryStudentListProps {
  students: StudentDetails[];
  loading?: boolean;
  title?: string;
}

export const InventoryStudentList: React.FC<InventoryStudentListProps> = ({
  students,
  loading = false,
  title = "Student List",
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { fetchStudentById } = useStudents();

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;

    const searchLower = searchTerm.toLowerCase();
    return students.filter((student) => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const studentNumber = student.studentNumber?.toLowerCase() || "";
      const program = student.program?.toLowerCase() || "";
      const year = student.year?.toLowerCase() || "";
      const email = student.email?.toLowerCase() || "";
      const gender = student.gender?.toLowerCase() || "";
      const mentalHealth = student.mentalHealthPrediction?.toLowerCase() || "";
      const bmiCategory = student.bmiCategory?.toLowerCase() || "";

      return (
        fullName.includes(searchLower) ||
        studentNumber.includes(searchLower) ||
        program.includes(searchLower) ||
        year.includes(searchLower) ||
        email.includes(searchLower) ||
        gender.includes(searchLower) ||
        mentalHealth.includes(searchLower) ||
        bmiCategory.includes(searchLower)
      );
    });
  }, [students, searchTerm]);

  const handleStudentRowClick = async (studentDetails: (typeof students)[0]) => {
    try {
      // Try to get student ID - prefer studentId field, fallback to searching by studentNumber
      let studentId = studentDetails.studentId;

      if (!studentId && studentDetails.studentNumber) {
        // If we don't have studentId, we'll need to search for the student
        // For now, we'll attempt to fetch all students and find by number
        // This is a workaround - ideally the backend should return studentId
        console.warn("StudentId not available, attempting lookup by studentNumber");
        // Try to fetch the student using a query
        try {
          const allStudents = await fetchStudentById(studentDetails.studentNumber, {
            fields:
              "id,studentNumber,program,year,status,notes,createdAt,updatedAt,person.id,person.firstName,person.lastName,person.middleName,person.email,person.contactNumber,person.gender,person.birthDate,person.age,person.religion,person.civilStatus,person.users.id,person.users.avatar,person.users.anxietyAssessments,person.users.depressionAssessments,person.users.stressAssessments,person.users.suicideAssessments",
          });
          setSelectedStudent(allStudents as Student);
          setIsModalOpen(true);
          return;
        } catch (searchError) {
          console.error("Could not find student by studentNumber:", searchError);
        }
      }

      if (!studentId) {
        console.error("No valid student ID found");
        return;
      }

      // Fetch full student details using the student ID
      const student = await fetchStudentById(studentId, {
        fields:
          "id,studentNumber,program,year,status,notes,createdAt,updatedAt,person.id,person.firstName,person.lastName,person.middleName,person.email,person.contactNumber,person.gender,person.birthDate,person.age,person.religion,person.civilStatus,person.users.id,person.users.avatar,person.users.anxietyAssessments,person.users.depressionAssessments,person.users.stressAssessments,person.users.suicideAssessments",
      });
      setSelectedStudent(student as Student);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };
  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, program, year, email, gender, mental health, or BMI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              disabled={loading}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year Level
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mental Health
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BMI Category
                </th>
                <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => handleStudentRowClick(student)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{student.studentNumber}</div>
                      <div className="text-xs text-gray-400 sm:hidden">{student.email}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.program}</div>
                    <div className="text-xs text-gray-500 sm:hidden">
                      {student.year} • {student.gender}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.year}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.gender}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.mentalHealthPrediction === "Low Risk"
                          ? "bg-green-100 text-green-800"
                          : student.mentalHealthPrediction === "Moderate Risk"
                          ? "bg-yellow-100 text-yellow-800"
                          : student.mentalHealthPrediction === "High Risk"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.mentalHealthPrediction}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.bmiCategory === "Normal"
                          ? "bg-green-100 text-green-800"
                          : student.bmiCategory === "Underweight"
                          ? "bg-blue-100 text-blue-800"
                          : student.bmiCategory === "Overweight"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.bmiCategory}
                    </span>
                  </td>
                  <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && !loading && (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              {searchTerm
                ? `No students found matching "${searchTerm}"`
                : "No students found matching your criteria"}
            </p>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      <StudentDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />
    </>
  );
};
