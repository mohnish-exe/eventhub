import { useState, useEffect } from "react";
import { OracleServices } from "@/integrations/oracle/services";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import CreateEventDialog from "@/components/events/CreateEventDialog";
import { toast } from "sonner";
import { GlowingCards, GlowingCard } from "@/components/ui/glowing-cards";

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, categoryFilter, statusFilter]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventsData = await OracleServices.Events.getAll();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setLoading(false);
  };

  const filterEvents = () => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.club_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.event_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((event) => event.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      await OracleServices.Events.delete(parseInt(eventId));
      toast.success("Event deleted successfully");
      loadEvents(); // Reload events to reflect the deletion
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Centered Page Header */}
      <div className="text-center space-y-3 py-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Events</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage and browse all college events, from tech workshops to cultural festivals
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <CreateEventDialog onEventCreated={loadEvents} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Tech">Tech</SelectItem>
            <SelectItem value="Non-Tech">Non-Tech</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="proposed">Pending</SelectItem>
            <SelectItem value="faculty_approved">Faculty Approved</SelectItem>
            <SelectItem value="hod_approved">HoD Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found</p>
        </div>
      ) : (
        <GlowingCards 
          enableGlow={true}
          glowRadius={20}
          glowOpacity={1}
          gap="2rem"
          maxWidth="100%"
          padding="0"
          responsive={false}
        >
          <div className="grid grid-cols-4 gap-8">
            {filteredEvents.map((event) => (
              <GlowingCard 
                key={event.id}
                glowColor="#3B83F6"
                className="w-full"
              >
                <EventCard 
                  event={event} 
                  onDelete={() => handleDeleteEvent(event.id)}
                />
              </GlowingCard>
            ))}
          </div>
        </GlowingCards>
      )}
    </div>
  );
};

export default Events;
