'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  School, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Sparkles
} from 'lucide-react';

type SetupStep = 'welcome' | 'basic' | 'establishment' | 'location' | 'contact' | 'branch' | 'complete';

interface SchoolData {
  name: string;
  establishedYear: string;
  establishedMonth: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  branchEmail: string;
}

const steps = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'basic', title: 'Basic Info', icon: School },
  { id: 'establishment', title: 'Establishment', icon: Calendar },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'contact', title: 'Contact', icon: Phone },
  { id: 'branch', title: 'Main Campus', icon: Building },
  { id: 'complete', title: 'Complete', icon: CheckCircle },
];

export default function SchoolSetupJourney() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [schoolData, setSchoolData] = useState<SchoolData>({
    name: '',
    establishedYear: '',
    establishedMonth: '',
    type: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    branchName: 'Main Campus',
    branchAddress: '',
    branchPhone: '',
    branchEmail: '',
  });

  const updateField = (field: keyof SchoolData, value: string) => {
    setSchoolData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: SetupStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'basic':
        if (!schoolData.name.trim()) newErrors.name = 'School name is required';
        if (!schoolData.type.trim()) newErrors.type = 'School type is required';
        break;
      case 'establishment':
        if (!schoolData.establishedYear.trim()) newErrors.establishedYear = 'Established year is required';
        if (!schoolData.establishedMonth.trim()) newErrors.establishedMonth = 'Established month is required';
        break;
      case 'location':
        if (!schoolData.address.trim()) newErrors.address = 'Address is required';
        if (!schoolData.city.trim()) newErrors.city = 'City is required';
        if (!schoolData.state.trim()) newErrors.state = 'State is required';
        break;
      case 'contact':
        if (!schoolData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!schoolData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(schoolData.email)) newErrors.email = 'Invalid email format';
        break;
      case 'branch':
        if (!schoolData.branchAddress.trim()) newErrors.branchAddress = 'Campus address is required';
        if (!schoolData.branchPhone.trim()) newErrors.branchPhone = 'Campus phone is required';
        if (!schoolData.branchEmail.trim()) newErrors.branchEmail = 'Campus email is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const stepIndex = steps.findIndex(s => s.id === currentStep);
      if (stepIndex < steps.length - 1) {
        setCurrentStep(steps[stepIndex + 1].id as SetupStep);
      }
    }
  };

  const prevStep = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id as SetupStep);
    }
  };

  const completeSetup = async () => {
    if (!validateStep('branch')) return;

    setIsSubmitting(true);
    try {
      console.log('Complete school setup:', schoolData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep('complete');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (error) {
      toast({
        title: 'Setup Failed',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);

  // Step Progress Component
  const StepProgress = () => (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < getCurrentStepIndex();
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                ${isActive ? 'bg-primary text-primary-foreground shadow-lg scale-110' : 
                  isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}
              `}>
                {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
              </div>
              <span className={`text-xs font-medium text-center ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`hidden sm:block absolute h-0.5 w-16 mt-6 ml-16 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Welcome Step
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto py-12">
          <StepProgress />
          
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Welcome to Your School Setup Journey! 🎉
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Let&apos;s create something amazing together. We&apos;ll guide you through setting up your school in just a few simple steps.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <School className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-900">School Details</h3>
                  <p className="text-sm text-blue-700">Basic information about your institution</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-900">Location Setup</h3>
                  <p className="text-sm text-green-700">Address and contact information</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Building className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-900">Campus Setup</h3>
                  <p className="text-sm text-purple-700">Main campus configuration</p>
                </div>
              </div>
              
              <Button onClick={nextStep} size="lg" className="px-8">
                Let&apos;s Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Complete Step
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto py-12">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="pt-12 pb-8">
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  🎉 Congratulations!
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  Your school setup is now complete!
                </p>
                <p className="text-gray-500">
                  Redirecting you to your dashboard...
                </p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-green-900 mb-2">What&apos;s Next?</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Add teachers and staff members</li>
                  <li>• Create classes and subjects</li>
                  <li>• Enroll students</li>
                  <li>• Set up your academic calendar</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main Setup Steps
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <StepProgress />
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                {currentStep === 'basic' && <School className="h-8 w-8 text-primary" />}
                {currentStep === 'establishment' && <Calendar className="h-8 w-8 text-primary" />}
                {currentStep === 'location' && <MapPin className="h-8 w-8 text-primary" />}
                {currentStep === 'contact' && <Phone className="h-8 w-8 text-primary" />}
                {currentStep === 'branch' && <Building className="h-8 w-8 text-primary" />}
              </div>
            </div>
            <CardTitle className="text-2xl">
              {currentStep === 'basic' && 'Basic School Information'}
              {currentStep === 'establishment' && 'When Was Your School Established?'}
              {currentStep === 'location' && 'Where Is Your School Located?'}
              {currentStep === 'contact' && 'How Can People Reach You?'}
              {currentStep === 'branch' && 'Main Campus Details'}
            </CardTitle>
            <CardDescription>
              {currentStep === 'basic' && 'Tell us about your educational institution'}
              {currentStep === 'establishment' && 'Help us understand your school\'s history'}
              {currentStep === 'location' && 'Provide your school\'s address information'}
              {currentStep === 'contact' && 'Share your contact information'}
              {currentStep === 'branch' && 'Set up your primary campus information'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Basic Info Step */}
            {currentStep === 'basic' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">School Name *</Label>
                  <Input
                    id="name"
                    value={schoolData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g., Greenwood International School"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">School Type *</Label>
                  <select
                    id="type"
                    value={schoolData.type}
                    onChange={(e) => updateField('type', e.target.value)}
                    className={`w-full p-2 border rounded-md ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select school type</option>
                    <option value="Elementary School">Elementary School</option>
                    <option value="Middle School">Middle School</option>
                    <option value="High School">High School</option>
                    <option value="K-12 School">K-12 School</option>
                    <option value="International School">International School</option>
                    <option value="Private School">Private School</option>
                    <option value="Public School">Public School</option>
                    <option value="Charter School">Charter School</option>
                  </select>
                  {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">School Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={schoolData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Brief description of your school's mission, vision, or unique features..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Establishment Step */}
            {currentStep === 'establishment' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="establishedMonth">Month *</Label>
                    <select
                      id="establishedMonth"
                      value={schoolData.establishedMonth}
                      onChange={(e) => updateField('establishedMonth', e.target.value)}
                      className={`w-full p-2 border rounded-md ${errors.establishedMonth ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select month</option>
                      {['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                    {errors.establishedMonth && <p className="text-red-500 text-sm">{errors.establishedMonth}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Year *</Label>
                    <Input
                      id="establishedYear"
                      type="number"
                      value={schoolData.establishedYear}
                      onChange={(e) => updateField('establishedYear', e.target.value)}
                      placeholder="e.g., 2020"
                      min="1800"
                      max={new Date().getFullYear()}
                      className={errors.establishedYear ? 'border-red-500' : ''}
                    />
                    {errors.establishedYear && <p className="text-red-500 text-sm">{errors.establishedYear}</p>}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Why do we need this?</p>
                      <p className="text-xs text-blue-700">
                        This helps us understand your school&apos;s history and can be displayed on certificates and official documents.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Location Step */}
            {currentStep === 'location' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Textarea
                    id="address"
                    value={schoolData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="e.g., 123 Education Street, Building A"
                    rows={2}
                    className={errors.address ? 'border-red-500' : ''}
                  />
                  {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={schoolData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="e.g., New York"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={schoolData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="e.g., NY"
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={schoolData.zipCode}
                      onChange={(e) => updateField('zipCode', e.target.value)}
                      placeholder="e.g., 10001"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Contact Step */}
            {currentStep === 'contact' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={schoolData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="e.g., +1-234-567-8900"
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={schoolData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="e.g., info@yourschool.edu"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website (Optional)
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={schoolData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="e.g., https://www.yourschool.edu"
                  />
                </div>
              </>
            )}

            {/* Branch Step */}
            {currentStep === 'branch' && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Main Campus Setup</h3>
                  <p className="text-sm text-blue-700">
                    This is your primary campus. You can add additional branches later from your dashboard.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branchName">Campus Name</Label>
                  <Input
                    id="branchName"
                    value={schoolData.branchName}
                    onChange={(e) => updateField('branchName', e.target.value)}
                    placeholder="Main Campus"
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branchAddress">Campus Address *</Label>
                  <Textarea
                    id="branchAddress"
                    value={schoolData.branchAddress}
                    onChange={(e) => updateField('branchAddress', e.target.value)}
                    placeholder="Campus-specific address (if different from school address)"
                    rows={2}
                    className={errors.branchAddress ? 'border-red-500' : ''}
                  />
                  {errors.branchAddress && <p className="text-red-500 text-sm">{errors.branchAddress}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branchPhone">Campus Phone *</Label>
                    <Input
                      id="branchPhone"
                      type="tel"
                      value={schoolData.branchPhone}
                      onChange={(e) => updateField('branchPhone', e.target.value)}
                      placeholder="e.g., +1-234-567-8901"
                      className={errors.branchPhone ? 'border-red-500' : ''}
                    />
                    {errors.branchPhone && <p className="text-red-500 text-sm">{errors.branchPhone}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="branchEmail">Campus Email *</Label>
                    <Input
                      id="branchEmail"
                      type="email"
                      value={schoolData.branchEmail}
                      onChange={(e) => updateField('branchEmail', e.target.value)}
                      placeholder="e.g., main@yourschool.edu"
                      className={errors.branchEmail ? 'border-red-500' : ''}
                    />
                    {errors.branchEmail && <p className="text-red-500 text-sm">{errors.branchEmail}</p>}
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 'basic'}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              {currentStep === 'branch' ? (
                <Button
                  onClick={completeSetup}
                  disabled={isSubmitting}
                  className="px-8"
                >
                  {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                  {!isSubmitting && <CheckCircle className="ml-2 h-4 w-4" />}
                </Button>
              ) : (
                <Button onClick={nextStep} className="px-8">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 