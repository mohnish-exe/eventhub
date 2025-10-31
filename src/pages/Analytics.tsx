import { useState, useEffect } from "react";
import { OracleServices } from "@/integrations/oracle/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Building2, TrendingUp, Activity, Clock, MapPin, Award, Target, Zap, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { format, parseISO, isAfter, isBefore, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, differenceInDays } from "date-fns";
import { GlowingCards, GlowingCard } from "@/components/ui/glowing-cards";

const Analytics = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalBookings: 0,
    totalClubs: 0,
    totalClassrooms: 0,
    activeToday: 0,
    thisMonthEvents: 0,
    lastMonthEvents: 0,
    classroomUtilization: 0,
    avgEventsPerMonth: 0,
    mostActiveDay: '',
    categoryBreakdown: { tech: 0, nonTech: 0 },
    topClubs: [] as any[],
    recentEvents: [] as any[],
    monthlyTrends: [] as any[],
    topVenues: [] as any[],
    upcomingThisWeek: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const thisMonthStart = startOfMonth(new Date()).toISOString().split("T")[0];
      const thisMonthEnd = endOfMonth(new Date()).toISOString().split("T")[0];

      const [events, clubs, classrooms, bookings] = await Promise.all([
        OracleServices.Events.getAll(),
        OracleServices.Clubs.getAll(),
        OracleServices.Classrooms.getAll(),
        OracleServices.ClassroomBookings.getAll(),
      ]);

      // Calculate metrics
      const upcomingEvents = events.filter((e: any) => {
        const eventDate = new Date(e.event_date).toISOString().split("T")[0];
        return eventDate >= today;
      });

      const todayEvents = events.filter((e: any) => {
        const eventDate = new Date(e.event_date).toISOString().split("T")[0];
        return eventDate === today;
      });

      const thisMonthEventsData = events.filter((e: any) => {
        const eventDate = new Date(e.event_date).toISOString().split("T")[0];
        return eventDate >= thisMonthStart && eventDate <= thisMonthEnd;
      });

      // Last month events
      const lastMonthStart = startOfMonth(subMonths(new Date(), 1)).toISOString().split("T")[0];
      const lastMonthEnd = endOfMonth(subMonths(new Date(), 1)).toISOString().split("T")[0];
      const lastMonthEventsData = events.filter((e: any) => {
        const eventDate = new Date(e.event_date).toISOString().split("T")[0];
        return eventDate >= lastMonthStart && eventDate <= lastMonthEnd;
      });

      // Events this week
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
      const upcomingThisWeekEvents = upcomingEvents.filter((e: any) => {
        const eventDate = new Date(e.event_date);
        return eventDate <= oneWeekFromNow;
      });

      // Growth rate calculation
      const growthRate = lastMonthEventsData.length > 0
        ? Math.round(((thisMonthEventsData.length - lastMonthEventsData.length) / lastMonthEventsData.length) * 100)
        : 0;

      // Calculate classroom utilization (bookings / total slots available)
      const utilizationPercentage = classrooms.length > 0 
        ? Math.round((bookings.length / (classrooms.length * 30)) * 100) 
        : 0;

      // Average events per month
      const avgEventsPerMonth = events.length > 0 ? Math.round(events.length / 6) : 0;

      // Most active day of week
      const dayCount: { [key: string]: number } = {};
      events.forEach((event: any) => {
        const day = format(new Date(event.event_date), 'EEEE');
        dayCount[day] = (dayCount[day] || 0) + 1;
      });
      const mostActiveDay = Object.keys(dayCount).length > 0
        ? Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A';

      // Category breakdown
      const techEvents = events.filter((e: any) => e.category === 'Tech').length;
      const nonTechEvents = events.filter((e: any) => e.category === 'Non-Tech').length;

      // Top clubs by event count
      const clubEventMap = new Map();
      events.forEach((event: any) => {
        if (event.club_id && event.club_name) {
          if (!clubEventMap.has(event.club_id)) {
            clubEventMap.set(event.club_id, {
              id: event.club_id,
              name: event.club_name,
              eventCount: 0,
            });
          }
          clubEventMap.get(event.club_id).eventCount += 1;
        }
      });

      const topClubs = Array.from(clubEventMap.values())
        .sort((a, b) => b.eventCount - a.eventCount)
        .slice(0, 5);

      // Monthly trends (last 6 months)
      const last6Months = eachMonthOfInterval({
        start: subMonths(new Date(), 5),
        end: new Date()
      });

      const monthlyTrends = last6Months.map(month => {
        const monthStart = startOfMonth(month).toISOString().split("T")[0];
        const monthEnd = endOfMonth(month).toISOString().split("T")[0];
        
        const monthEvents = events.filter((e: any) => {
          const eventDate = new Date(e.event_date).toISOString().split("T")[0];
          return eventDate >= monthStart && eventDate <= monthEnd;
        });

        return {
          month: format(month, 'MMM'),
          events: monthEvents.length,
        };
      });

      // Top venues by usage
      const venueMap = new Map();
      events.forEach((event: any) => {
        if (event.classrooms) {
          const venueKey = `${event.classrooms.building}-${event.classrooms.room_number}`;
          if (!venueMap.has(venueKey)) {
            venueMap.set(venueKey, {
              venue: venueKey,
              capacity: event.classrooms.capacity,
              bookings: 0,
            });
          }
          venueMap.get(venueKey).bookings += 1;
        }
      });

      const topVenues = Array.from(venueMap.values())
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 4);

      // Recent events (last 10)
      const recentEvents = events
        .sort((a: any, b: any) => {
          const dateA = new Date(a.event_date).getTime();
          const dateB = new Date(b.event_date).getTime();
          return dateB - dateA;
        })
        .slice(0, 10);

      setStats({
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        totalBookings: bookings.length,
        totalClubs: clubs.length,
        totalClassrooms: classrooms.length,
        activeToday: todayEvents.length,
        thisMonthEvents: thisMonthEventsData.length,
        lastMonthEvents: lastMonthEventsData.length,
        classroomUtilization: utilizationPercentage,
        avgEventsPerMonth,
        mostActiveDay,
        categoryBreakdown: { tech: techEvents, nonTech: nonTechEvents },
        topClubs,
        recentEvents,
        monthlyTrends,
        topVenues,
        upcomingThisWeek: upcomingThisWeekEvents.length,
        growthRate,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3 py-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real-time insights into events, venues, and engagement
        </p>
      </div>

      {/* Top Stats - 4 Cards */}
      <GlowingCards
        enableGlow={true}
        glowRadius={20}
        glowOpacity={1}
        gap="1.5rem"
        maxWidth="100%"
        padding="0"
        responsive={false}
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <GlowingCard glowColor="#3B82F6" className="w-full">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-0 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">{stats.upcomingEvents} upcoming</span>
              · {stats.avgEventsPerMonth}/mo avg
            </p>
          </CardContent>
        </Card>
        </GlowingCard>

        <GlowingCard glowColor="#A855F7" className="w-full">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-0 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeToday}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {stats.growthRate > 0 ? (
                <>
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{stats.growthRate}%</span>
                </>
              ) : stats.growthRate < 0 ? (
                <>
                  <ArrowDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{stats.growthRate}%</span>
                </>
              ) : (
                <>
                  <Minus className="h-3 w-3 text-muted-foreground" />
                  <span>0%</span>
                </>
              )}
              vs last month
            </p>
          </CardContent>
        </Card>
        </GlowingCard>

        <GlowingCard glowColor="#22C55E" className="w-full">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-0 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-500" />
              {stats.upcomingThisWeek} this week · {stats.totalClassrooms} venues
            </p>
          </CardContent>
        </Card>
        </GlowingCard>

        <GlowingCard glowColor="#F97316" className="w-full">
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-0 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Classroom Usage</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.classroomUtilization}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Target className="h-3 w-3 text-orange-500" />
              Peak: {stats.mostActiveDay}
            </p>
          </CardContent>
        </Card>
        </GlowingCard>
        </div>
      </GlowingCards>

      {/* Insights Row */}
      <GlowingCards
        enableGlow={true}
        glowRadius={20}
        glowOpacity={1}
        gap="1.5rem"
        maxWidth="100%"
        padding="0"
        responsive={false}
      >
        <div className="grid gap-6 md:grid-cols-3">
        <GlowingCard glowColor="#3B82F6" className="w-full">
        <Card className="border-0 rounded-2xl border-l-4 border-l-blue-500 h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tech Events</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ 
                          width: `${stats.totalEvents > 0 ? (stats.categoryBreakdown.tech / stats.totalEvents) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{stats.categoryBreakdown.tech}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Non-Tech Events</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ 
                          width: `${stats.totalEvents > 0 ? (stats.categoryBreakdown.nonTech / stats.totalEvents) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{stats.categoryBreakdown.nonTech}</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm font-medium">Total Events</span>
                <span className="text-lg font-bold text-blue-500">{stats.totalEvents}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </GlowingCard>

        <GlowingCard glowColor="#22C55E" className="w-full">
        <Card className="border-0 rounded-2xl border-l-4 border-l-green-500 h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-lg font-bold text-green-500">{stats.thisMonthEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Month</span>
                  <span className="text-lg font-bold">{stats.lastMonthEvents}</span>
                </div>
              </div>
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm font-medium">Growth</span>
                <span className={`text-lg font-bold ${stats.growthRate > 0 ? 'text-green-500' : stats.growthRate < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        </GlowingCard>

        <GlowingCard glowColor="#A855F7" className="w-full">
        <Card className="border-0 rounded-2xl border-l-4 border-l-purple-500 h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Club Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Clubs</span>
                  <span className="text-lg font-bold text-purple-500">{stats.topClubs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Clubs</span>
                  <span className="text-lg font-bold">{stats.totalClubs}</span>
                </div>
              </div>
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-sm font-medium">Participation</span>
                <span className="text-lg font-bold text-purple-500">
                  {stats.totalClubs > 0 ? Math.round((stats.topClubs.length / stats.totalClubs) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        </GlowingCard>
        </div>
      </GlowingCards>

      {/* Charts and Data Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Event Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Event Trends</CardTitle>
                <p className="text-sm text-muted-foreground">Last 6 months overview</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{stats.monthlyTrends.reduce((sum, m) => sum + m.events, 0)}</div>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {stats.monthlyTrends.map((data, index) => {
                const maxEvents = Math.max(...stats.monthlyTrends.map(m => m.events), 1);
                const heightPercent = (data.events / maxEvents) * 100;
                const isCurrentMonth = index === stats.monthlyTrends.length - 1;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className={`w-full rounded-t-lg relative group transition-all ${
                        isCurrentMonth 
                          ? 'bg-gradient-to-t from-blue-500 to-purple-500' 
                          : 'bg-primary/20 hover:bg-primary/30'
                      }`}
                      style={{ height: `${heightPercent}%`, minHeight: data.events > 0 ? '20px' : '4px' }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg border">
                        <div className="font-bold">{data.events} events</div>
                        <div className="text-[10px] text-muted-foreground">{data.month}</div>
                      </div>
                    </div>
                    <span className={`text-xs ${isCurrentMonth ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                      {data.month}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
              <div>Average: {Math.round(stats.monthlyTrends.reduce((sum, m) => sum + m.events, 0) / stats.monthlyTrends.length)} events/month</div>
              <div>Peak: {Math.max(...stats.monthlyTrends.map(m => m.events))} events</div>
            </div>
          </CardContent>
        </Card>

        {/* Top Venues */}
        <Card>
          <CardHeader>
            <CardTitle>Top Venues</CardTitle>
            <p className="text-sm text-muted-foreground">Most booked</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topVenues.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No venue data
                </p>
              ) : (
                stats.topVenues.map((venue, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{venue.venue}</p>
                      <p className="text-xs text-muted-foreground">Capacity: {venue.capacity}</p>
                    </div>
                    <Badge variant="secondary">{venue.bookings}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Clubs */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Clubs</CardTitle>
            <p className="text-sm text-muted-foreground">By event count</p>
          </CardHeader>
          <CardContent>
            {stats.topClubs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No club data available
              </p>
            ) : (
              <div className="space-y-4">
                {stats.topClubs.map((club, index) => (
                  <div key={club.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{club.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Rank #{index + 1}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{club.eventCount}</p>
                      <p className="text-xs text-muted-foreground">Events</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <p className="text-sm text-muted-foreground">Latest activities</p>
          </CardHeader>
          <CardContent>
            {stats.recentEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No recent events
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {stats.recentEvents.map((event: any) => (
                  <div key={event.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{event.club_name || 'No club'}</span>
                        {event.event_date && (
                          <>
                            <span>•</span>
                            <span>{format(new Date(event.event_date), 'MMM dd, yyyy')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      {event.status || 'Active'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
