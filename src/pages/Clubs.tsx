import { useState, useEffect } from "react";
import { OracleServices } from "@/integrations/oracle/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Users as UsersIcon, ArrowLeft } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import { GlowingCards, GlowingCard } from "@/components/ui/glowing-cards";

const Clubs = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<any | null>(null);
  const [clubEvents, setClubEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    setLoading(true);
    try {
      const clubsData = await OracleServices.Clubs.getAll();
      setClubs(clubsData);
    } catch (error) {
      console.error("Error loading clubs:", error);
      toast.error("Failed to load clubs");
    }
    setLoading(false);
  };

  const loadClubEvents = async (clubId: number, clubName: string) => {
    setLoadingEvents(true);
    setSelectedClub({ id: clubId, name: clubName });
    try {
      const allEvents = await OracleServices.Events.getAll();
      // Filter events by club_id
      const filtered = allEvents.filter((event: any) => event.club_id === clubId);
      setClubEvents(filtered);
    } catch (error) {
      console.error("Error loading club events:", error);
      toast.error("Failed to load club events");
    }
    setLoadingEvents(false);
  };

  const handleDeleteClub = async (clubId: number, clubName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${clubName}"? This action cannot be undone.`)) return;
    try {
      const result = await OracleServices.Clubs.delete(clubId);
      if (result) {
        toast.success("Club deleted successfully");
        loadClubs(); // Reload the clubs list to reflect deletion
      } else {
        toast.error("Failed to delete club");
      }
    } catch (error) {
      console.error("Error deleting club:", error);
      toast.error("Failed to delete club");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      await OracleServices.Events.delete(parseInt(eventId));
      toast.success("Event deleted successfully");
      // Reload club events
      if (selectedClub) {
        loadClubEvents(selectedClub.id, selectedClub.name);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleBackToClubs = () => {
    setSelectedClub(null);
    setClubEvents([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading clubs...</p>
      </div>
    );
  }

  // Show club events sub-page
  if (selectedClub) {
    return (
      <div className="space-y-8">
        {/* Header and Back Button */}
        <div className="space-y-6">
          <div className="text-center space-y-3 py-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Events by {selectedClub.name}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse all events organized by {selectedClub.name}
            </p>
          </div>

          <div className="px-6 lg:px-12">
            <Button
              variant="expandIcon"
              Icon={() => <ArrowLeft className="h-4 w-4" />}
              iconPlacement="left"
              onClick={handleBackToClubs}
            >
              View Clubs
            </Button>
          </div>
        </div>

        {loadingEvents ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : clubEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events found for this club</p>
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
            {clubEvents.map((event) => (
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
  }

  // Show clubs list
  return (
    <div className="space-y-8">
      {/* Centered Page Header */}
      <div className="text-center space-y-3 py-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Clubs</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover and manage college clubs, student organizations, and communities
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <AddClubDialog onClubAdded={loadClubs} />
      </div>

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
        {clubs.map((club) => (
          <GlowingCard 
            key={club.id}
            glowColor="#3B83F6"
            className="w-full"
          >
            <Card className="h-full hover:shadow-lg transition-shadow border-0 rounded-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-primary" />
                  <CardTitle>{club.name}</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {club.description && (
                <p className="text-sm text-muted-foreground">{club.description}</p>
              )}

              <div className="space-y-2 text-sm">
                {club.coordinator_email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinator:</span>
                    <span className="font-medium">{club.coordinator_email}</span>
                  </div>
                )}
                {club.coordinator_contact && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-medium">{club.coordinator_contact}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => loadClubEvents(club.id, club.name)}
                >
                  View Events
                </Button>

                <Button
                  variant="outline"
                  className="w-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => handleDeleteClub(club.id, club.name)}
                >
                  Delete Club
                </Button>
              </div>
            </CardContent>
            </Card>
          </GlowingCard>
        ))}
        </div>
      </GlowingCards>

      {clubs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No clubs found. Add your first club!</p>
        </div>
      )}
    </div>
  );
};

const AddClubDialog = ({ onClubAdded }: { onClubAdded: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const clubData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      coordinator_email: formData.get("coordinator_email") as string,
      coordinator_contact: formData.get("coordinator_contact") as string,
    };

    try {
      await OracleServices.Clubs.create(clubData);
      toast.success("Club added successfully!");
      setOpen(false);
      onClubAdded();
    } catch (error) {
      console.error('Error creating club:', error);
      toast.error("Failed to add club. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Club
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Club</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Club Name *</Label>
            <Input id="name" name="name" required placeholder="Enter club name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea 
              id="description" 
              name="description" 
              rows={3} 
              required 
              placeholder="Describe the club's purpose and activities"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coordinator_email">Coordinator Email *</Label>
            <Input 
              id="coordinator_email" 
              name="coordinator_email" 
              type="email" 
              required 
              placeholder="coordinator@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coordinator_contact">Coordinator Contact *</Label>
            <Input 
              id="coordinator_contact" 
              name="coordinator_contact" 
              type="tel" 
              required 
              placeholder="Phone number"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Club"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Clubs;
