'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, MapPin, Phone, Mail, Users, Clock } from 'lucide-react';

interface BranchSetupProps {
  onNext: () => void;
  onBack: () => void;
  formData: any;
  onFormDataChange: (data: any) => void;
  errors?: Record<string, string[]>;
  isSubmitting?: boolean;
}

export default function BranchSetup({ 
  onNext, 
  onBack, 
  formData, 
  onFormDataChange, 
  errors,
  isSubmitting = false
}: BranchSetupProps) {
  
  const handleInputChange = (field: string, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = () => {
    const requiredFields = ['branchAddress', 'branchPhone', 'branchEmail'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length === 0) {
      onNext();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Building className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Main Campus Information</CardTitle>
        <CardDescription>
          Set up your primary campus/branch details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="branchName" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Campus Name
          </Label>
          <Input 
            id="branchName"
            value="Main Campus"
            disabled
            className="bg-muted"
          />
          <p className="text-sm text-muted-foreground">
            This is your primary campus. You can add more branches later.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="branchAddress" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Campus Address *
          </Label>
          <Textarea 
            id="branchAddress"
            value={formData.branchAddress || ''}
            onChange={(e) => handleInputChange('branchAddress', e.target.value)}
            placeholder="e.g., 123 Main Campus Drive, Academic City, State, ZIP Code"
            rows={3}
            className="resize-none"
          />
          {errors?.branchAddress && (
            <p className="text-red-500 text-sm">{errors.branchAddress[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="branchPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Campus Phone Number *
            </Label>
            <Input 
              id="branchPhone"
              type="tel"
              value={formData.branchPhone || ''}
              onChange={(e) => handleInputChange('branchPhone', e.target.value)}
              placeholder="e.g., +1-234-567-8901"
            />
            {errors?.branchPhone && (
              <p className="text-red-500 text-sm">{errors.branchPhone[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="branchEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Campus Email Address *
            </Label>
            <Input 
              id="branchEmail"
              type="email"
              value={formData.branchEmail || ''}
              onChange={(e) => handleInputChange('branchEmail', e.target.value)}
              placeholder="e.g., main@yourschool.edu"
            />
            {errors?.branchEmail && (
              <p className="text-red-500 text-sm">{errors.branchEmail[0]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="branchCapacity" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Student Capacity (Optional)
            </Label>
            <Input 
              id="branchCapacity"
              type="number"
              value={formData.branchCapacity || ''}
              onChange={(e) => handleInputChange('branchCapacity', e.target.value)}
              placeholder="e.g., 500"
              min="1"
            />
            {errors?.branchCapacity && (
              <p className="text-red-500 text-sm">{errors.branchCapacity[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="establishedYear" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Established Year (Optional)
            </Label>
            <Input 
              id="establishedYear"
              type="number"
              value={formData.establishedYear || ''}
              onChange={(e) => handleInputChange('establishedYear', e.target.value)}
              placeholder="e.g., 2020"
              min="1900"
              max={new Date().getFullYear()}
            />
            {errors?.establishedYear && (
              <p className="text-red-500 text-sm">{errors.establishedYear[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="branchDescription">
            Campus Description (Optional)
          </Label>
          <Textarea 
            id="branchDescription"
            value={formData.branchDescription || ''}
            onChange={(e) => handleInputChange('branchDescription', e.target.value)}
            placeholder="Brief description about this campus, facilities, or unique features..."
            rows={3}
            className="resize-none"
          />
          {errors?.branchDescription && (
            <p className="text-red-500 text-sm">{errors.branchDescription[0]}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="flex-1"
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating School...' : 'Complete Registration'}
          </Button>
        </div>

        <div className="flex justify-center space-x-2 pt-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <div className="w-2 h-2 bg-primary rounded-full"></div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Step 3 of 3
        </p>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Multi-Branch Support
                </p>
                <p className="text-xs text-blue-700">
                  This is your main campus. After registration, you can add additional 
                  branches, manage different locations, and assign users to specific campuses.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
} 