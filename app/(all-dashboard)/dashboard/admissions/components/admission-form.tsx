'use client';

import { useState, useEffect, useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createStudentWithParent, generateRollNumber } from '@/app/actions/admission';
import { getClassesByAamarId } from '@/app/actions/classes';
import { useBranch } from '@/contexts/branch-context';
import { Loader2, UserIcon, Users, Calendar, MapPin, Phone, Mail, GraduationCap, Upload, Camera, RefreshCcw, CheckCircle2, Copy, Check } from 'lucide-react';
import { Gender } from '@prisma/client';
import { getSectionsByClass } from '@/app/actions/sections';
import { startTransition } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

interface AdmissionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ClassOption {
  id: string;
  name: string;
  section: string;
  academicYear: string;
  displayName: string;
  fullDisplayName: string;
  teacher?: {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string | null;
    qualification: string | null;
    experience: number | null;
    subjects: string[];
  } | null;
  branch?: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
  } | null;
  stats: {
    totalStudents: number;
    totalSubjects: number;
    totalTimetables: number;
  };
}

interface FormData {
  // Student Information
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  classId: string;
  sectionId: string;
  admissionDate: string;
  address: string;
  nationality: string;
  religion: string;
  birthCertificateNo: string;
  previousSchool: string;
  medicalInfo: string;
  studentPhoto: File | null;
  
  // Parent Information
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  parentGender: string;
  relation: string;
  parentAddress: string;
  emergencyContact: string;
}

const RELIGIONS = [
  'Islam',
  'Christian',
  'Hindu',
  'Buddha',
  'Jewish',
  'Sikh',
  'Other',
  'Prefer not to say'
];

const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-'
];

const RELATIONS = [
  'Father',
  'Mother', 
  'Guardian',
  'Grandfather',
  'Grandmother',
  'Uncle',
  'Aunt',
  'Brother',
  'Sister',
  'Other'
];

export function AdmissionForm({ open, onOpenChange, onSuccess }: AdmissionFormProps) {
  const { selectedBranch, branches } = useBranch();
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isGeneratingRoll, setIsGeneratingRoll] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedRollNumber, setGeneratedRollNumber] = useState<string>('');
  const [credentials, setCredentials] = useState<{
    studentEmail?: string;
    studentPassword?: string;
    parentEmail?: string;
    parentPassword?: string;
  } | null>(null);
  const [copiedStudent, setCopiedStudent] = useState(false);
  const [copiedParent, setCopiedParent] = useState(false);

  console.log("classes:",classes)
  // Form data state for persistence across steps
  const [formData, setFormData] = useState<FormData>({
    // Student Information
    studentFirstName: '',
    studentLastName: '',
    studentEmail: '',
    studentPhone: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    classId: '',
    sectionId: '',
    admissionDate: new Date().toISOString().split('T')[0],
    address: '',
    nationality: 'Bangladeshi',
    religion: '',
    birthCertificateNo: '',
    previousSchool: '',
    medicalInfo: '',
    studentPhoto: null,
    
    // Parent Information
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    parentGender: '',
    relation: '',
    parentAddress: '',
    emergencyContact: '',
  });

  // Load classes on component mount
  useEffect(() => {
    loadClasses();
  }, []);

  // When class changes, fetch sections
  useEffect(() => {
    if (formData.classId) {
      getSectionsByClass(formData.classId).then(result => {
        if (result.success) {
          setSections(result.data ?? []);
          setFormData(f => ({ ...f, sectionId: '' })); // reset section
        } else {
          setSections([]);
          setFormData(f => ({ ...f, sectionId: '' }));
        }
      });
    } else {
      setSections([]);
      setFormData(f => ({ ...f, sectionId: '' }));
    }
  }, [formData.classId]);

  // When section changes, generate roll number
  useEffect(() => {
    const generateRoll = async () => {
      if (
        formData.sectionId &&
        !isLoadingClasses &&
        sections.some((s) => s.id === formData.sectionId)
      ) {
        setIsGeneratingRoll(true);
        try {
          const rollNumber = await generateRollNumber(formData.sectionId);
          setGeneratedRollNumber(rollNumber);
        } catch (error) {
          console.error('Error generating roll number:', error);
          setGeneratedRollNumber('');
        } finally {
          setIsGeneratingRoll(false);
        }
      } else {
        setGeneratedRollNumber('');
      }
    };
    generateRoll();
  }, [formData.sectionId, isLoadingClasses, sections]);

  // Handle form submission result
  useEffect(() => {
    if (isSuccess && !credentials) {
      onOpenChange(false);
      resetForm();
    }
  }, [isSuccess, credentials, onOpenChange]);

  const copyToClipboard = (text: string, type: 'student' | 'parent') => {
    navigator.clipboard.writeText(text);
    if (type === 'student') {
      setCopiedStudent(true);
      setTimeout(() => setCopiedStudent(false), 2000);
    } else {
      setCopiedParent(true);
      setTimeout(() => setCopiedParent(false), 2000);
    }
    toast({
      title: 'Copied',
      description: 'Credentials copied to clipboard!',
    });
  };

  const handleDone = () => {
    onOpenChange(false);
    resetForm();
    onSuccess?.();
  };

  const loadClasses = async () => {
    setIsLoadingClasses(true);
    try {
      const result = await getClassesByAamarId();
      
      if (result.success) {
        console.log('Loaded classes:', result.data);
        setClasses(result.data as ClassOption[]);
        
        // Reset class selection if current class is not in the new list
        if (formData.classId && !(result.data as ClassOption[]).find((c) => c.id === formData.classId)) {
          updateFormData('classId', '');
        }
      } else {
        console.error('Failed to load classes:', result.error);
        setClasses([]);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      setClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const handleGenerateRollNumber = async (classId: string) => {
    if (!classId) return;
    
    setIsGeneratingRoll(true);
    try {
      const rollNumber = await generateRollNumber(classId);
      setGeneratedRollNumber(rollNumber);
    } catch (error) {
      console.error('Error generating roll number:', error);
      setGeneratedRollNumber('ROLL' + Date.now());
    } finally {
      setIsGeneratingRoll(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      studentFirstName: '',
      studentLastName: '',
      studentEmail: '',
      studentPhone: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      classId: '',
      sectionId: '',
      admissionDate: new Date().toISOString().split('T')[0],
      address: '',
      nationality: 'Bangladeshi',
      religion: '',
      birthCertificateNo: '',
      previousSchool: '',
      medicalInfo: '',
      studentPhoto: null,
      parentFirstName: '',
      parentLastName: '',
      parentEmail: '',
      parentPhone: '',
      parentGender: '',
      relation: '',
      parentAddress: '',
      emergencyContact: '',
    });
    setPhotoPreview(null);
    setFormError('');
    setIsSuccess(false);
    setCredentials(null);
  };

  const updateFormData = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData('studentPhoto', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const defaultSchoolId = branches[0]?.id || '';
  const defaultBranchId = selectedBranch?.id || '';

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setFormError('');
    
    try {
      // Create a new FormData object for submission
      const submissionData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'studentPhoto' && value instanceof File) {
          submissionData.append(key, value);
        } else if (typeof value === 'string') {
          submissionData.append(key, value);
        }
      });
      submissionData.append('schoolId', defaultSchoolId);
      submissionData.append('branchId', defaultBranchId);
      submissionData.append('rollNumber', generatedRollNumber);
      if (formData.sectionId) {
        submissionData.append('sectionId', formData.sectionId);
      }
      
      const result = await createStudentWithParent(null, submissionData);
      
      if (result.success) {
        setCredentials(result.data || null);
        setIsSuccess(true);
        toast({
          title: 'Success',
          description: 'Admission created successfully!'
        });
      } else {
        setFormError(result.message || 'Failed to submit admission');
      }
    } catch (error) {
      setFormError('An unexpected error occurred during submission.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <GraduationCap className="h-6 w-6" />
            Student Admission Application
          </DialogTitle>
          <p className="text-muted-foreground mt-2 justify-center text-center">
            Complete the admission process in 3 simple steps
          </p>
        </DialogHeader>

        {isSuccess && credentials ? (
          <div className="space-y-6 max-w-2xl mx-auto py-8 text-center">
            <div className="flex justify-center">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <CheckCircle2 className="h-16 w-16" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-green-700">Admission Process Successful!</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Student and Parent records have been successfully created. Please copy the default login credentials below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mt-6">
              {/* Student Credentials Card */}
              <div className="border border-green-200 bg-green-50/30 p-5 rounded-xl space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 text-green-800 font-semibold border-b pb-2 border-green-100">
                  <UserIcon className="h-5 w-5" />
                  <span>Student Credentials</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">LOGIN EMAIL</span>
                    <span className="font-mono text-slate-800 break-all">{credentials.studentEmail}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">PASSWORD</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-green-150 text-slate-900 font-bold text-base">{credentials.studentPassword}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => copyToClipboard(`Email: ${credentials.studentEmail}\nPassword: ${credentials.studentPassword}`, 'student')}
                  size="sm" 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 border-green-200 hover:bg-green-50 text-green-700 bg-white"
                >
                  {copiedStudent ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedStudent ? 'Copied!' : 'Copy Credentials'}
                </Button>
              </div>

              {/* Parent Credentials Card */}
              <div className="border border-indigo-200 bg-indigo-50/20 p-5 rounded-xl space-y-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 text-indigo-800 font-semibold border-b pb-2 border-indigo-100">
                  <Users className="h-5 w-5" />
                  <span>Parent Credentials</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">LOGIN EMAIL</span>
                    <span className="font-mono text-slate-800 break-all">{credentials.parentEmail}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block font-medium">PASSWORD</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-150 text-slate-900 font-bold text-base">{credentials.parentPassword}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => copyToClipboard(`Email: ${credentials.parentEmail}\nPassword: ${credentials.parentPassword}`, 'parent')}
                  size="sm" 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2 border-indigo-200 hover:bg-indigo-50 text-indigo-700 bg-white"
                >
                  {copiedParent ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedParent ? 'Copied!' : 'Copy Credentials'}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left mt-4 text-amber-800 text-xs flex gap-2">
              <span className="font-bold">⚠️ Warning:</span>
              <span>
                Please make sure to save these login credentials now. Passwords are encrypted on the server and cannot be retrieved in plain text later.
              </span>
            </div>

            <div className="pt-6 border-t flex justify-end">
              <Button onClick={handleDone} className="px-10">
                Done & Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Progress Bar */}
        <div className="flex items-center justify-center mb-8 ">
          <div className="flex items-center w-full max-w-2xl">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      step <= currentStep
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step}
                  </div>
                  <div className="mt-2 text-sm font-medium text-center">
                    {step === 1 && 'Student Details'}
                    {step === 2 && 'Parent Details'}
                    {step === 3 && 'Review & Submit'}
                  </div>
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                      step < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {formError && !isSuccess && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
            <p className="text-red-800 text-sm">{formError}</p>
          </div>
        )}

        {/* Step 1: Student Information */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Student Information</h3>
              <p className="text-muted-foreground">Please provide the student's personal details</p>
            </div>

            <Card className="w-full">
              <CardContent className="p-8">
                {/* Photo Upload Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 overflow-hidden">
                      {photoPreview ? (
                        <Image
                          src={photoPreview}
                          alt="Student photo"
                          className="w-full h-full object-cover"
                          fill
                          unoptimized
                        />
                      ) : (
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-xs text-gray-500">Student Photo</span>
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="studentPhoto" 
                      className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                    </label>
                    <input
                      id="studentPhoto"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Upload student photo (optional)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="studentFirstName">First Name *</Label>
                    <Input
                      id="studentFirstName"
                      value={formData.studentFirstName}
                      onChange={(e) => updateFormData('studentFirstName', e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentLastName">Last Name *</Label>
                    <Input
                      id="studentLastName"
                      value={formData.studentLastName}
                      onChange={(e) => updateFormData('studentLastName', e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  {/* Date of Birth, Gender, and Blood Group in same row */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Gender.MALE}>Male</SelectItem>
                          <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                          <SelectItem value={Gender.OTHER}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Select value={formData.bloodGroup} onValueChange={(value) => updateFormData('bloodGroup', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map((bloodGroup) => (
                            <SelectItem key={bloodGroup} value={bloodGroup}>
                              {bloodGroup}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentEmail">Email *</Label>
                    <Input
                      id="studentEmail"
                      type="email"
                      value={formData.studentEmail}
                      onChange={(e) => updateFormData('studentEmail', e.target.value)}
                      placeholder="student@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentPhone">Phone</Label>
                    <Input
                      id="studentPhone"
                      value={formData.studentPhone}
                      onChange={(e) => updateFormData('studentPhone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="classId">Class *</Label>
                      {!isLoadingClasses && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => loadClasses()}
                          className="h-6 px-2 text-xs"
                        >
                          <RefreshCcw className="h-3 w-3" />
                          Refresh
                        </Button>
                      )}
                    </div>
                    <Select 
                      value={formData.classId} 
                      onValueChange={(value) => updateFormData('classId', value)}
                      disabled={isLoadingClasses}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isLoadingClasses 
                            ? "Loading classes..." 
                            : classes.length === 0 
                              ? "No classes available"
                              : "Select class"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingClasses ? (
                          <SelectItem value="__loading__" disabled>
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading classes...
                            </div>
                          </SelectItem>
                        ) : classes.length === 0 ? (
                          <SelectItem value="__no_classes__" disabled>
                            No classes available
                          </SelectItem>
                        ) : (
                          classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {cls.name}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {isLoadingClasses && (
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading classes from database...
                      </p>
                    )}
                    {!isLoadingClasses && classes.length === 0 && (
                      <p className="text-xs text-orange-600">
                        ⚠️ No classes found. Please contact administration.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sectionId">Section *</Label>
                    <Select
                      value={formData.sectionId}
                      onValueChange={value => updateFormData('sectionId', value)}
                      disabled={sections.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={sections.length === 0 ? "Select class first" : "Select section"} />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.length === 0 ? (
                          <SelectItem value="__no_sections__" disabled>
                            No sections available
                          </SelectItem>
                        ) : (
                          sections.map(section => (
                            <SelectItem key={section.id} value={section.id}>
                              {section.displayName || section.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {sections.length === 0 && (
                      <p className="text-xs text-orange-600">
                        ⚠️ No sections found for this class.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rollNumberDisplay">Roll Number</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="rollNumberDisplay"
                        value={generatedRollNumber}
                        readOnly
                        placeholder={formData.sectionId ? "Generating..." : "Select class first"}
                        className="bg-muted"
                      />
                      {isGeneratingRoll && <Loader2 className="h-4 w-4 animate-spin" />}
                      {formData.sectionId && !isGeneratingRoll && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateRollNumber(formData.sectionId)}
                          className="px-3"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {!formData.sectionId && (
                      <p className="text-xs text-muted-foreground">
                        Roll number will be generated automatically when you select a class
                      </p>
                    )}
                    {generatedRollNumber && (
                      <p className="text-xs text-green-600">
                        ✅ Roll number generated successfully
                      </p>
                    )}
                  </div>
                  {/* Nationality, Birth Certificate No, and Religion in same row */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={(e) => updateFormData('nationality', e.target.value)}
                        placeholder="e.g., Bangladeshi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthCertificateNo">Birth Certificate No</Label>
                      <Input
                        id="birthCertificateNo"
                        value={formData.birthCertificateNo}
                        onChange={(e) => updateFormData('birthCertificateNo', e.target.value)}
                        placeholder="Enter birth certificate number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="religion">Religion</Label>
                      <Select value={formData.religion} onValueChange={(value) => updateFormData('religion', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select religion" />
                        </SelectTrigger>
                        <SelectContent>
                          {RELIGIONS.map((religion) => (
                            <SelectItem key={religion} value={religion}>
                              {religion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      placeholder="Enter complete address"
                      required
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previousSchool">Previous School</Label>
                    <Input
                      id="previousSchool"
                      value={formData.previousSchool}
                      onChange={(e) => updateFormData('previousSchool', e.target.value)}
                      placeholder="Previous school name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admissionDate">Admission Date *</Label>
                    <Input
                      id="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => updateFormData('admissionDate', e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="medicalInfo">Medical Information</Label>
                    <Textarea
                      id="medicalInfo"
                      value={formData.medicalInfo}
                      onChange={(e) => updateFormData('medicalInfo', e.target.value)}
                      placeholder="Any medical conditions, allergies, or special requirements"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Parent Information */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Parent/Guardian Information</h3>
              <p className="text-muted-foreground">Please provide the parent or guardian details</p>
            </div>

            <Card className="w-full">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="parentFirstName">First Name *</Label>
                    <Input
                      id="parentFirstName"
                      value={formData.parentFirstName}
                      onChange={(e) => updateFormData('parentFirstName', e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentLastName">Last Name *</Label>
                    <Input
                      id="parentLastName"
                      value={formData.parentLastName}
                      onChange={(e) => updateFormData('parentLastName', e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relation">Relation *</Label>
                    <Select value={formData.relation} onValueChange={(value) => updateFormData('relation', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONS.map((relation) => (
                          <SelectItem key={relation} value={relation}>
                            {relation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentGender">Gender *</Label>
                    <Select value={formData.parentGender} onValueChange={(value) => updateFormData('parentGender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Gender.MALE}>Male</SelectItem>
                        <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                        <SelectItem value={Gender.OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Email *</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => updateFormData('parentEmail', e.target.value)}
                      placeholder="parent@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Phone *</Label>
                    <Input
                      id="parentPhone"
                      value={formData.parentPhone}
                      onChange={(e) => updateFormData('parentPhone', e.target.value)}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                      placeholder="Emergency contact number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentAddress">Parent Address (if different)</Label>
                    <Textarea
                      id="parentAddress"
                      value={formData.parentAddress}
                      onChange={(e) => updateFormData('parentAddress', e.target.value)}
                      placeholder="Leave empty if same as student address"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Review & Confirm</h3>
              <p className="text-muted-foreground">Please review all information before submitting</p>
            </div>

            <Card className="w-full">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Student Details
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex flex-col items-center text-center mb-6">
                        {photoPreview ? (
                          <div className="relative w-24 h-24 overflow-hidden rounded-full border-2 border-gray-200 mb-2">
                            <Image
                              src={photoPreview}
                              alt="Student"
                              className="object-cover"
                              fill
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center mb-2">
                            <UserIcon className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-base">{formData.studentFirstName} {formData.studentLastName}</p>
                          <p className="text-sm text-muted-foreground">{formData.studentEmail}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Class:</span>
                          <p>{classes.find(c => c.id === formData.classId)?.name} - {classes.find(c => c.id === formData.classId)?.section}</p>
                        </div>
                        <div>
                          <span className="font-medium">Roll Number:</span>
                          <p>{generatedRollNumber}</p>
                        </div>
                        <div>
                          <span className="font-medium">Gender:</span>
                          <p>{formData.gender}</p>
                        </div>
                        <div>
                          <span className="font-medium">Religion:</span>
                          <p>{formData.religion || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="font-medium">Date of Birth:</span>
                          <p>{formData.dateOfBirth}</p>
                        </div>
                        <div>
                          <span className="font-medium">Nationality:</span>
                          <p>{formData.nationality}</p>
                        </div>
                        <div>
                          <span className="font-medium">Birth Certificate No:</span>
                          <p>{formData.birthCertificateNo || 'Not specified'}</p>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="text-muted-foreground">{formData.address}</p>
                      </div>
                      {formData.previousSchool && (
                        <div>
                          <span className="font-medium">Previous School:</span>
                          <p>{formData.previousSchool}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Parent Details
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium">{formData.parentFirstName} {formData.parentLastName}</p>
                        <p className="text-muted-foreground">{formData.relation}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">Email:</span>
                          <p>{formData.parentEmail}</p>
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span>
                          <p>{formData.parentPhone}</p>
                        </div>
                        <div>
                          <span className="font-medium">Gender:</span>
                          <p>{formData.parentGender}</p>
                        </div>
                        {formData.emergencyContact && (
                          <div>
                            <span className="font-medium">Emergency:</span>
                            <p>{formData.emergencyContact}</p>
                          </div>
                        )}
                      </div>
                      {formData.parentAddress && (
                        <div>
                          <span className="font-medium">Address:</span>
                          <p className="text-muted-foreground">{formData.parentAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium mb-2">Default Login Credentials</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Student Login Password: <span className="font-mono">student123</span></p>
                    <p>• Parent Login Password: <span className="font-mono">parent123</span></p>
                    <p>• Credentials will be sent to registered email addresses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-8"
          >
            Previous
          </Button>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-8"
            >
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep} className="px-8">
                Next
              </Button>
            ) : (
              <form onSubmit={handleFormSubmit} className="inline">
                <Button 
                  type="submit" 
                  disabled={isSuccess || isPending}
                  className="px-8"
                >
                  {isSuccess ? 'Submitted' : (isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null)}
                  Submit Admission
                </Button>
              </form>
            )}
          </div>
        </div>
        </>
      )}
      </DialogContent>
    </Dialog>
  );
} 