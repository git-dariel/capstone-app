import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/atoms/Modal";
import { ConfirmationModal } from "./ConfirmationModal";
import { FormField } from "@/components/atoms/FormField";
import { FormSelect } from "@/components/atoms/FormSelect";
import { UserService, type User, type UpdateUserRequest } from "@/services/user.service";
import { genderOptions, civilStatusOptions } from "@/config/constants";
import { Edit2, Trash2, Mail, Phone, Calendar } from "lucide-react";

interface EditUserFormProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateUserRequest>({
    firstName: user.person.firstName,
    lastName: user.person.lastName,
    email: user.person.email || "",
    contactNumber: user.person.contactNumber || "",
    gender: user.person.gender || "",
    birthDate: user.person.birthDate || "",
    age: user.person.age || undefined,
    religion: user.person.religion || "",
    civilStatus: user.person.civilStatus || "",
  });

  const handleChange =
    (field: keyof UpdateUserRequest) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "age" ? (e.target.value ? parseInt(e.target.value) : undefined) : e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value,
    }));
  };

  const handleCivilStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      civilStatus: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await UserService.updateUser(user.id, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="firstName"
          label="First name"
          value={formData.firstName || ""}
          onChange={handleChange("firstName")}
          required
          disabled={loading}
        />

        <FormField
          id="lastName"
          label="Last name"
          value={formData.lastName || ""}
          onChange={handleChange("lastName")}
          required
          disabled={loading}
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange("email")}
          disabled={loading}
        />

        <FormField
          id="contactNumber"
          label="Contact Number"
          type="tel"
          value={formData.contactNumber || ""}
          onChange={handleChange("contactNumber")}
          disabled={loading}
        />

        <FormSelect
          id="gender"
          label="Gender"
          value={formData.gender || ""}
          onChange={handleGenderChange}
          options={genderOptions}
          placeholder="Select gender"
          disabled={loading}
        />

        <FormField
          id="birthDate"
          label="Birth Date"
          type="date"
          value={formData.birthDate || ""}
          onChange={handleChange("birthDate")}
          disabled={loading}
        />

        <FormField
          id="age"
          label="Age"
          type="number"
          value={formData.age?.toString() || ""}
          onChange={handleChange("age")}
          disabled={loading}
        />

        <FormField
          id="religion"
          label="Religion"
          value={formData.religion || ""}
          onChange={handleChange("religion")}
          disabled={loading}
        />

        <FormSelect
          id="civilStatus"
          label="Civil Status"
          value={formData.civilStatus || ""}
          onChange={handleCivilStatusChange}
          options={civilStatusOptions}
          placeholder="Select civil status"
          disabled={loading}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary-700 hover:bg-primary-800 text-white"
        >
          {loading ? "Updating..." : "Update User"}
        </Button>
      </div>
    </form>
  );
};

export const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers();

      // Debug logging to help identify the response format
      console.log("API Response:", response);
      console.log("Response type:", typeof response);
      console.log("Is array:", Array.isArray(response));

      // Handle different response formats
      let allUsers: User[] = [];
      if (Array.isArray(response)) {
        allUsers = response;
      } else if (response && typeof response === "object") {
        // Check for common response wrapper patterns
        if ("data" in response && Array.isArray((response as any).data)) {
          allUsers = (response as any).data;
          console.log("Using data property, found users:", allUsers.length);
        } else if ("users" in response && Array.isArray((response as any).users)) {
          allUsers = (response as any).users;
          console.log("Using users property, found users:", allUsers.length);
        } else if (response && typeof response === "object" && "length" in response) {
          // Handle array-like objects
          const arrayLike = response as any;
          allUsers = Array.from(arrayLike);
          console.log("Converting array-like object, found users:", allUsers.length);
        } else {
          // Try to extract values if it's an object with numeric keys
          const values = Object.values(response);
          if (
            values.length > 0 &&
            values.every(
              (item) => typeof item === "object" && item !== null && "id" in item && "type" in item
            )
          ) {
            allUsers = values as User[];
            console.log("Using object values, found users:", allUsers.length);
          } else {
            console.log("Response is object but couldn't extract user array, using empty array");
            allUsers = [];
          }
        }
      } else {
        console.log("Unexpected response format, using empty array");
        allUsers = [];
      }

      // Filter for guidance users only and add defensive checks
      const guidanceUsers = allUsers
        .filter((user) => {
          // Ensure user object has required properties
          return user && user.type === "guidance";
        })
        .map((user) => {
          // Ensure person property exists, if not create a default one
          if (!user.person) {
            console.warn("User missing person property, creating default:", user);
            const rawUser = user as any; // Cast to any to access potentially different structure
            return {
              ...user,
              person: {
                id: rawUser.personId || user.id || "",
                firstName: rawUser.firstName || "Unknown",
                lastName: rawUser.lastName || "User",
                email: rawUser.email || user.email || "",
                middleName: rawUser.middleName || "",
                contactNumber: rawUser.contactNumber || "",
                gender: rawUser.gender || "",
                birthDate: rawUser.birthDate || "",
                birthPlace: rawUser.birthPlace || "",
                age: rawUser.age || undefined,
                religion: rawUser.religion || "",
                civilStatus: rawUser.civilStatus || "",
              },
            };
          }
          return user;
        });

      console.log("Filtered guidance users:", guidanceUsers);
      setUsers(guidanceUsers);
    } catch (error: any) {
      setError(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    setDeleteLoading(true);
    try {
      await UserService.deleteUser(deletingUser.id);
      setUsers(users.filter((user) => user.id !== deletingUser.id));
      setDeletingUser(null);
    } catch (error: any) {
      setError(error.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatStatus = (user: User) => {
    if (user.status) {
      // Capitalize first letter of status
      return user.status.charAt(0).toUpperCase() + user.status.slice(1).toLowerCase();
    }
    // Fallback to isActive
    return user.isActive ? "Active" : "Inactive";
  };

  const getStatusColor = (user: User) => {
    const status = user.status?.toLowerCase();
    if (status === "active" || (!status && user.isActive)) {
      return "bg-green-100 text-green-800";
    } else if (status === "inactive" || status === "suspended" || (!status && !user.isActive)) {
      return "bg-red-100 text-red-800";
    } else if (status === "pending") {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={fetchUsers}
            className="touch-manipulation bg-primary-700 hover:bg-primary-800 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 md:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Guidance Users</h2>
          <p className="text-sm text-gray-600">{users.length} total users</p>
        </div>

        {users.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No guidance users found.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout - visible on small screens */}
            <div className="block md:hidden divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {user.person?.firstName || "Unknown"} {user.person?.lastName || "User"}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        @{user.userName || "unknown"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        user
                      )}`}
                    >
                      {formatStatus(user)}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-2 mb-3">
                    {user.person?.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{user.person.email}</span>
                      </div>
                    )}
                    {user.person?.contactNumber && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{user.person.contactNumber}</span>
                      </div>
                    )}
                    {user.person?.gender && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Gender:</span> {user.person.gender}
                      </div>
                    )}
                    {user.person?.birthDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{formatDate(user.person.birthDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(user)}
                      className="flex items-center justify-center gap-2 flex-1 touch-manipulation bg-primary-700 hover:bg-primary-800 text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingUser(user)}
                      className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300 flex-1 touch-manipulation"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout - hidden on small screens */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.person?.firstName || "Unknown"} {user.person?.lastName || "User"}
                          </div>
                          <div className="text-sm text-gray-500">@{user.userName || "unknown"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {user.person?.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.person.email}
                            </div>
                          )}
                          {user.person?.contactNumber && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {user.person.contactNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {user.person?.gender && (
                            <div className="text-sm text-gray-600">
                              Gender: {user.person.gender}
                            </div>
                          )}
                          {user.person?.birthDate && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(user.person.birthDate)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            user
                          )}`}
                        >
                          {formatStatus(user)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(user)}
                            className="flex items-center gap-1 bg-primary-700 hover:bg-primary-800 text-white"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingUser(user)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit User: ${editingUser.person.firstName} ${editingUser.person.lastName}`}
        >
          <EditUserForm
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSuccess={fetchUsers}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <ConfirmationModal
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete ${deletingUser.person.firstName} ${deletingUser.person.lastName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          loading={deleteLoading}
        />
      )}
    </>
  );
};
