import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/atoms";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSchedules } from "@/hooks";
import { HttpClient } from "@/services/api.config";
import type { Schedule } from "@/services";

interface RequestAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RequestAppointmentData) => Promise<void>;
  loading?: boolean;
}

interface RequestAppointmentData {
  counselorId: string;
  scheduleId?: string; // Optional - counselor can assign schedule later
  title: string;
  description: string;
  appointmentType: string;
  requestedDate: string;
  priority: string;
  preferredLocation: string;
  duration: number;
}

const appointmentTypes = [
  { value: "consultation", label: "General Consultation" },
  { value: "counseling", label: "Personal Counseling" },
  { value: "academic_guidance", label: "Academic Guidance" },
  { value: "personal_guidance", label: "Personal Guidance" },
  { value: "crisis_intervention", label: "Crisis Intervention" },
  { value: "follow_up", label: "Follow-up Session" },
];

const priorities = [
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const durations = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

export const RequestAppointmentModal: React.FC<RequestAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { schedules, fetchSchedules } = useSchedules();
  const [counselors, setCounselors] = useState<any[]>([]);
  const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
  const hasFetchedSchedules = useRef(false);

  const [formData, setFormData] = useState<RequestAppointmentData>({
    counselorId: "",
    scheduleId: "",
    title: "",
    description: "",
    appointmentType: "consultation",
    requestedDate: "",
    priority: "normal",
    preferredLocation: "",
    duration: 60,
  });

  // Load guidance counselors only once when modal first opens
  useEffect(() => {
    const loadCounselors = async () => {
      // Only fetch if we don't have counselors yet or modal is opening
      if (counselors.length === 0) {
        try {
          console.log("Fetching counselors from /user?type=guidance");

          // Fetch all guidance counselors using authenticated HttpClient
          const data = await HttpClient.get<{ users: any[] }>("/user?type=guidance");

          console.log("Counselors data:", data);
          setCounselors(data.users || []);
        } catch (error) {
          console.error("Failed to load counselors:", error);
        }
      }
    };

    if (isOpen) {
      loadCounselors();
    }
  }, [isOpen, counselors.length]);

  // Load schedules when modal opens (separate effect to avoid coupling)
  useEffect(() => {
    if (isOpen && !hasFetchedSchedules.current) {
      fetchSchedules();
      hasFetchedSchedules.current = true;
    }

    // Reset the ref when modal closes
    if (!isOpen) {
      hasFetchedSchedules.current = false;
    }
  }, [isOpen, fetchSchedules]);

  // Filter schedules based on selected counselor
  useEffect(() => {
    if (formData.counselorId && schedules) {
      const filteredSchedules = schedules.filter(
        (schedule) =>
          schedule.counselorId === formData.counselorId &&
          schedule.status === "available" &&
          new Date(schedule.startTime) > new Date()
      );
      setAvailableSchedules(filteredSchedules);
    } else {
      setAvailableSchedules([]);
    }
  }, [formData.counselorId, schedules]);

  const handleInputChange = (field: keyof RequestAppointmentData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If counselor changes, reset schedule selection
    if (field === "counselorId") {
      setFormData((prev) => ({
        ...prev,
        scheduleId: "",
        requestedDate: "",
      }));
    }

    // If schedule changes, auto-fill requested date
    if (field === "scheduleId" && value) {
      const selectedSchedule = availableSchedules.find((s) => s.id === value);
      if (selectedSchedule) {
        setFormData((prev) => ({
          ...prev,
          requestedDate: new Date(selectedSchedule.startTime).toISOString().slice(0, 16),
          preferredLocation: selectedSchedule.location || "",
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.counselorId || !formData.title || !formData.requestedDate) {
      console.error("Missing required fields:", {
        counselorId: formData.counselorId,
        title: formData.title,
        requestedDate: formData.requestedDate,
        scheduleId: formData.scheduleId,
      });
      alert("Please fill in all required fields.");
      return;
    }

    // Schedule selection is now optional - counselor can assign later

    try {
      // Prepare data with proper formatting
      const appointmentData = {
        ...formData,
        // Include scheduleId only if selected
        ...(formData.scheduleId && { scheduleId: formData.scheduleId }),
        // Ensure requestedDate is in proper ISO format
        requestedDate: new Date(formData.requestedDate).toISOString(),
        // Map preferredLocation to location field expected by backend
        location: formData.preferredLocation,
      };

      console.log("Submitting appointment data:", appointmentData);
      await onSubmit(appointmentData);
      handleClose();
    } catch (error) {
      console.error("Failed to submit appointment request:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      counselorId: "",
      scheduleId: "",
      title: "",
      description: "",
      appointmentType: "consultation",
      requestedDate: "",
      priority: "normal",
      preferredLocation: "",
      duration: 60,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Appointment">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Counselor Selection */}
        <div className="space-y-1">
          <Label className="text-sm font-medium text-gray-700">Select Counselor *</Label>
          <select
            value={formData.counselorId}
            onChange={(e) => handleInputChange("counselorId", e.target.value)}
            required
            className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-md focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
          >
            <option value="">Choose a guidance counselor...</option>
            {counselors.map((counselor) => (
              <option key={counselor.id} value={counselor.id}>
                {counselor.person?.firstName} {counselor.person?.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule Selection (Optional) */}
        {availableSchedules.length > 0 && (
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Available Schedule (Optional)
            </Label>
            <select
              value={formData.scheduleId || ""}
              onChange={(e) => handleInputChange("scheduleId", e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-md focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
            >
              <option value="">Select a schedule or let counselor assign later...</option>
              {availableSchedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.title} - {new Date(schedule.startTime).toLocaleString()}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Optionally select a specific schedule, or leave blank and the counselor will assign an
              appropriate time slot for you.
            </p>
          </div>
        )}

        {/* Appointment Title */}
        <div className="space-y-1">
          <Label className="text-sm font-medium text-gray-700">Appointment Title *</Label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="e.g., Academic Guidance Session"
            required
            className="h-10"
          />
        </div>

        {/* Appointment Type */}
        <div className="space-y-1">
          <Label className="text-sm font-medium text-gray-700">Type of Consultation *</Label>
          <select
            value={formData.appointmentType}
            onChange={(e) => handleInputChange("appointmentType", e.target.value)}
            required
            className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-md focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
          >
            {appointmentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label className="text-sm font-medium text-gray-700">Description</Label>
          <textarea
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleInputChange("description", e.target.value)
            }
            placeholder="Please describe what you'd like to discuss or any specific concerns you have..."
            rows={4}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:border-primary-400 focus:ring-1 focus:ring-primary-400 resize-none"
          />
          <p className="text-xs text-gray-500">
            Providing details helps the counselor prepare for your session
          </p>
        </div>

        {/* Requested Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.requestedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.requestedDate ? (
                    format(new Date(formData.requestedDate), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.requestedDate ? new Date(formData.requestedDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const currentTime = formData.requestedDate.slice(11, 16) || "09:00";
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const day = String(date.getDate()).padStart(2, "0");
                      handleInputChange("requestedDate", `${year}-${month}-${day}T${currentTime}`);
                    }
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time <span className="text-red-500">*</span>
            </Label>
            <input
              type="time"
              value={formData.requestedDate.slice(11, 16) || "09:00"}
              onChange={(e) => {
                const currentDate =
                  formData.requestedDate.slice(0, 10) || new Date().toISOString().slice(0, 10);
                handleInputChange("requestedDate", `${currentDate}T${e.target.value}`);
              }}
              min="08:00"
              max="20:00"
              step="900"
              disabled={loading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Priority</Label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-md focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Duration</Label>
            <select
              value={formData.duration}
              onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
              className="w-full h-10 px-3 text-sm bg-white border border-gray-200 rounded-md focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
            >
              {durations.map((duration) => (
                <option key={duration.value} value={duration.value}>
                  {duration.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preferred Location */}
        <div className="space-y-1">
          <Label className="text-sm font-medium text-gray-700">Preferred Location</Label>
          <Input
            type="text"
            value={formData.preferredLocation}
            onChange={(e) => handleInputChange("preferredLocation", e.target.value)}
            placeholder="e.g., Guidance Office, Online Meeting, etc."
            className="h-10"
          />
          <p className="text-xs text-gray-500">
            Leave blank to use the counselor's default location
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              loading || !formData.counselorId || !formData.title || !formData.requestedDate
            }
          >
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
