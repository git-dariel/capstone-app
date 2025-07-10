import React, { useState } from "react";
import { AddAdminForm, UsersTable } from "@/components/molecules";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/atoms/Modal";
import { Plus } from "lucide-react";

export const AccountsContent: React.FC = () => {
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdminCreated = () => {
    // Trigger refresh of the users table by changing the key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="flex-1 p-6 bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
            <p className="text-gray-600 mt-1">Manage admin users and guidance counselors</p>
          </div>
          <Button onClick={() => setIsAddAdminModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Admin User
          </Button>
        </div>

        {/* Users Table */}
        <UsersTable key={refreshKey} />

        {/* Add Admin User Modal */}
        <Modal
          isOpen={isAddAdminModalOpen}
          onClose={() => setIsAddAdminModalOpen(false)}
          title="Add Admin User"
        >
          <AddAdminForm
            onClose={() => setIsAddAdminModalOpen(false)}
            onSuccess={handleAdminCreated}
          />
        </Modal>
      </div>
    </main>
  );
};
