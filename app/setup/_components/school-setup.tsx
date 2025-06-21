'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { School, MapPin, Phone, Mail, Globe } from 'lucide-react';

interface SchoolSetupProps {
  onNext: () => void;
  onBack: () => void;
  formData: any;
  onFormDataChange: (data: any) => void;
  errors?: Record<string, string[]>;
}

export default function SchoolSetup({ 
  onNext, 
  onBack, 
  formData, 
  onFormDataChange, 
  errors 
}: SchoolSetupProps) {
  
  const handleInputChange = (field: string, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const handleNext = () => {
    const requiredFields = ['schoolAddress', 'schoolPhone', 'schoolEmail'];
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
            <School className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">School Information</CardTitle>
        <CardDescription>
          Provide details about your educational institution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="schoolAddress" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            School Address *
          </Label>
          <Textarea 
            id="schoolAddress"
            value={formData.schoolAddress || ''}
            onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
            placeholder="e.g., 123 Education Street, Academic City, State, ZIP Code"
            rows={3}
            className="resize-none"
          />
          {errors?.schoolAddress && (
            <p className="text-red-500 text-sm">{errors.schoolAddress[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="schoolPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              School Phone Number *
            </Label>
            <Input 
              id="schoolPhone"
              type="tel"
              value={formData.schoolPhone || ''}
              onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
              placeholder="e.g., +1-234-567-8900"
            />
            {errors?.schoolPhone && (
              <p className="text-red-500 text-sm">{errors.schoolPhone[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              School Email Address *
            </Label>
            <Input 
              id="schoolEmail"
              type="email"
              value={formData.schoolEmail || ''}
              onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
              placeholder="e.g., info@yourschool.edu"
            />
            {errors?.schoolEmail && (
              <p className="text-red-500 text-sm">{errors.schoolEmail[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="schoolWebsite" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            School Website (Optional)
          </Label>
          <Input 
            id="schoolWebsite"
            type="url"
            value={formData.schoolWebsite || ''}
            onChange={(e) => handleInputChange('schoolWebsite', e.target.value)}
            placeholder="e.g., https://www.yourschool.edu"
          />
          {errors?.schoolWebsite && (
            <p className="text-red-500 text-sm">{errors.schoolWebsite[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="schoolDescription">
            School Description (Optional)
          </Label>
          <Textarea 
            id="schoolDescription"
            value={formData.schoolDescription || ''}
            onChange={(e) => handleInputChange('schoolDescription', e.target.value)}
            placeholder="Brief description about your school, mission, or vision..."
            rows={3}
            className="resize-none"
          />
          {errors?.schoolDescription && (
            <p className="text-red-500 text-sm">{errors.schoolDescription[0]}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            type="button" 
            onClick={handleNext}
            className="flex-1"
          >
            Next: Branch Setup
          </Button>
        </div>

        <div className="flex justify-center space-x-2 pt-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <div className="w-2 h-2 bg-muted rounded-full"></div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Step 2 of 3
        </p>
      </CardContent>
    </Card>
  );
} 