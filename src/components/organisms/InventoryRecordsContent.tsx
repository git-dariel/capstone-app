import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InventoryRecordsTable, ViewInventoryDrawer, InventoryStatsGrid } from "@/components/molecules";
import { useInventory } from "@/hooks";
import { Brain, Activity, Heart } from "lucide-react";
import type { GetInventoryResponse } from "@/services/inventory.service";

// Constants for consistent data fetching
const INVENTORY_FIELDS =
  "id,height,weight,coplexion,createdAt,updatedAt,predictionGenerated,predictionUpdatedAt,mentalHealthPrediction,student.studentNumber,student.program,student.year,student.person.firstName,student.person.lastName,student.person.email,student.person.gender,student.person.users.avatar";

export const InventoryRecordsContent: React.FC = () => {
  const navigate = useNavigate();
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

  const handleInsightClick = (type: string) => {
    navigate(`/inventory/insights/${type}`);
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

      {/* Insights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div 
          onClick={() => handleInsightClick('mental-health-prediction')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Mental Health Insights</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">View Analysis</p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Risk predictions & distribution
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center text-blue-600 bg-blue-50 rounded-lg flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <Brain className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full group-hover:bg-blue-100 transition-colors">
              💡 Click to view detailed insights
            </span>
          </div>
        </div>

        <div 
          onClick={() => handleInsightClick('bmi-category')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">BMI Analysis</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">View Distribution</p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Body mass index categories
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center text-green-600 bg-green-50 rounded-lg flex-shrink-0 group-hover:bg-green-100 transition-colors">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full group-hover:bg-green-100 transition-colors">
              📊 Click to explore BMI trends
            </span>
          </div>
        </div>

        <div 
          onClick={() => handleInsightClick('physical-health')}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Physical Health</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">View Patterns</p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Overall health indicators
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center text-purple-600 bg-purple-50 rounded-lg flex-shrink-0 group-hover:bg-purple-100 transition-colors">
              <Heart className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-full group-hover:bg-purple-100 transition-colors">
              ❤️ Click to analyze health data
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <InventoryStatsGrid />

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
