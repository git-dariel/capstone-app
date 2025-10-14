import { Avatar, ToastContainer } from "@/components/atoms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DiceBearAvatarSelector } from "@/components/molecules/DiceBearAvatarSelector";
import { programOptions, yearOptions } from "@/config/constants";
import { useAuth, useToast } from "@/hooks";
import { StudentService, TokenManager, UserService } from "@/services";
import { Calendar, Edit, Eye, EyeOff, GraduationCap, Lock, Mail, MapPin, Phone, Shield, Upload, User, X, Image, Sparkles } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export const ProfileContent: React.FC = () => {
  const { user: authUser, student: authStudent, refreshAuth } = useAuth();
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

  // Avatar-related states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarModalTab, setAvatarModalTab] = useState<'upload' | 'generate'>('upload');
  const [selectedDiceBearAvatar, setSelectedDiceBearAvatar] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const person = user?.type === "student" ? user?.person || (student as any)?.person : userData?.person;

  // Helper function to format address
  const formatAddress = (address: any): string => {
    if (typeof address === "string") {
      return address;
    }

    if (!address || typeof address !== "object") {
      return "Not provided";
    }

    const parts = [address.houseNo, address.street, address.barangay, address.city, address.province, address.zipCode, address.country].filter(
      (part) => part && typeof part === "string" && part.trim()
    );

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
      const studentNumberInput = document.querySelector('input[name="studentNumber"]') as HTMLInputElement;
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

  // Avatar upload handler
  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      error("Invalid file type", "Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      error("File too large", "Please select an image smaller than 5MB");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const response = await UserService.uploadAvatar(file);

      // Update the user state with new avatar
      setUser((prev: any) => ({
        ...prev,
        avatar: response.updatedUser.avatar,
      }));

      // Refresh auth state to update avatar across all components
      await refreshAuth();

      success("Avatar updated", "Your profile picture has been updated successfully");
      setShowAvatarModal(false);
    } catch (err) {
      console.error("Error uploading avatar:", err);
      error("Upload failed", "Failed to update your profile picture. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Avatar delete handler
  const handleAvatarDelete = async () => {
    try {
      await UserService.deleteAvatar();

      // Update the user state to remove avatar
      setUser((prev: any) => ({
        ...prev,
        avatar: null,
      }));

      // Refresh auth state to update avatar across all components
      await refreshAuth();

      success("Avatar removed", "Your profile picture has been removed");
      setShowAvatarModal(false);
    } catch (err) {
      console.error("Error deleting avatar:", err);
      error("Delete failed", "Failed to remove your profile picture. Please try again.");
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle DiceBear avatar selection
  const handleDiceBearAvatarSelect = (avatarSvg: string) => {
    setSelectedDiceBearAvatar(avatarSvg);
  };

  // Convert SVG to PNG
  const svgToPng = (svgString: string, size: number = 512): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new (window as any).Image();
      
      canvas.width = size;
      canvas.height = size;
      
      img.onload = () => {
        if (ctx) {
          // Fill with white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, size, size);
          
          // Draw the SVG
          ctx.drawImage(img, 0, 0, size, size);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert SVG to PNG'));
            }
          }, 'image/png', 0.9);
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load SVG'));
      
      // Create a data URL from the SVG
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    });
  };

  // Handle DiceBear avatar save
  const handleSaveDiceBearAvatar = async () => {
    if (!selectedDiceBearAvatar) return;

    try {
      setIsUploadingAvatar(true);
      
      // Convert SVG to PNG
      const pngBlob = await svgToPng(selectedDiceBearAvatar, 512);
      const file = new File([pngBlob], 'dicebear-avatar.png', { type: 'image/png' });
      
      const response = await UserService.uploadAvatar(file);

      // Update the user state with new avatar
      setUser((prev: any) => ({
        ...prev,
        avatar: response.updatedUser.avatar,
      }));

      // Refresh auth state to update avatar across all components
      await refreshAuth();

      success("Avatar updated", "Your profile picture has been updated successfully");
      setShowAvatarModal(false);
      setSelectedDiceBearAvatar('');
    } catch (err) {
      console.error("Error uploading DiceBear avatar:", err);
      error("Upload failed", "Failed to update your profile picture. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Get user initials for fallback avatar
  const getUserInitials = () => {
    if (person?.firstName && person?.lastName) {
      return `${person.firstName.charAt(0)}${person.lastName.charAt(0)}`.toUpperCase();
    }
    return "U";
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your account information and preferences</p>
          </div>
          <Button onClick={handleEdit} variant={isEditing ? "destructive" : "outline"} className="flex items-center justify-center space-x-2 w-full sm:w-auto">
            <Edit className="h-4 w-4" />
            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
          </Button>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative flex justify-center sm:justify-start">
                <Avatar src={user?.avatar} fallback={getUserInitials()} className="h-20 w-20 text-xl" />
                {isEditing && (
                  <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors"
                    onClick={() => setShowAvatarModal(true)}
                  >
                    <Edit className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col items-center sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {person?.firstName} {person?.lastName}
                  </h2>
                  <Badge className={getRoleBadgeColor(user?.type || "")}>
                    {user?.type === "guidance" ? "Guidance Counselor" : user?.type === "student" ? "Student" : user?.type === "admin" ? "Administrator" : "User"}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3 text-sm sm:text-base break-all sm:break-normal overflow-hidden">{person?.email}</p>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-500">
                  <div className="flex items-center justify-center sm:justify-start space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user?.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-1">
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
                    <p className="text-gray-900 break-all sm:break-normal overflow-hidden">
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
                <span>{user?.type === "student" ? "Academic Information" : "Professional Information"}</span>
              </CardTitle>
              <CardDescription>{user?.type === "student" ? "Your academic details and program information" : "Your professional details and role information"}</CardDescription>
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
                        <p className="text-gray-900 mt-1">{student?.studentNumber || "Not provided"}</p>
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
                      <select name="year" defaultValue={student?.year || ""} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1">
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
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
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
                    <p className="text-gray-900 mt-1">{user?.type === "guidance" ? "Guidance Counselor" : "Administrator"}</p>
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
                <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
              </div>
              <Button variant="outline" onClick={() => setShowChangePassword(!showChangePassword)} className="flex items-center space-x-2">
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
                      <button type="button" onClick={() => togglePasswordVisibility("current")} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {showPasswords.current ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>}
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
                      <button type="button" onClick={() => togglePasswordVisibility("new")} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {showPasswords.new ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>}
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
                      <button type="button" onClick={() => togglePasswordVisibility("confirm")} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>}
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
                    <Button variant="outline" onClick={handleCancelPasswordChange} disabled={isChangingPassword}>
                      Cancel
                    </Button>
                    <Button onClick={handleChangePassword} disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}>
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
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <div className="fixed inset-0 bg-transparent backdrop-blur-sm" onClick={() => setShowAvatarModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-2 sm:mx-0 p-4 sm:p-6 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Update Profile Picture</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAvatarModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setAvatarModalTab('upload')}
                  className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    avatarModalTab === 'upload'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Image className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload Photo</span>
                  <span className="sm:hidden">Upload</span>
                </button>
                <button
                  onClick={() => setAvatarModalTab('generate')}
                  className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                    avatarModalTab === 'generate'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Generate Avatar</span>
                  <span className="sm:hidden">Generate</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Avatar Preview */}
                <div className="text-center">
                  <Avatar src={user?.avatar} fallback={getUserInitials()} className="h-20 w-20 mx-auto text-lg" />
                  <p className="text-sm text-gray-500 mt-2">Current avatar</p>
                </div>

                {/* Upload Tab Content */}
                {avatarModalTab === 'upload' && (
                  <div className="space-y-3">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="avatar-upload" />
                    <label
                      htmlFor="avatar-upload"
                      className={`w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors ${
                        isUploadingAvatar ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">{isUploadingAvatar ? "Uploading..." : "Choose new photo"}</span>
                        <span className="text-xs text-gray-500">JPG, PNG, GIF up to 5MB</span>
                      </div>
                    </label>

                    {user?.avatar && (
                      <Button variant="outline" onClick={handleAvatarDelete} disabled={isUploadingAvatar} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                        Remove current photo
                      </Button>
                    )}
                  </div>
                )}

                {/* Generate Tab Content */}
                {avatarModalTab === 'generate' && (
                  <div className="space-y-4">
                    <DiceBearAvatarSelector
                      onSelect={handleDiceBearAvatarSelect}
                      userName={`${person?.firstName || 'User'} ${person?.lastName || ''}`}
                    />
                    
                    {selectedDiceBearAvatar && (
                      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedDiceBearAvatar('')}
                          disabled={isUploadingAvatar}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveDiceBearAvatar}
                          disabled={isUploadingAvatar || !selectedDiceBearAvatar}
                          className="w-full sm:w-auto"
                        >
                          {isUploadingAvatar ? "Saving..." : "Save Avatar"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </main>
  );
};
