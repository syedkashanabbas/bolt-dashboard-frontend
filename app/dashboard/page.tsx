'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Building2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<{ totalUsers: number; organizations: number }>({
    totalUsers: 0,
    organizations: 0,
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStatsData(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    fetchStats();
  }, [token]);

  const stats = [
    {
      title: 'Total Users',
      value: statsData.totalUsers.toString(),
      description: 'Users registered in the system',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Organizations',
      value: statsData.organizations.toString(),
      description: 'Total organizations onboarded',
      icon: Building2,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's what's happening in your organization.
        </p>
      </div>

      {/* ✅ Stats from API */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 👇 Unchanged cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions performed in your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">System backup completed</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">API rate limit adjusted</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Role</CardTitle>
            <CardDescription>Current permissions and access level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="outline" className="w-fit">
              {user?.role}
            </Badge>
            <div className="text-sm space-y-1">
              <p>
                <strong>Organization:</strong> {user?.organization || '--'}
              </p>
              <p>
                {/* <strong>Department:</strong> {user?.department || 'N/A'} */}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
