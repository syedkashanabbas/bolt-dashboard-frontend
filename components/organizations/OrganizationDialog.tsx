'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Organization {
  id?: string;
  name: string;
  domain: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  status: 'active' | 'inactive' | 'suspended';
  description?: string;
 
}

interface OrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
  onOrganizationSaved?: () => void; // 👈 refresh list after save
}

const plans = ['Free', 'Pro', 'Enterprise'];

export function OrganizationDialog({
  open,
  onOpenChange,
  organization,
  onOrganizationSaved,
}: OrganizationDialogProps) {
  const [formData, setFormData] = useState<Organization>({
    name: '',
    domain: '',
    plan: 'Free',
    status: 'active',
    description: '',
 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organization) {
      setFormData(organization);
    } else {
      setFormData({
        name: '',
        domain: '',
        plan: 'Free',
        status: 'active',
        description: '',
       
      });
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!formData.name || !formData.domain) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const url = organization
        ? `http://localhost:5000/api/organizations/${organization.id}`
        : `http://localhost:5000/api/organizations`;

      const method = organization ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save organization');
      }

      toast.success(
        organization
          ? 'Organization updated successfully'
          : 'Organization created successfully'
      );

      if (onOrganizationSaved) onOrganizationSaved(); // 👈 refresh list
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Organization, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {organization ? 'Edit Organization' : 'Create New Organization'}
          </DialogTitle>
          <DialogDescription>
            {organization
              ? "Make changes to the organization. Click save when you're done."
              : 'Add a new organization to the platform. Fill in the required information.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="TechCorp Inc."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain *</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                placeholder="techcorp.com"
                required
              />
            </div>
          </div>

        

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <Select
                value={formData.plan}
                onValueChange={(value: 'Free' | 'Pro' | 'Enterprise') =>
                  handleInputChange('plan', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive' | 'suspended') =>
                  handleInputChange('status', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the organization..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? 'Saving...'
                : organization
                ? 'Save Changes'
                : 'Create Organization'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
