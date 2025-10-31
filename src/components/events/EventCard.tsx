import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, DollarSign, Building2, Laptop, Clapperboard } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  event: {
    id: string;
    event_id: string;
    title: string;
    club_name?: string;
    faculty_coordinator: string;
    student_coordinator: string;
    description: string | null;
    event_date: string;
    start_time: string;
    end_time: string;
    category: string;
    max_participants: number | null;
    entry_fees: number;
    status: string;
    venue_id?: number | null;
    clubs?: { name: string } | null;
    classrooms?: { room_number: string; building: string } | null;
  };
  onEdit?: () => void;
  onViewDetails?: () => void;
  onDelete?: () => void;
}

const EventCard = ({ event, onEdit, onViewDetails, onDelete }: EventCardProps) => {
  const statusColors = {
    proposed: "bg-warning text-warning-foreground",
    faculty_approved: "bg-blue-500 text-white",
    hod_approved: "bg-success text-success-foreground",
    rejected: "bg-destructive text-destructive-foreground",
  };

  const statusLabels = {
    proposed: "Pending",
    faculty_approved: "Faculty Approved",
    hod_approved: "HoD Approved",
    rejected: "Rejected",
  };

  // Safe date formatting function
  const formatEventDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "Date TBD";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      console.error("Date formatting error:", error, "Input:", dateString);
      return "Date Error";
    }
  };

  // Convert 24-hour time to 12-hour format with AM/PM
  const formatTime12Hour = (timeString: string): string => {
    if (!timeString) return "Time TBD";
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const minute = parseInt(minutes);
      
      if (isNaN(hour24) || isNaN(minute)) return timeString;
      
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      
      return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      console.error("Time formatting error:", error, "Input:", timeString);
      return timeString;
    }
  };

  // Format entry fees - show "FREE" if zero or blank
  const formatEntryFees = (fees: number | null | undefined): string => {
    if (fees === null || fees === undefined || fees === 0) {
      return "FREE";
    }
    return `₹${fees}`;
  };

  // Get venue display text
  const getVenueDisplay = (): string => {
    if (event.classrooms) {
      return `${event.classrooms.room_number}, ${event.classrooms.building}`;
    }
    if (event.venue_id) {
      return `Venue ID: ${event.venue_id}`;
    }
    return "Venue TBD";
  };

  // Get category icon
  const getCategoryIcon = () => {
    return event.category === "Tech" ? <Laptop className="h-4 w-4" /> : <Clapperboard className="h-4 w-4" />;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col border-0 rounded-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-h-[116px]">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">ID</span>
              <Badge variant="secondary">{event.event_id}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Organized by {event.club_name || event.clubs?.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Faculty: {event.faculty_coordinator} | Student: {event.student_coordinator}
            </p>
          </div>
          <Badge className={statusColors[event.status as keyof typeof statusColors]}>
            {statusLabels[event.status as keyof typeof statusLabels]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex flex-col flex-1">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{formatEventDate(event.event_date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="truncate text-xs">{formatTime12Hour(event.start_time)} - {formatTime12Hour(event.end_time)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{getVenueDisplay()}</span>
          </div>

          {event.max_participants && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">Max: {event.max_participants}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{formatEntryFees(event.entry_fees)}</span>
          </div>

          <div className="flex items-center gap-2">
            {getCategoryIcon()}
            <Badge variant="outline">{event.category}</Badge>
          </div>
        </div>

        <div className="flex gap-2 pt-2 mt-auto">
          {onViewDetails && (
            <Button onClick={onViewDetails} variant="outline" size="sm" className="flex-1">
              View Details
            </Button>
          )}
          {onEdit && (
            <Button onClick={onEdit} size="sm" className="flex-1">
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              onClick={onDelete} 
              variant="outline" 
              size="sm" 
              className="flex-1 transition-colors hover:bg-destructive hover:text-destructive-foreground border-transparent"
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
