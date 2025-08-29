'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

interface Report {
  id: string;
  name: string;
  type: 'usage' | 'financial' | 'user' | 'security';
  format: 'PDF' | 'CSV' | 'Excel';
  status: 'ready' | 'generating' | 'failed';
  createdAt: string;
  size?: string;
}

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Monthly Usage Report - January 2024',
    type: 'usage',
    format: 'PDF',
    status: 'ready',
    createdAt: '2024-01-15T10:30:00Z',
    size: '2.4 MB',
  },
  {
    id: '2',
    name: 'User Activity Analysis',
    type: 'user',
    format: 'CSV',
    status: 'ready',
    createdAt: '2024-01-14T16:20:00Z',
    size: '1.8 MB',
  },
  {
    id: '3',
    name: 'Financial Summary Q4 2023',
    type: 'financial',
    format: 'Excel',
    status: 'generating',
    createdAt: '2024-01-15T14:00:00Z',
  },
  {
    id: '4',
    name: 'Security Audit Report',
    type: 'security',
    format: 'PDF',
    status: 'ready',
    createdAt: '2024-01-13T09:15:00Z',
    size: '5.2 MB',
  },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('recent');

  const canViewReports = user?.role === 'SuperAdmin' || user?.role === 'Admin' || user?.role === 'Manager';

  if (!canViewReports) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view reports. Contact your administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'usage':
        return <BarChart3 className="h-4 w-4" />;
      case 'financial':
        return <TrendingUp className="h-4 w-4" />;
      case 'user':
        return <PieChart className="h-4 w-4" />;
      case 'security':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default">Ready</Badge>;
      case 'generating':
        return <Badge variant="secondary">Generating</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const reportTemplates = [
    {
      name: 'Usage Analytics',
      description: 'AI feature usage and performance metrics',
      icon: BarChart3,
      type: 'usage',
    },
    {
      name: 'User Activity',
      description: 'User engagement and behavior analysis',
      icon: PieChart,
      type: 'user',
    },
    {
      name: 'Financial Summary',
      description: 'Revenue, costs, and billing information',
      icon: TrendingUp,
      type: 'financial',
    },
    {
      name: 'Security Audit',
      description: 'Security events and compliance status',
      icon: FileText,
      type: 'security',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download detailed reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="templates">Generate New</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Your recently generated reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getReportTypeIcon(report.type)}
                          {report.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.format}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{report.size || 'N/A'}</TableCell>
                      <TableCell>
                        {report.status === 'ready' && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {reportTemplates.map((template) => (
              <Card key={template.name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <template.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Automatically generated reports on a schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Scheduled Reports</h3>
                <p className="text-muted-foreground mb-4">
                  Set up automatic report generation to save time
                </p>
                <Button>
                  Create Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}