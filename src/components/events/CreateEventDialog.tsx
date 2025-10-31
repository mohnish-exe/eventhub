import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OracleServices } from "@/integrations/oracle/services";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreateEventDialogProps {
  onEventCreated?: () => void;
}

const CreateEventDialog = ({ onEventCreated }: CreateEventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loadingClubs, setLoadingClubs] = useState<boolean>(false);
  const [eventId, setEventId] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [loadingClassrooms, setLoadingClassrooms] = useState<boolean>(false);
  const [noVenuesMessage, setNoVenuesMessage] = useState<string>("");
  const [selectedVenueCapacity, setSelectedVenueCapacity] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      loadClassrooms();
      loadClubs();
      generateEventId();
    }
  }, [open]);

  const generateEventId = () => {
    const timestamp = Date.now().toString().slice(-6);
    setEventId(`EVT${timestamp}`);
  };

  const loadClubs = async () => {
    setLoadingClubs(true);
    try {
      const clubsData = await OracleServices.Clubs.getAll();
      setClubs(clubsData);
    } catch (error) {
      console.error('Error loading clubs:', error);
      toast.error('Failed to load clubs');
      setClubs([]);
    } finally {
      setLoadingClubs(false);
    }
  };

  const loadClassrooms = async () => {
    if (!eventDate || !startTime || !endTime) {
      setClassrooms([]);
      setNoVenuesMessage("");
      return;
    }

    setLoadingClassrooms(true);
    setNoVenuesMessage("");
    
    try {
      const availableClassrooms = await OracleServices.Classrooms.getAvailable(
        eventDate,
        startTime,
        endTime
      );
      
      setClassrooms(availableClassrooms);
      
      if (availableClassrooms.length === 0) {
        setNoVenuesMessage("No venues available for the selected date and time. Please choose a different date or time.");
      }
    } catch (error) {
      console.error('Error loading classrooms:', error);
      toast.error('Failed to load available classrooms');
      setClassrooms([]);
      setNoVenuesMessage("Error loading venues. Please try again.");
    } finally {
      setLoadingClassrooms(false);
    }
  };

  // Reload classrooms when date/time changes
  useEffect(() => {
    if (eventDate && startTime && endTime) {
      loadClassrooms();
    }
  }, [eventDate, startTime, endTime]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Client-side validations
    const maxParticipantsVal = parseInt((formData.get("max_participants") as string) || "0", 10);
    const venueIdRaw = formData.get("venue_id") as string | null;
    const selectedVenue = venueIdRaw ? classrooms.find(c => c.id === Number(venueIdRaw)) : null;
    const capacityVal = selectedVenue ? Number(selectedVenue.capacity) : null;

    if (Number.isNaN(maxParticipantsVal) || maxParticipantsVal <= 0) {
      toast.error("Max participants must be greater than 0.");
      setLoading(false);
      return;
    }

    if (capacityVal !== null && maxParticipantsVal > capacityVal) {
      toast.error(`Max participants cannot exceed venue capacity (${capacityVal}).`);
      setLoading(false);
      return;
    }

    const clubIdRaw = formData.get("club_id") as string | null;
    
    const eventData = {
      event_id: eventId,
      title: formData.get("title") as string,
      club_id: clubIdRaw ? parseInt(clubIdRaw) : null,
      faculty_coordinator: formData.get("faculty_coordinator") as string,
      student_coordinator: formData.get("student_coordinator") as string,
      description: formData.get("description") as string,
      event_date: formData.get("event_date") as string,
      start_time: formData.get("start_time") as string,
      end_time: formData.get("end_time") as string,
      venue_id: venueIdRaw ? parseInt(venueIdRaw) : null,
      category: formData.get("category") as "Tech" | "Non-Tech",
      max_participants: maxParticipantsVal,
      entry_fees: parseFloat(formData.get("entry_fees") as string) || 0,
      status: "proposed" as const,
      created_by: 1, // Default user ID for demo
    };

    try {
      await OracleServices.Events.create(eventData);
      toast.success("Event request submitted successfully! Awaiting approval.");
      setOpen(false);
      onEventCreated?.();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_id">Event ID *</Label>
              <Input 
                id="event_id" 
                name="event_id" 
                value={eventId}
                readOnly
                placeholder="Auto-generated"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input id="title" name="title" placeholder="Tech Workshop" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="club_id">Club *</Label>
              <Select name="club_id" required disabled={loadingClubs || clubs.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingClubs 
                      ? "Loading clubs..." 
                      : clubs.length === 0 
                        ? "No clubs available" 
                        : "Select a club"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id.toString()}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faculty_coordinator">Faculty Coordinator *</Label>
              <Input id="faculty_coordinator" name="faculty_coordinator" placeholder="Dr. Smith" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="student_coordinator">Student Coordinator *</Label>
              <Input id="student_coordinator" name="student_coordinator" placeholder="John Doe" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tech">Tech</SelectItem>
                  <SelectItem value="Non-Tech">Non-Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea id="description" name="description" rows={3} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Date *</Label>
              <Input 
                id="event_date" 
                name="event_date" 
                type="date" 
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input 
                id="start_time" 
                name="start_time" 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input 
                id="end_time" 
                name="end_time" 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_id">Venue *</Label>
              <Select name="venue_id" required disabled={loadingClassrooms || classrooms.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingClassrooms 
                      ? "Loading available venues..." 
                      : classrooms.length === 0 
                        ? "No venues available" 
                        : "Select available classroom"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id.toString()}>
                      {classroom.room_number} - {classroom.building} (Capacity: {classroom.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {noVenuesMessage && (
                <p className="text-sm text-red-600 mt-1">{noVenuesMessage}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_fees">Entry Fees (₹)</Label>
              <Input id="entry_fees" name="entry_fees" type="number" min="0" step="0.01" defaultValue="0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_participants">Max Participants *</Label>
              <Input id="max_participants" name="max_participants" type="number" min="1" required />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Request for Approval"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;
