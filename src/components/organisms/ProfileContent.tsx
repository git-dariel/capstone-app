import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, ToastContainer } from "@/components/atoms";
import {
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  GraduationCap,
  Shield,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { UserService, StudentService, TokenManager } from "@/services";
import { useToast } from "@/hooks";
import { programOptions, yearOptions } from "@/config/constants";

export const ProfileContent: React.FC = () => {
  const { user: authUser, student: authStudent } = useAuth();
  const { success, error, toasts, removeToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Direct data fetching states
  const [user, setUser] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user and student data directly using IDs
  useEffect(() => {
    const fetchProfileData = async () => {
      if (authUser?.id) {
        try {
          setLoading(true);

          // Fetch complete user data
          const userData = await UserService.getUserById(authUser.id);
          setUser(userData);

          // If user is a student, also fetch student data
          if (authUser.type === "student" && authStudent?.id) {
            const studentData = await StudentService.getStudentById(authStudent.id);
            setStudent(studentData);
          }
        } catch (err) {
          console.error("Error fetching profile data:", err);
          error("Error", "Failed to load profile data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [authUser?.id, authUser?.type, authStudent?.id]);

  // Get user data based on type
  const userData = user?.type === "student" ? student : user;

  // For students, try to get person data from user first (which has complete data), then fall back to student
  const person =
    user?.type === "student" ? user?.person || (student as any)?.person : userData?.person;

  // Helper function to format address
  const formatAddress = (address: any): string => {
    if (typeof address === "string") {
      return address;
    }

    if (!address || typeof address !== "object") {
      return "Not provided";
    }

    const parts = [
      address.houseNo,
      address.street,
      address.barangay,
      address.city,
      address.province,
      address.zipCode,
      address.country,
    ].filter((part) => part && typeof part === "string" && part.trim());

    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const refreshUserData = async () => {
    try {
      if (authUser?.id) {
        // Fetch fresh user data
        const updatedUser = await UserService.getUserById(authUser.id);
        setUser(updatedUser);

        // If user is a student, also fetch fresh student data
        if (authUser.type === "student" && authStudent?.id) {
          const updatedStudent = await StudentService.getStudentById(authStudent.id);
          setStudent(updatedStudent);
        }

        // Update TokenManager as well
        TokenManager.setUser(updatedUser);
        if (authUser.type === "student" && authStudent?.id) {
          const updatedStudent = await StudentService.getStudentById(authStudent.id);
          TokenManager.setStudent(updatedStudent);
        }

        console.log("Profile data refreshed and UI updated");
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
    }
  };

  const handleSaveChanges = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Get form inputs using more specific selectors
      const firstNameInput = document.querySelector('input[name="firstName"]') as HTMLInputElement;
      const lastNameInput = document.querySelector('input[name="lastName"]') as HTMLInputElement;
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      const phoneInput = document.querySelector('input[name="contactNumber"]') as HTMLInputElement;
      const studentNumberInput = document.querySelector(
        'input[name="studentNumber"]'
      ) as HTMLInputElement;
      const programSelect = document.querySelector('select[name="program"]') as HTMLSelectElement;
      const yearSelect = document.querySelector('select[name="year"]') as HTMLSelectElement;

      // Prepare update data - only include fields that have actually changed
      const userUpdateData: any = {};
      const studentUpdateData: any = {};

      console.log("Current values:", {
        firstName: person?.firstName,
        lastName: person?.lastName,
        email: person?.email,
        contactNumber: person?.contactNumber,
        studentNumber: student?.studentNumber,
        program: student?.program,
        year: student?.year,
      });

      // Check if personal information fields have changed
      if (firstNameInput && firstNameInput.value !== person?.firstName) {
        userUpdateData.firstName = firstNameInput.value;
      }
      if (lastNameInput && lastNameInput.value !== person?.lastName) {
        userUpdateData.lastName = lastNameInput.value;
      }
      if (emailInput && emailInput.value !== person?.email) {
        userUpdateData.email = emailInput.value;
      }
      if (phoneInput && phoneInput.value !== person?.contactNumber) {
        userUpdateData.contactNumber = phoneInput.value || null;
      }

      // For students, check if academic fields have changed
      if (user?.type === "student" && student?.id) {
        if (studentNumberInput && studentNumberInput.value !== student?.studentNumber) {
          studentUpdateData.studentNumber = studentNumberInput.value;
        }
        if (programSelect && programSelect.value !== student?.program) {
          studentUpdateData.program = programSelect.value;
        }
        if (yearSelect && yearSelect.value !== student?.year) {
          studentUpdateData.year = yearSelect.value;
        }
      }

      console.log("Form values:", {
        firstName: firstNameInput?.value,
        lastName: lastNameInput?.value,
        email: emailInput?.value,
        contactNumber: phoneInput?.value,
        studentNumber: studentNumberInput?.value,
        program: programSelect?.value,
        year: yearSelect?.value,
      });

      console.log("Update data prepared:", {
        userUpdateData,
        studentUpdateData,
      });

      // Update User/Person data if there are changes
      if (Object.keys(userUpdateData).length > 0) {
        console.log("Updating user with:", userUpdateData);
        await UserService.updateUser(user.id, userUpdateData);
      }

      // Update Student data if user is a student and there are academic changes
      if (user?.type === "student" && student?.id && Object.keys(studentUpdateData).length > 0) {
        console.log("Updating student with:", studentUpdateData);
        await StudentService.updateStudent(student.id, studentUpdateData);
      }

      // If no changes were made to either User or Student data, show a message
      if (Object.keys(userUpdateData).length === 0 && Object.keys(studentUpdateData).length === 0) {
        success("No Changes", "No changes were detected. Your profile is already up to date.");
        setIsEditing(false);
        return;
      }

      success("Profile Updated", "Your profile has been updated successfully.");
      setIsEditing(false);

      // Refresh user data to show updated information
      await refreshUserData();
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const errorMessage = err?.message || "Failed to update profile. Please try again.";
      error("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = "New password must be different from current password";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm() || !user?.id) return;

    setIsChangingPassword(true);
    try {
      await UserService.updateUser(user.id, {
        password: passwordData.newPassword,
        currentPassword: passwordData.currentPassword,
      });

      success("Password Changed", "Your password has been updated successfully.");

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePassword(false);
      setPasswordErrors({});
    } catch (err: any) {
      console.error("Error changing password:", err);

      // Handle specific error messages from backend
      const errorMessage = err?.message || "Failed to change password. Please try again.";
      error("Error", errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowChangePassword(false);
    setPasswordErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (userType: string) => {
    switch (userType) {
      case "guidance":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "student":
        return "bg-green-100 text-green-800 border-green-200";
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
          </div>
          <Button
            onClick={handleEdit}
            variant={isEditing ? "destructive" : "outline"}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
          </Button>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar
                  fallback={person?.firstName?.charAt(0)?.toUpperCase() || "U"}
                  className="h-20 w-20 text-xl"
                />
                {isEditing && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer">
                    <Edit className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {person?.firstName} {person?.lastName}
                  </h2>
                  <Badge className={getRoleBadgeColor(user?.type || "")}>
                    {user?.type === "guidance"
                      ? "Guidance Counselor"
                      : user?.type === "student"
                      ? "Student"
                      : user?.type === "admin"
                      ? "Administrator"
                      : "User"}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3">{person?.email}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user?.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <Badge variant="outline" className={getStatusBadgeColor(user?.status)}>
                      {user?.status || "Active"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Your basic personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">First Name</label>
                  <p className="text-gray-900 mt-1">
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        defaultValue={person?.firstName || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      person?.firstName || "Not provided"
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Name</label>
                  <p className="text-gray-900 mt-1">
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        defaultValue={person?.lastName || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      person?.lastName || "Not provided"
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          defaultValue={person?.email || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      ) : (
                        person?.email || "Not provided"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">
                      {isEditing ? (
                        <input
                          type="tel"
                          name="contactNumber"
                          defaultValue={person?.contactNumber || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      ) : (
                        person?.contactNumber || "Not provided"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">
                      {isEditing ? (
                        <textarea
                          defaultValue={formatAddress(person?.address)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      ) : (
                        formatAddress(person?.address)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic/Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>
                  {user?.type === "student" ? "Academic Information" : "Professional Information"}
                </span>
              </CardTitle>
              <CardDescription>
                {user?.type === "student"
                  ? "Your academic details and program information"
                  : "Your professional details and role information"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.type === "student" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Student Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="studentNumber"
                          defaultValue={student?.studentNumber || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                        />
                      ) : (
                        <p className="text-gray-900 mt-1">
                          {student?.studentNumber || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Program</label>
                      {isEditing ? (
                        <select
                          name="program"
                          defaultValue={student?.program || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                        >
                          <option value="">Select Program</option>
                          {programOptions.map((program) => (
                            <option key={program.value} value={program.value}>
                              {program.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900 mt-1">{student?.program || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Year Level</label>
                    {isEditing ? (
                      <select
                        name="year"
                        defaultValue={student?.year || ""}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
                      >
                        <option value="">Select Year Level</option>
                        {yearOptions.map((year) => (
                          <option key={year.value} value={year.value}>
                            {year.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 mt-1">{student?.year || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        Active
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <p className="text-gray-900 mt-1">Guidance and Counseling Services</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Position</label>
                    <p className="text-gray-900 mt-1">
                      {user?.type === "guidance" ? "Guidance Counselor" : "Administrator"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Employee ID</label>
                    <p className="text-gray-900 mt-1">{user?.id || "Not provided"}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account settings and security information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Account Type</label>
                <p className="text-gray-900 mt-1 capitalize">{user?.type || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900 mt-1">{formatDate(user?.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900 mt-1">{formatDate(user?.updatedAt)}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Password</h3>
                <p className="text-sm text-gray-500">
                  Update your password to keep your account secure
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="flex items-center space-x-2"
              >
                <Lock className="h-4 w-4" />
                <span>{showChangePassword ? "Cancel" : "Change Password"}</span>
              </Button>
            </div>

            {showChangePassword && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-md font-medium text-gray-900 mb-4">Change Password</h4>
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="text-sm text-gray-500">
                    <p>Password requirements:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>At least 6 characters long</li>
                      <li>Must be different from your current password</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelPasswordChange}
                      disabled={isChangingPassword}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      disabled={
                        isChangingPassword ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword
                      }
                    >
                      {isChangingPassword ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Changes Button (when editing) */}
        {isEditing && (
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </main>
  );
};
