import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks";
import { StudentService } from "@/services/student.service";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import ExampleImage from "../../assets/upload-student-csv.png";

interface UploadResults {
  total: number;
  successful: number;
  skipped: number;
  errors: Array<{
    studentNumber: string;
    firstName: string;
    lastName: string;
    middleName: string;
    error: string;
  }>;
}

interface StudentCSVUploadProps {
  onUploadSuccess?: () => void;
}

export const StudentCSVUpload: React.FC<StudentCSVUploadProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      error("Please select a CSV file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setUploadResults(null);
    setShowResults(false);

    try {
      const response = await StudentService.uploadStudentsCSV(file);

      // Transform the response to match our interface
      const transformedResults: UploadResults = {
        ...response.results,
        errors: response.results.errors.map((error: any) => ({
          studentNumber: error.studentNumber,
          firstName: error.firstName || "",
          lastName: error.lastName || "",
          middleName: error.middleName || "",
          error: error.error,
        })),
      };

      setUploadResults(transformedResults);
      setShowResults(true);

      if (response.results.errors.length === 0) {
        success(
          `Successfully uploaded ${response.results.successful} students${
            response.results.skipped > 0 ? ` (${response.results.skipped} skipped)` : ""
          }`
        );
      } else {
        error(
          `Upload completed with ${response.results.errors.length} errors. Check results for details.`
        );
      }

      // Call the success callback if provided and if there were successful uploads
      if (onUploadSuccess && response.results.successful > 0) {
        onUploadSuccess();
      }
    } catch (err: any) {
      error(err.message || "Failed to upload CSV file");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setUploadResults(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Button
          onClick={handleShowInstructions}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? "Uploading..." : "Upload CSV File"}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p>Upload first-year students from CSV file</p>
          <p>Click the button to see format instructions and example</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CSV Upload Instructions
              </h3>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowInstructions(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Required CSV Format
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Your CSV file must contain the following columns in this exact order:
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>
                    <strong>STUDENT NUMBER:</strong> The student's unique identifier (e.g.,
                    2025-00320-LQ-0)
                  </li>
                  <li>
                    <strong>FIRSTNAME:</strong> Student's first name (e.g., AIRA NICOLE)
                  </li>
                  <li>
                    <strong>LASTNAME:</strong> Student's last name (e.g., ABOGADO)
                  </li>
                  <li>
                    <strong>MIDDLENAME:</strong> Student's middle name (optional, can be empty)
                  </li>
                </ul>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-3">Example CSV Format:</h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded border overflow-hidden">
                  <img
                    src={ExampleImage}
                    alt="CSV Format Example showing columns: STUDENT NUMBER, FIRSTNAME, LASTNAME, MIDDLENAME with sample data"
                    className="w-full h-auto"
                    style={{ maxHeight: "300px", objectFit: "contain" }}
                  />
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  Important Notes:
                </h4>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Make sure the first row contains the column headers exactly as shown</li>
                  <li>• Student numbers must be unique</li>
                  <li>• First name and last name are required for each student</li>
                  <li>• Middle name can be left empty if not available</li>
                  <li>• File size must be less than 10MB</li>
                  <li>• Only CSV files are accepted</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowInstructions(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowInstructions(false);
                  handleFileSelect();
                }}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Select CSV File
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && uploadResults && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Results
              </h3>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCloseResults}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {uploadResults.total}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Total</div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                  <CheckCircle className="h-5 w-5" />
                  {uploadResults.successful}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Created</div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {uploadResults.skipped}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Skipped</div>
              </div>

              <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                  {uploadResults.errors.length > 0 && <AlertCircle className="h-5 w-5" />}
                  {uploadResults.errors.length}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Errors</div>
              </div>
            </div>

            {/* Error Details */}
            {uploadResults.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Errors ({uploadResults.errors.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {uploadResults.errors.map((error, index) => (
                    <div
                      key={index}
                      className="border border-red-200 dark:border-red-700 rounded p-3 bg-red-50/50 dark:bg-red-950/50"
                    >
                      <div className="font-medium text-sm">
                        {error.studentNumber} - {error.firstName}{" "}
                        {error.middleName ? error.middleName + " " : ""}
                        {error.lastName}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {error.error}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadResults.errors.length === 0 && uploadResults.successful > 0 && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Upload Successful!</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  All students have been successfully uploaded to the system.
                </p>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <Button onClick={handleCloseResults}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
