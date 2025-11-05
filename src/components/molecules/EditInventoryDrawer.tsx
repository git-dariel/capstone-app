import React, { useState } from "react";
import { Drawer } from "@/components/atoms";
import { Button } from "@/components/ui";
import { FormField, FormSelect } from "@/components/atoms";
import { AlertCircle } from "lucide-react";
import type { GetInventoryResponse } from "@/services/inventory.service";

interface EditInventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inventory?: GetInventoryResponse | null;
  onSave: (data: Partial<any>) => Promise<void>;
}

export const EditInventoryDrawer: React.FC<EditInventoryDrawerProps> = ({
  isOpen,
  onClose,
  inventory,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    height: inventory?.height || "",
    weight: inventory?.weight || "",
    coplexion: inventory?.coplexion || "",
  });

  const complexionOptions = [
    { value: "fair", label: "Fair" },
    { value: "brown", label: "Brown" },
    { value: "dark", label: "Dark" },
    { value: "very_fair", label: "Very Fair" },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.height || !formData.weight || !formData.coplexion) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update inventory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Edit Physical Information" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            ℹ️ Update your physical information. Your mental health prediction may be recalculated
            based on changes.
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            id="height"
            label="Height *"
            type="text"
            placeholder="e.g., 5'10&quot; or 178 cm"
            value={formData.height}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("height", e.target.value)
            }
            required
            disabled={loading}
          />

          <FormField
            id="weight"
            label="Weight *"
            type="text"
            placeholder="e.g., 160 lbs or 72.5 kg"
            value={formData.weight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("weight", e.target.value)
            }
            required
            disabled={loading}
          />

          <FormSelect
            id="coplexion"
            label="Complexion *"
            value={formData.coplexion}
            onChange={(value) => handleChange("coplexion", value)}
            options={complexionOptions}
            required
            disabled={loading}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
