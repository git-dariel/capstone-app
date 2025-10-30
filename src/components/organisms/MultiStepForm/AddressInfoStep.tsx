import React from "react";
import { FormField } from "@/components/atoms";

interface AddressInfoStepProps {
  formData: {
    address: {
      street: string;
      city: string;
      province: string;
      zipCode: string;
    };
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export const AddressInfoStep: React.FC<AddressInfoStepProps> = ({
  formData,
  onFieldChange,
  disabled = false,
}) => {
  const handleAddressChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(`address.${field}`, e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Address Information</h2>
        <p className="text-sm text-gray-600">Provide your current address details</p>
      </div>

      <FormField
        id="address.street"
        label="Street Address"
        value={formData.address.street}
        onChange={handleAddressChange("street")}
        required
        disabled={disabled}
        placeholder="House/Unit number, Street name"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="address.city"
          label="City"
          value={formData.address.city}
          onChange={handleAddressChange("city")}
          required
          disabled={disabled}
          placeholder="City/Municipality"
        />

        <FormField
          id="address.zipCode"
          label="ZIP Code"
          value={formData.address.zipCode}
          onChange={handleAddressChange("zipCode")}
          required
          disabled={disabled}
          placeholder="Postal code"
        />
      </div>

      <FormField
        id="address.province"
        label="Province"
        value={formData.address.province}
        onChange={handleAddressChange("province")}
        required
        disabled={disabled}
        placeholder="Province/State"
      />
    </div>
  );
};