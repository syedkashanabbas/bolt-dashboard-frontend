'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, MoreHorizontal, Building2, Users, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { OrganizationDialog } from '@/components/organizations/OrganizationDialog';
import { format } from 'date-fns';

interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  userCount: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastActivity: string;
}

const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'TechCorp Inc.',
    domain: 'techcorp.com',
    plan: 'Enterprise',
    userCount: 45,
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z',
    lastActivity: '2024-01-15T14:30:00Z',
  },
  {
    id: '2',
    name: 'StartupXYZ',
    domain: 'startupxyz.io',
    plan: 'Pro',
    userCount: 12,
    status: 'active',
    createdAt: '2024-01-05T09:15:00Z',
    lastActivity: '2024-01-15T11:20:00Z',
  },
  {
    id: '3',
    name: 'Global Solutions Ltd.',
    domain: 'globalsolutions.com',
    plan: 'Enterprise',
    userCount: 120,
    status: 'active',
    createdAt: '2023-12-15T16:00:00Z',
    lastActivity: '2024-01-15T09:45:00Z',
  },
  {
    id: '4',
    name: 'Creative Agency',
    domain: 'creativeagency.net',
    plan: 'Free',
    userCount: 5,
    status: 'inactive',
    createdAt: '2024-01-10T14:20:00Z',
    lastActivity: '2024-01-12T10:15:00Z',
  },
];

export default function OrganizationsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  const filteredOrganizations = mockOrganizations.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageOrganizations = user?.role === 'SuperAdmin';

  if (!canManageOrganizations) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view this page. Only Super Admins can manage organizations.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'Enterprise':
        return 'default';
      case 'Pro':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const stats = [
    {
      title: 'Total Organizations',
      value: mockOrganizations.length.toString(),
      description: '+2 from last month',
      icon: Building2,
    },
    {
      title: 'Active Organizations',
      value: mockOrganizations.filter(org => org.status === 'active').length.toString(),
      description: '92% active rate',
      icon: Building2,
    },
    {
      title: 'Total Users',
      value: mockOrganizations.reduce((sum, org) => sum + org.userCount, 0).toString(),
      description: 'Across all organizations',
      icon: Users,
    },
    {
      title: 'This Month',
      value: '2',
      description: 'New organizations',
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage organizations and their subscriptions
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Organization
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>
                Manage organization accounts and their settings
              </CardDescription>
            </div>
            <div className="w-72">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                        {org.name.charAt(0)}
                      </div>
                      {org.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{org.domain}</TableCell>
                  <TableCell>
                    <Badge variant={getPlanBadgeVariant(org.plan)}>
                      {org.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>{org.userCount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(org.status)}>
                      {org.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(org.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(org.lastActivity), 'MMM d, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrganization(org);
                            setDialogOpen(true);
                          }}
                        >
                          Edit Organization
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Users</DropdownMenuItem>
                        <DropdownMenuItem>Change Plan</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Suspend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <OrganizationDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedOrganization(null);
        }}
        organization={selectedOrganization}
      />
    </div>
  );
}