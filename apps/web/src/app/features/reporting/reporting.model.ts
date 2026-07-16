export interface SeriesPoint {
  label: string;
  value: number;
}

export interface RecentActivity {
  action: string;
  entity: string;
  user: string | null;
  createdAt: string;
}

export interface ReportingDashboard {
  kpis: {
    clients: number;
    projects: number;
    projectsInProgress: number;
    projectsCompleted: number;
    newClientsThisMonth: number;
    upcomingBookings: number;
    bookingsToday: number;
    bookingsThisWeek: number;
    occupancyRate: number;
    avgProjectDurationDays: number;
    invoiced: number;
    paid: number;
    outstanding: number;
    revenueThisMonth: number;
    revenueThisYear: number;
    lowStockCount: number;
  };
  projectsByStatus: { status: string; count: number }[];
  equipmentByStatus: { status: string; count: number }[];
  servicesMostRequested: { service: string; count: number }[];
  revenueByService: { service: string; amount: number }[];
  revenueByMonth: { month: string; amount: number }[];
  bookingsByMonth: { month: string; count: number }[];
  newClientsByMonth: { month: string; count: number }[];
  topClients: { name: string; amount: number }[];
  recentActivity: RecentActivity[];
}
