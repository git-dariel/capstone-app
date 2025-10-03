import React, { useState, useEffect } from "react";
import { InventoryRecordsTable, ViewInventoryDrawer } from "@/components/molecules";
import { useInventory } from "@/hooks";
import type { GetInventoryResponse } from "@/services/inventory.service";

// Constants for consistent data fetching
const INVENTORY_FIELDS =
  "id,studentId,height,weight,coplexion,createdAt,updatedAt,predictionGenerated,predictionUpdatedAt,mentalHealthPrediction,student.studentNumber,student.program,student.year,student.person.firstName,student.person.lastName,student.person.email,student.person.gender";

export const InventoryRecordsContent: React.FC = () => {
  const [viewingInventory, setViewingInventory] = useState<GetInventoryResponse | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);

  const { inventories, loading, error, fetchInventories } = useInventory();

  // Fetch inventories on component mount
  useEffect(() => {
    fetchInventories({
      limit: 100,
      fields: INVENTORY_FIELDS,
    }).catch(console.error);
  }, [fetchInventories]);

  const handleViewInventory = (inventory: GetInventoryResponse) => {
    setViewingInventory(inventory);
    setIsViewDrawerOpen(true);
  };

  const handleCloseViewDrawer = () => {
    setIsViewDrawerOpen(false);
    setViewingInventory(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Inventory Records</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Comprehensive view of all student inventory records with mental health predictions
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <InventoryRecordsTable
          inventories={inventories}
          loading={loading}
          error={error}
          onView={handleViewInventory}
        />
      </div>

      <ViewInventoryDrawer
        isOpen={isViewDrawerOpen}
        onClose={handleCloseViewDrawer}
        inventory={viewingInventory}
      />
    </div>
  );
};
