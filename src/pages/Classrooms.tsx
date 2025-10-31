import { useState, useEffect } from "react";
import { OracleServices } from "@/integrations/oracle/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { GlowingCards, GlowingCard } from "@/components/ui/glowing-cards";

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classroomsData, bookingsData] = await Promise.all([
        OracleServices.Classrooms.getAll(),
        selectedDate ? OracleServices.ClassroomBookings.getByDate(selectedDate) : Promise.resolve([])
      ]);
      
      setClassrooms(classroomsData);
      // Only filter bookings when a date is chosen
      if (selectedDate) {
        setBookings(bookingsData);
        if (bookingsData.length === 0) {
          toast.message('No classrooms booked and no events happening on this day.');
        }
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const getClassroomBookings = (classroomId: number) => {
    return bookings.filter((b) => Number(b.classroom_id) === Number(classroomId));
  };

  const isClassroomAvailable = (classroomId: string) => {
    const classroomBookings = getClassroomBookings(classroomId);
    return classroomBookings.length === 0 || 
           classroomBookings.every(b => b.status === 'rejected');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading classrooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Centered Page Header */}
      <div className="text-center space-y-3 py-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Classrooms</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage classroom bookings and check real-time availability across campus
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <AddClassroomDialog onClassroomAdded={loadData} />
      </div>

      <div className="flex items-center gap-4">
        <Label htmlFor="date-filter">View bookings for:</Label>
        <Input
          id="date-filter"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder="Select a date"
          className="w-auto"
        />
        <Button variant="outline" onClick={() => setSelectedDate("")}>Clear</Button>
      </div>

      {(() => {
        const classroomsToShow = selectedDate
          ? classrooms.filter(c => getClassroomBookings(c.id).length > 0)
          : classrooms;
        return (
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
        {classroomsToShow.map((classroom) => {
          const classroomBookings = getClassroomBookings(classroom.id);

          return (
            <GlowingCard 
              key={classroom.id}
              glowColor="#3B83F6"
              className="w-full"
            >
              <Card className="h-full hover:shadow-lg transition-shadow border-0 rounded-2xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle>{`${classroom.building}-${classroom.room_number}`}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {classroom.capacity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Facilities:</span>
                    <span className="font-medium">{classroom.facilities || '-'}</span>
                  </div>
                </div>

                {selectedDate && classroomBookings.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-sm font-medium">Bookings on {format(new Date(selectedDate), "MMM dd")}:</p>
                    {classroomBookings.map((booking) => (
                      <div key={booking.id} className="text-sm p-3 bg-muted/50 rounded space-y-2">
                        <p className="font-medium">{`${classroom.building}-${classroom.room_number}`}</p>
                        <div className="space-y-1">
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Capacity:</span>
                            <span>{classroom.capacity}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span>{booking.events?.start_time || booking.start_time} - {booking.events?.end_time || booking.end_time}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-muted-foreground">Booked by:</span>
                            <span>{booking.events?.club_name || '—'}</span>
                          </p>
                        </div>
                        <Button variant="outline" className="w-full transition-colors hover:bg-destructive hover:text-destructive-foreground" onClick={async ()=>{
                          if (!window.confirm('Are you sure you want to delete this booking? This will also delete the associated event. This action cannot be undone.')) return;
                          const ok = await OracleServices.ClassroomBookings.delete(booking.id);
                          if (ok) { toast.success('Booking and event deleted'); loadData(); } else { toast.error('Delete failed'); }
                        }}>Delete Booking</Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Button variant="outline" className="w-full transition-colors hover:bg-destructive hover:text-destructive-foreground" onClick={async ()=>{
                    if (!window.confirm('Are you sure you want to delete this classroom? This action cannot be undone.')) return;
                    const ok = await OracleServices.Classrooms.delete(classroom.id);
                    if (ok) { toast.success('Classroom deleted'); loadData(); } else { toast.error('Delete failed'); }
                  }}>Delete Classroom</Button>
                </div>
              </CardContent>
              </Card>
            </GlowingCard>
          );
        })}
        </div>
      </GlowingCards>
        );
      })()}
    </div>
  );
};

const AddClassroomDialog = ({ onClassroomAdded }: { onClassroomAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const classroomData = {
      room_number: formData.get("room_number") as string,
      building: formData.get("building") as string,
      capacity: parseInt(formData.get("capacity") as string),
      facilities: formData.get("facilities") as string,
    };

    try {
      await OracleServices.Classrooms.create(classroomData);
      toast.success("Classroom added successfully!");
      setOpen(false);
      onClassroomAdded();
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast.error("Failed to add classroom. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Classroom
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Classroom</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room_number">Room Number *</Label>
            <Input id="room_number" name="room_number" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="building">Building *</Label>
            <Input id="building" name="building" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity *</Label>
            <Input id="capacity" name="capacity" type="number" min="1" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facilities">Facilities *</Label>
            <Input id="facilities" name="facilities" placeholder="Projector, AC, etc." required />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Classroom"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const BookClassroomDialog = ({ 
  classroom, 
  selectedDate,
  onBookingCreated 
}: { 
  classroom: any; 
  selectedDate: string;
  onBookingCreated: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadEvents();
    }
  }, [open]);

  const loadEvents = async () => {
    try {
      const eventsData = await OracleServices.Events.getAll();
      // Filter events for selected date
      const filteredEvents = eventsData.filter(event => 
        event.event_date === selectedDate
      );
      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const bookingData = {
      classroom_id: classroom.id,
      event_id: formData.get("event_id") ? parseInt(formData.get("event_id") as string) : undefined,
      booking_date: selectedDate,
      start_time: formData.get("start_time") as string,
      end_time: formData.get("end_time") as string,
      booked_by: 1, // Demo user ID
      status: "pending" as const,
    };

    try {
      await OracleServices.ClassroomBookings.create(bookingData);
      toast.success("Booking created successfully!");
      setOpen(false);
      onBookingCreated();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Book Classroom
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {classroom.room_number}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input value={format(new Date(selectedDate), "PPP")} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_id">Link to Event (Optional)</Label>
            <select
              id="event_id"
              name="event_id"
              className="w-full p-2 border rounded"
            >
              <option value="">No event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} ({event.event_id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input id="start_time" name="start_time" type="time" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input id="end_time" name="end_time" type="time" required />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Booking..." : "Book Classroom"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Classrooms;
