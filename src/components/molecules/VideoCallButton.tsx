import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Video } from "lucide-react";
import React, { useState } from "react";

interface VideoCallButtonProps {
  recipientName: string;
  onCallInitiated?: (meetLink: string) => void;
  className?: string;
}

export const VideoCallButton: React.FC<VideoCallButtonProps> = ({ recipientName, onCallInitiated, className = "" }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLink, setShowLink] = useState(false);

  // Create a Google Calendar event with Google Meet integration
  const createGoogleCalendarMeeting = () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 60000); // Start in 2 minutes
    const endTime = new Date(startTime.getTime() + 60 * 60000); // 1 hour duration

    const eventDetails = {
      title: `Video Call with ${recipientName}`,
      start: startTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      end: endTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      description: `Video call meeting with ${recipientName}`,
    };

    // Create Google Calendar URL with Meet integration
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.start}/${
      eventDetails.end
    }&details=${encodeURIComponent(eventDetails.description)}&add=${encodeURIComponent("meet.google.com")}`;

    return calendarUrl;
  };

  // Alternative: Direct Google Meet new meeting
  const createInstantMeeting = () => {
    // This opens Google Meet's "new meeting" page
    return "https://meet.google.com/new";
  };

  const handleStartCall = async () => {
    setIsGenerating(true);

    try {
      // Use instant meeting approach
      const meetUrl = createInstantMeeting();

      // Open Google Meet new meeting page
      window.open(meetUrl, "_blank", "width=1200,height=800");

      // Show instructions to user
      setShowLink(true);

      // Notify parent component with a generic message
      const callMessage = `📹 Video call initiated with ${recipientName}. Please share the meeting link once created.`;
      onCallInitiated?.(callMessage);
    } catch (error) {
      console.error("Error starting video call:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Alternative method using Google Calendar
  const handleScheduleCall = () => {
    const calendarUrl = createGoogleCalendarMeeting();
    window.open(calendarUrl, "_blank");

    const scheduleMessage = `📅 Video call scheduled with ${recipientName}. Please check your Google Calendar for the meeting details.`;
    onCallInitiated?.(scheduleMessage);
  };

  if (showLink) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Video call with {recipientName}</span>
          </div>

          <div className="bg-white border rounded p-3 mb-3">
            <p className="text-sm text-gray-700 mb-2">📹 Google Meet window opened!</p>
            <p className="text-xs text-gray-600">
              1. Create your meeting in the opened window
              <br />
              2. Copy the meeting link
              <br />
              3. Share it with {recipientName}
            </p>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => window.open("https://meet.google.com/new", "_blank")} className="flex items-center gap-1 text-xs">
              <ExternalLink className="h-3 w-3" />
              Open Meet
            </Button>
            <Button variant="outline" size="sm" onClick={handleScheduleCall} className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              Schedule
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowLink(false)} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-1 ${className}`}>
      <Button variant="outline" size="sm" onClick={handleStartCall} disabled={isGenerating} className="flex items-center gap-1" title={`Start instant video call with ${recipientName}`}>
        <Video className="h-4 w-4" />
        <span className="hidden sm:inline">{isGenerating ? "Starting..." : "Meet Now"}</span>
      </Button>

      <Button variant="ghost" size="sm" onClick={handleScheduleCall} className="flex items-center gap-1" title={`Schedule video call with ${recipientName}`}>
        <Calendar className="h-4 w-4" />
        <span className="hidden md:inline">Schedule</span>
      </Button>
    </div>
  );
};
