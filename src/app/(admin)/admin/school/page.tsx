"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  Shield,
  AlertTriangle,
  ChevronRight,
  School,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  activeClasses: number;
  averageProgress: number;
  atRiskStudents: number;
  upcomingAssessments: number;
  pendingConsents: number;
}

interface RecentActivity {
  id: string;
  type: "enrollment" | "grade" | "alert" | "announcement";
  message: string;
  timestamp: string;
}

export default function SchoolDashboardPage() {
  const [stats, setStats] = useState<SchoolStats>({
    totalStudents: 0,
    totalTeachers: 0,
    activeClasses: 0,
    averageProgress: 0,
    atRiskStudents: 0,
    upcomingAssessments: 0,
    pendingConsents: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/school/dashboard");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setActivities(data.activities);
      } else {
        // Mock data
        setStats({
          totalStudents: 342,
          totalTeachers: 24,
          activeClasses: 18,
          averageProgress: 67,
          atRiskStudents: 12,
          upcomingAssessments: 5,
          pendingConsents: 8,
        });
        setActivities([
          { id: "1", type: "enrollment", message: "5 new students enrolled", timestamp: new Date().toISOString() },
          { id: "2", type: "grade", message: "3rd Grade Math assessment completed", timestamp: new Date().toISOString() },
          { id: "3", type: "alert", message: "2 students flagged as at-risk", timestamp: new Date().toISOString() },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { href: "/admin/school/import/students", label: "Import Students", icon: Users },
    { href: "/admin/school/teachers", label: "Manage Teachers", icon: GraduationCap },
    { href: "/admin/school/curriculum", label: "Curriculum", icon: BookOpen },
    { href: "/admin/school/announcements", label: "Announcements", icon: Bell },
    { href: "/admin/school/branding", label: "School Branding", icon: School },
    { href: "/admin/school/sso", label: "SSO Settings", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Administration</h1>
          <p className="text-muted-foreground">
            Manage your school's students, teachers, curriculum, and settings.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/school/profile">
            <Settings className="mr-2 h-4 w-4" />
            School Settings
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.atRiskStudents} need attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeClasses} active classes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Curriculum completion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAssessments}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.atRiskStudents > 0 || stats.pendingConsents > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.atRiskStudents > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-800">
                      {stats.atRiskStudents} Students Need Attention
                    </p>
                    <p className="text-sm text-yellow-700">
                      Students falling behind in curriculum
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/school/at-risk">View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          {stats.pendingConsents > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-800">
                      {stats.pendingConsents} Pending Consents
                    </p>
                    <p className="text-sm text-blue-700">
                      Parent consent forms awaiting approval
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/school/consent">Review</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                >
                  <link.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.type === "alert"
                        ? "bg-yellow-500"
                        : activity.type === "enrollment"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <Link href="/admin/school/performance">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Performance Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View detailed reports and insights
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <Link href="/admin/school/reports">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">State Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate compliance reports
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <Link href="/admin/school/privacy">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Privacy & FERPA</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage data privacy settings
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
