import { useState, useEffect } from "react";
import { supabase } from "@/integrations/oracle";
import { AnimatedGroup } from "@/components/ui/animated-group";
import EventHubFooter from "@/components/ui/eventhub-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Building2, BarChart3, TrendingUp, Clock, MapPin, Sparkles, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OracleServices } from "@/integrations/oracle/services";
import { format } from "date-fns";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState("Good Morning");
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeClubs: 0,
    totalClassrooms: 0,
    availableClassrooms: 0,
    upcomingEvents: [] as any[],
    recentActivity: [] as any[],
    techEvents: 0,
    nonTechEvents: 0,
    thisWeekEvents: 0,
    totalBookings: 0,
    topClubs: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when component mounts (when user logs in)
    window.scrollTo(0, 0);

    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [events, clubs, classrooms, bookings] = await Promise.all([
        OracleServices.Events.getAll(),
        OracleServices.Clubs.getAll(),
        OracleServices.Classrooms.getAll(),
        OracleServices.ClassroomBookings.getAll(),
      ]);

      const today = new Date().toISOString().split("T")[0];
      const upcomingEvents = events
        .filter((e: any) => {
          const eventDate = new Date(e.event_date).toISOString().split("T")[0];
          return eventDate >= today;
        })
        .sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
        .slice(0, 3);

      // Get recent activity (last 5 events)
      const recentEvents = events
        .sort((a: any, b: any) => new Date(b.created_at || b.event_date).getTime() - new Date(a.created_at || a.event_date).getTime())
        .slice(0, 5);

      // Calculate available classrooms
      const bookedClassroomIds = new Set(bookings.map((b: any) => b.classroom_id));
      const availableCount = classrooms.filter((c: any) => !bookedClassroomIds.has(c.id)).length;

      // Calculate tech vs non-tech events
      const techEvents = events.filter((e: any) => e.category === 'Tech').length;
      const nonTechEvents = events.filter((e: any) => e.category === 'Non-Tech').length;

      // Calculate this week's events
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      const thisWeekEvents = events.filter((e: any) => {
        const eventDate = new Date(e.event_date);
        return eventDate >= new Date() && eventDate <= oneWeekFromNow;
      }).length;

      // Get top clubs (clubs with most events)
      const clubEventCounts = events.reduce((acc: any, event: any) => {
        if (event.club_id) {
          acc[event.club_id] = (acc[event.club_id] || 0) + 1;
        }
        return acc;
      }, {});

      const topClubs = clubs
        .map((club: any) => ({
          ...club,
          eventCount: clubEventCounts[club.id] || 0
        }))
        .filter((club: any) => club.eventCount > 0)
        .sort((a: any, b: any) => b.eventCount - a.eventCount)
        .slice(0, 5);

      setStats({
        totalEvents: events.length,
        activeClubs: clubs.length,
        totalClassrooms: classrooms.length,
        availableClassrooms: availableCount,
        upcomingEvents,
        recentActivity: recentEvents,
        techEvents,
        nonTechEvents,
        thisWeekEvents,
        totalBookings: bookings.length,
        topClubs,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setLoading(false);
  };

  // Separate useEffect for scroll-triggered animation
  useEffect(() => {
    let hasScrolled = false;
    
    const handleScroll = () => {
      const dashboardElement = document.getElementById('dashboard-stats');
      if (!dashboardElement || hasScrolled) return;
      
      const rect = dashboardElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Trigger animation when dashboard section is 30% into view
      if (rect.top < windowHeight * 0.7) {
        console.log('Dashboard animation triggered!');
        setIsVisible(true);
        hasScrolled = true;
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Also check on mount in case user scrolls very fast
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "Mohnish"; // Default name as requested
  };

  // Check if name is long (more than 12 characters means it should wrap)
  const isLongName = () => {
    const name = getUserName();
    return name.length > 12;
  };

  return (
    <>
      {/* Hero Section - Full viewport height */}
         <div className="relative h-screen flex items-center justify-center px-4">
         <style>{`
           @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
           
           * {
             font-family: 'Poppins', sans-serif;
           }
           
           @keyframes fadeInUp {
             from {
               opacity: 0;
               transform: translateY(30px);
             }
             to {
               opacity: 1;
               transform: translateY(0);
             }
           }
           
           @keyframes fadeIn {
             from {
               opacity: 0;
             }
             to {
               opacity: 1;
             }
           }
         `}</style>

         {/* Dark Blue Glow Effect with more intensity in center */}
         <div className="absolute inset-0 bg-black">
           {/* Main dark blue radial glow with higher center intensity */}
           <div 
             className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-0"
             style={{
               width: '1000px',
               height: '400px',
               background: 'radial-gradient(ellipse at center bottom, rgba(30, 58, 138, 0.4) 0%, rgba(30, 58, 138, 0.25) 15%, rgba(30, 58, 138, 0.15) 30%, rgba(30, 58, 138, 0.08) 50%, transparent 75%)'
             }}
           />
           {/* Additional dark blue layer for depth with more intensity */}
           <div 
             className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-0"
             style={{
               width: '800px',
               height: '250px',
               background: 'radial-gradient(ellipse at center bottom, rgba(30, 58, 138, 0.5) 0%, rgba(30, 58, 138, 0.3) 20%, rgba(30, 58, 138, 0.15) 40%, transparent 70%)',
               filter: 'blur(30px)'
             }}
           />
         </div>
         
         <div className="relative z-10 text-center max-w-4xl mx-auto">
           {/* Hero Content */}
           <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.2,
                  },
                },
              },
              item: {
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    type: 'spring',
                    bounce: 0.3,
                    duration: 0.8,
                  },
                },
              },
            }}
            className="w-full"
          >
           {isLongName() ? (
             // For long names: show greeting and name on separate lines
             <div className="text-center mb-6 px-4">
               <h1 
                 className="text-5xl md:text-6xl lg:text-7xl font-bold animate-fade-in-up"
                 style={{
                   color: '#FFFFFF',
                   letterSpacing: '-0.02em',
                   lineHeight: '1.2',
                   fontFamily: 'Poppins, sans-serif',
                   animation: 'fadeInUp 1s ease-out forwards',
                   opacity: 0
                 }}
               >
                 {greeting},
               </h1>
               <h1 
                 className="text-5xl md:text-6xl lg:text-7xl font-bold"
                 style={{
                   color: '#FFFFFF',
                   letterSpacing: '-0.02em',
                   lineHeight: '1.2',
                   fontFamily: 'Poppins, sans-serif',
                   animation: 'fadeInUp 1s ease-out 0.3s forwards',
                   opacity: 0
                 }}
               >
                 {getUserName()}
               </h1>
             </div>
           ) : (
             // For short names: show greeting and name on same line
             <h1 
               className="text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-6 px-4"
               style={{
                 color: '#FFFFFF',
                 letterSpacing: '-0.02em',
                 lineHeight: '1.2',
                 fontFamily: 'Poppins, sans-serif',
                 whiteSpace: 'nowrap',
                 animation: 'fadeInUp 1s ease-out forwards',
                 opacity: 0
               }}
             >
               {greeting}, {getUserName()}
             </h1>
           )}
             
             <p className="text-lg text-center mb-8" style={{ 
               color: '#D1D5DB', 
               fontFamily: 'Poppins, sans-serif',
               animation: 'fadeInUp 1s ease-out 0.6s forwards',
               opacity: 0
             }}>
               How are you doing?
             </p>
             
             {/* Description */}
             <p className="text-lg text-center max-w-2xl mx-auto mb-12" style={{ 
               color: '#D1D5DB', 
               fontFamily: 'Poppins, sans-serif',
               animation: 'fadeInUp 1s ease-out 0.9s forwards',
               opacity: 0
             }}>
               Welcome to your EventHub dashboard. Manage your college events, track participation, and stay connected with your campus community all in one place.
             </p>
             
            {/* View Dashboard Button with animations */}
            <div className="flex justify-center" style={{
              animation: 'fadeInUp 1s ease-out 1.2s forwards',
              opacity: 0
            }}>
              <Button
                size="lg"
                className="rounded-lg bg-gradient-to-b from-white via-white/95 to-white/60 text-black hover:scale-105 active:scale-95 transition-all duration-300 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl"
                onClick={() => {
                  const element = document.getElementById('dashboard-stats');
                  if (element) {
                    const navbarHeight = 80; // Approximate navbar height
                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - navbarHeight;
                    
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                View Dashboard
              </Button>
            </div>
           </AnimatedGroup>
         </div>
       </div>

      {/* Dashboard Statistics Section - Right below hero */}
      <div id="dashboard-stats" className="bg-black min-h-screen">
        <div className="container mx-auto px-6 py-16 max-w-[1400px]">
        <div className="w-full">
          
          {/* Dashboard text below the glow effect */}
          <div 
            className={`text-center mb-16 pt-20 transition-all duration-1000 ease-out ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-95'
            }`}
          >
            <h2 className="text-5xl font-bold" style={{ color: '#FFFFFF', fontFamily: 'Poppins, sans-serif' }}>
              Dashboard
            </h2>
          </div>

          {/* Dashboard Cards with Interactive Gradients */}
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 transition-all duration-1000 delay-300 ease-out ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-95'
            }`}
          >
            {/* Total Events Card */}
            <Card className="group relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  {loading ? "..." : stats.totalEvents}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <p className="text-xs text-muted-foreground">
                    {loading ? "Loading..." : `${stats.upcomingEvents.length} upcoming`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Active Clubs Card */}
            <Card className="group relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clubs</CardTitle>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                  {loading ? "..." : stats.activeClubs}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  <p className="text-xs text-muted-foreground">
                    Organizing events
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Classrooms Card */}
            <Card className="group relative overflow-hidden border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/10 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Classrooms</CardTitle>
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                  {loading ? "..." : stats.totalClassrooms}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="h-3 w-3 text-green-500" />
                  <p className="text-xs text-muted-foreground">
                    {loading ? "..." : `${stats.availableClassrooms} available now`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card className="group relative overflow-hidden border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-6 w-6 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  {loading ? "..." : Math.round((stats.activeClubs / Math.max(stats.totalClassrooms, 1)) * 100)}%
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                  <p className="text-xs text-muted-foreground">
                    Club engagement rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Row - Moved up */}
          <div 
            className={`grid gap-6 lg:grid-cols-3 mt-8 transition-all duration-1000 delay-500 ease-out ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-95'
            }`}
          >
            {/* Event Categories */}
            <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-cyan-500" />
                  Event Categories
                </CardTitle>
                <CardDescription>Distribution by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Tech Events</span>
                      <span className="text-sm font-bold text-cyan-500">
                        {loading ? "..." : stats.techEvents}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: loading ? '0%' : `${(stats.techEvents / Math.max(stats.totalEvents, 1)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Non-Tech Events</span>
                      <span className="text-sm font-bold text-purple-500">
                        {loading ? "..." : stats.nonTechEvents}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: loading ? '0%' : `${(stats.nonTechEvents / Math.max(stats.totalEvents, 1)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This Week</span>
                      <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-500">
                        {loading ? "..." : `${stats.thisWeekEvents} events`}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Clubs */}
            <Card className="border-l-4 border-l-pink-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                  Top Clubs
                </CardTitle>
                <CardDescription>Most active organizers</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-300 rounded w-8"></div>
                      </div>
                    ))}
                  </div>
                ) : stats.topClubs.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No club data yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.topClubs.map((club: any, index: number) => (
                      <div key={club.id} className="flex items-center justify-between group hover:bg-muted/50 p-2 rounded-lg transition-colors">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                            index === 1 ? 'bg-gray-400/20 text-gray-400' :
                            index === 2 ? 'bg-orange-500/20 text-orange-500' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium truncate max-w-[150px]">
                            {club.name}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {club.eventCount} events
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resource Utilization */}
            <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-5 w-5 text-emerald-500" />
                  Resource Status
                </CardTitle>
                <CardDescription>Classroom availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Total Bookings</span>
                      <span className="text-2xl font-bold text-emerald-500">
                        {loading ? "..." : stats.totalBookings}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available</span>
                      <span className="text-sm font-bold text-green-500">
                        {loading ? "..." : stats.availableClassrooms}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">In Use</span>
                      <span className="text-sm font-bold text-orange-500">
                        {loading ? "..." : stats.totalClassrooms - stats.availableClassrooms}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Rooms</span>
                      <span className="text-sm font-bold">
                        {loading ? "..." : stats.totalClassrooms}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: loading ? '0%' : `${(stats.availableClassrooms / Math.max(stats.totalClassrooms, 1)) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      {loading ? "Loading..." : `${Math.round((stats.availableClassrooms / Math.max(stats.totalClassrooms, 1)) * 100)}% available`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Details with Real Data */}
          <div 
            className={`grid gap-8 lg:grid-cols-2 mt-8 transition-all duration-1000 delay-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-32 scale-95'
            }`}
          >
            {/* Recent Activity */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Your latest events and updates
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                    {stats.recentActivity.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : stats.recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentActivity.map((event: any, index: number) => {
                      const colorClasses = [
                        'bg-blue-500',
                        'bg-green-500',
                        'bg-purple-500',
                        'bg-orange-500',
                        'bg-pink-500'
                      ];
                      const colorClass = colorClasses[index % colorClasses.length];
                      return (
                        <div key={event.id} className="group/item flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className={`w-3 h-3 ${colorClass} rounded-full mt-1 animate-pulse`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover/item:text-primary transition-colors">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {event.club_name && (
                                <Badge variant="outline" className="text-xs">
                                  {event.club_name}
                                </Badge>
                              )}
                              {event.event_date && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(event.event_date), 'MMM dd')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      Upcoming Events
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Events happening soon
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
                    {stats.upcomingEvents.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : stats.upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.upcomingEvents.map((event: any) => (
                      <div key={event.id} className="group/item relative p-4 border rounded-xl hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-1000" />
                        <div className="relative flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate group-hover/item:text-purple-500 transition-colors">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(new Date(event.event_date), 'MMM dd, yyyy')}
                                {event.start_time && ` • ${event.start_time}`}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            {event.club_name && (
                              <Badge variant="secondary" className="mb-1">
                                {event.club_name}
                              </Badge>
                            )}
                            {event.classrooms && (
                              <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.classrooms.room_number}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex gap-2">
                            {event.category && (
                              <Badge variant="outline" className="text-xs">
                                {event.category}
                              </Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="group-hover/item:text-purple-500 hover:bg-transparent">
                            View <ArrowRight className="h-3 w-3 ml-1 group-hover/item:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>

      {/* Footer - Only on Dashboard */}
      <EventHubFooter />
    </>
  );
};

export default Dashboard;
