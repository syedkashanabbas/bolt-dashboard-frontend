'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Key,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'password_change' | 'permission_change' | 'api_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  location?: string;
}

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: '1',
    type: 'failed_login',
    severity: 'medium',
    user: 'admin@company.com',
    description: 'Multiple failed login attempts',
    ipAddress: '192.168.1.100',
    timestamp: '2024-01-15T10:30:00Z',
    location: 'New York, US',
  },
  {
    id: '2',
    type: 'login',
    severity: 'low',
    user: 'manager@company.com',
    description: 'Successful login from new device',
    ipAddress: '192.168.1.101',
    timestamp: '2024-01-15T09:15:00Z',
    location: 'San Francisco, US',
  },
  {
    id: '3',
    type: 'permission_change',
    severity: 'high',
    user: 'super@admin.com',
    description: 'User role upgraded to Admin',
    ipAddress: '192.168.1.102',
    timestamp: '2024-01-14T16:45:00Z',
    location: 'London, UK',
  },
  {
    id: '4',
    type: 'api_access',
    severity: 'medium',
    user: 'service-account',
    description: 'Unusual API access pattern detected',
    ipAddress: '10.0.0.50',
    timestamp: '2024-01-14T14:20:00Z',
    location: 'Server Farm',
  },
];

export default function SecurityPage() {
  const { user } = useAuth();

  const canViewSecurity = user?.role === 'SuperAdmin' || user?.role === 'Admin';

  if (!canViewSecurity) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view security settings. Contact your administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-600 hover:bg-orange-700">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'failed_login':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'login':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'password_change':
        return <Key className="h-4 w-4 text-blue-500" />;
      case 'permission_change':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'api_access':
        return <Eye className="h-4 w-4 text-purple-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const securityStats = [
    {
      title: 'Security Score',
      value: '94/100',
      description: 'Excellent security posture',
      icon: Shield,
      color: 'text-green-600',
    },
    {
      title: 'Active Sessions',
      value: '23',
      description: 'Current user sessions',
      icon: Eye,
      color: 'text-blue-600',
    },
    {
      title: 'Failed Logins',
      value: '8',
      description: 'Last 24 hours',
      icon: AlertTriangle,
      color: 'text-yellow-600',
    },
    {
      title: 'API Keys',
      value: '12',
      description: 'Active API keys',
      icon: Key,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security</h1>
          <p className="text-muted-foreground">
            Monitor security events and manage access controls
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Log
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {securityStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Monitor and investigate security-related activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSecurityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(event.type)}
                          <div>
                            <p className="font-medium">{event.description}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {event.type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{event.user}</TableCell>
                      <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                      <TableCell className="font-mono text-sm">{event.ipAddress}</TableCell>
                      <TableCell>{event.location || 'Unknown'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(event.timestamp), 'MMM d, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Password Policy</CardTitle>
                <CardDescription>Current password requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Minimum length</span>
                  <Badge variant="outline">8 characters</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Complexity</span>
                  <Badge variant="default">High</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Expiration</span>
                  <Badge variant="outline">90 days</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Two-factor auth</span>
                  <Badge variant="default">Required</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>Security access settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Session timeout</span>
                  <Badge variant="outline">30 minutes</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Max login attempts</span>
                  <Badge variant="outline">5 attempts</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>IP restrictions</span>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audit logging</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
              <CardDescription>
                Currently logged-in users and their session information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Session Monitoring</h3>
                <p className="text-muted-foreground">
                  Active session data would be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage API keys for system integration
                  </CardDescription>
                </div>
                <Button>
                  <Key className="mr-2 h-4 w-4" />
                  Generate New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">API Key Management</h3>
                <p className="text-muted-foreground">
                  API key management interface would be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}