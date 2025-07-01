import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getClassesByAamarId } from "@/app/actions/classes";
import { getSectionsByClass } from "@/app/actions/sections";
import {
  getStudentDetails,
  updateStudentAdmission,
  generateRollNumber,
} from "@/app/actions/admission";
import { useBranch } from "@/contexts/branch-context";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  UserIcon,
  Users,
  GraduationCap,
  Upload,
  Camera,
  RefreshCcw,
} from "lucide-react";
import { Gender } from "@prisma/client";
import Image from "next/image";

const RELIGIONS = [
  "Islam",
  "Christian",
  "Hindu",
  "Buddha",
  "Jewish",
  "Sikh",
  "Other",
  "Prefer not to say",
];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const RELATIONS = [
  "Father",
  "Mother",
  "Guardian",
  "Grandfather",
  "Grandmother",
  "Uncle",
  "Aunt",
  "Brother",
  "Sister",
  "Other",
];

interface AdmissionEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string; // student id for edit mode
  onSuccess?: () => void;
}

export function AdmissionEditForm({
  open,
  onOpenChange,
  id,
  onSuccess,
}: AdmissionEditFormProps) {
  const { selectedBranch, branches } = useBranch();
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [className, setClassName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [originalClassId, setOriginalClassId] = useState("");
  const [originalSectionId, setOriginalSectionId] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [rollEditable, setRollEditable] = useState(false);

  useEffect(() => {
    if (open && id) {
      setLoading(true);
      getStudentDetails(id).then((result) => {
        if (result.success) {
          const d = result.data;
          setFormData({
            studentFirstName: d.student?.firstName || "",
            studentLastName: d.student?.lastName || "",
            studentEmail: d.student?.email || "",
            studentPhone: d.student?.phone || "",
            dateOfBirth: d.student?.dateOfBirth
              ? d.student.dateOfBirth.split("T")[0]
              : "",
            gender: d.gender || "",
            bloodGroup: d.bloodGroup || "",
            classId: "", // will set after classes load
            sectionId: "", // will set after sections load
            admissionDate: d.admissionDate ? d.admissionDate.split("T")[0] : "",
            address: d.address || "",
            nationality: d.nationality || "Bangladeshi",
            religion: d.religion || "",
            birthCertificateNo: d.birthCertificateNo || "",
            previousSchool: d.previousSchool || "",
            medicalInfo: d.medicalInfo || "",
            studentPhoto: null,
            parentFirstName: d.parent?.firstName || "",
            parentLastName: d.parent?.lastName || "",
            parentEmail: d.parent?.email || "",
            parentPhone: d.parent?.phone || "",
            parentGender: d.parentGender || "",
            relation: d.parent?.relation || "",
            parentAddress: d.parentAddress || "",
            emergencyContact: d.emergencyContact || "",
          });
          setClassName(d.class || "");
          setSectionName(d.section || "");
          setRollNumber(d.rollNumber || "");
          setRollEditable(false);
        }
        setLoading(false);
      });
    }
  }, [open, id]);

  useEffect(() => {
    if (open) loadClasses();
  }, [open]);

  useEffect(() => {
    // When classes load, set classId if not already set
    if (classes.length > 0 && className && !formData.classId) {
      const foundClass = classes.find(
        (c: any) =>
          c.name === className ||
          c.fullDisplayName === className ||
          c.displayName === className,
      );
      if (foundClass) {
        setFormData((prev: any) => ({ ...prev, classId: foundClass.id }));
      }
    }
  }, [classes, className]);

  useEffect(() => {
    if (formData.classId) {
      getSectionsByClass(formData.classId).then((result) => {
        if (result.success) {
          setSections(result.data ?? []);
        } else {
          setSections([]);
        }
      });
    } else {
      setSections([]);
    }
  }, [formData.classId]);

  useEffect(() => {
    // When sections load, set sectionId if not already set
    if (sections.length > 0 && sectionName && !formData.sectionId) {
      const foundSection = sections.find(
        (s: any) => s.name === sectionName || s.displayName === sectionName,
      );
      if (foundSection) {
        setFormData((prev: any) => ({ ...prev, sectionId: foundSection.id }));
      }
    }
  }, [sections, sectionName]);

  // Track original class/section after pre-select
  useEffect(() => {
    if (
      formData.classId &&
      formData.sectionId &&
      !originalClassId &&
      !originalSectionId
    ) {
      setOriginalClassId(formData.classId);
      setOriginalSectionId(formData.sectionId);
    }
  }, [
    formData.classId,
    formData.sectionId,
    originalClassId,
    originalSectionId,
  ]);

  // When class or section changes, check if different from original
  useEffect(() => {
    if (!formData.classId || !formData.sectionId) return;
    if (!originalClassId || !originalSectionId) return;
    if (
      formData.classId !== originalClassId ||
      formData.sectionId !== originalSectionId
    ) {
      // Class or section changed, generate new roll
      setRollEditable(true);
      generateRollNumber(formData.sectionId).then((newRoll) => {
        setRollNumber(newRoll);
      });
    } else {
      setRollEditable(false);
      // Reset to original roll if not changed
      getStudentDetails(id).then((result) => {
        if (result.success) setRollNumber(result.data.rollNumber || "");
      });
    }
  }, [
    formData.classId,
    formData.sectionId,
    originalClassId,
    originalSectionId,
    id,
  ]);

  const loadClasses = async () => {
    try {
      const result = await getClassesByAamarId();
      if (result.success) {
        setClasses(result.data);
      } else {
        setClasses([]);
      }
    } catch {
      setClasses([]);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev: any) => ({ ...prev, studentPhoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "studentPhoto" && value instanceof File) {
        submissionData.append(key, value);
      } else if (typeof value === "string") {
        submissionData.append(key, value);
      }
    });
    submissionData.append("rollNumber", rollNumber);
    try {
      await updateStudentAdmission(id, submissionData);
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update student admission.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle></DialogTitle>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            Loading student data...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <GraduationCap className="h-6 w-6" />
            Edit Student Admission
          </DialogTitle>
          <p className="text-muted-foreground mt-2 justify-center text-center">
            Update the admission information in 3 simple steps
          </p>
        </DialogHeader>
        {/* Progress Bar */}
        <div className="flex items-center justify-center mb-8 ">
          <div className="flex items-center w-full max-w-2xl">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      step <= currentStep
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                  <div className="mt-2 text-sm font-medium text-center">
                    {step === 1 && "Student Details"}
                    {step === 2 && "Parent Details"}
                    {step === 3 && "Review & Submit"}
                  </div>
                </div>
                {step < 3 && (
                  <div className="flex-1 h-1 bg-muted mx-2 rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-8">
          {/* Step 1: Student Details */}
          {currentStep === 1 && (
            <div>
              <div className="flex flex-col justify-center items-center mb-6">
                <h1 className="text-2xl font-bold">Student Information</h1>
                <p className="text-muted-foreground">
                  Edit the student's personal details
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:col-span-3 flex items-center gap-6">
                  <div className="space-y-2 w-full">
                    <Label>First Name *</Label>
                    <Input
                      name="studentFirstName"
                      value={formData.studentFirstName}
                      onChange={(e) =>
                        updateFormData("studentFirstName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label>Last Name *</Label>
                    <Input
                      name="studentLastName"
                      value={formData.studentLastName}
                      onChange={(e) =>
                        updateFormData("studentLastName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex items-center gap-6">
                  <div className="space-y-2 w-full">
                    <Label>Email *</Label>
                    <Input
                      name="studentEmail"
                      type="email"
                      value={formData.studentEmail}
                      onChange={(e) =>
                        updateFormData("studentEmail", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label>Phone</Label>
                    <Input
                      name="studentPhone"
                      value={formData.studentPhone}
                      onChange={(e) =>
                        updateFormData("studentPhone", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      updateFormData("dateOfBirth", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onValueChange={(val) => updateFormData("gender", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onValueChange={(val) => updateFormData("bloodGroup", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_GROUPS.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select
                    name="classId"
                    value={formData.classId}
                    onValueChange={(val) => updateFormData("classId", val)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.fullDisplayName || cls.displayName || cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Section *</Label>
                  <Select
                    name="sectionId"
                    value={formData.sectionId}
                    onValueChange={(val) => updateFormData("sectionId", val)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section: any) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.displayName || section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Roll Number</Label>
                  <Input
                    name="rollNumber"
                    value={rollNumber}
                    disabled={!rollEditable}
                    readOnly={!rollEditable}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Admission Date</Label>
                  <Input
                    name="admissionDate"
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) =>
                      updateFormData("admissionDate", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input
                    name="nationality"
                    value={formData.nationality}
                    onChange={(e) =>
                      updateFormData("nationality", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Religion</Label>
                  <Select
                    name="religion"
                    value={formData.religion}
                    onValueChange={(val) => updateFormData("religion", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELIGIONS.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Birth Certificate No</Label>
                  <Input
                    name="birthCertificateNo"
                    value={formData.birthCertificateNo}
                    onChange={(e) =>
                      updateFormData("birthCertificateNo", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Previous School</Label>
                  <Input
                    name="previousSchool"
                    value={formData.previousSchool}
                    onChange={(e) =>
                      updateFormData("previousSchool", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex items-center gap-6">
                  <div className="space-y-2 w-full">
                    <Label>Address</Label>
                    <Textarea
                      name="address"
                      value={formData.address}
                      onChange={(e) =>
                        updateFormData("address", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 w-full w-full">
                    <Label>Medical Info</Label>
                    <Textarea
                      name="medicalInfo"
                      value={formData.medicalInfo}
                      onChange={(e) =>
                        updateFormData("medicalInfo", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Step 2: Parent Details */}
          {currentStep === 2 && (
            <div>
              <div className="flex flex-col justify-center items-center mb-6">
                <h1 className="text-2xl font-bold">Parent Information</h1>
                <p className="text-muted-foreground">
                  Edit the parent's personal details
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:col-span-3 flex items-center gap-6">
                  <div className="space-y-2 w-full">
                    <Label>First Name *</Label>
                    <Input
                      name="parentFirstName"
                      value={formData.parentFirstName}
                      onChange={(e) =>
                        updateFormData("parentFirstName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 w-full">
                    <Label>Last Name *</Label>
                    <Input
                      name="parentLastName"
                      value={formData.parentLastName}
                      onChange={(e) =>
                        updateFormData("parentLastName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    name="parentEmail"
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) =>
                      updateFormData("parentEmail", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={(e) =>
                      updateFormData("parentPhone", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact</Label>
                  <Input
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) =>
                      updateFormData("emergencyContact", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    name="parentGender"
                    value={formData.parentGender}
                    onValueChange={(val) => updateFormData("parentGender", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Relation</Label>
                  <Select
                    name="relation"
                    value={formData.relation}
                    onValueChange={(val) => updateFormData("relation", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relation" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONS.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                  <Label>Address</Label>
                  <Textarea
                    name="parentAddress"
                    value={formData.parentAddress}
                    onChange={(e) =>
                      updateFormData("parentAddress", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}
          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Review Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Student Info</h4>
                      <div>
                        <b>Name:</b> {formData.studentFirstName}{" "}
                        {formData.studentLastName}
                      </div>
                      <div>
                        <b>Email:</b> {formData.studentEmail}
                      </div>
                      <div>
                        <b>Phone:</b> {formData.studentPhone}
                      </div>
                      <div>
                        <b>Date of Birth:</b> {formData.dateOfBirth}
                      </div>
                      <div>
                        <b>Gender:</b> {formData.gender}
                      </div>
                      <div>
                        <b>Blood Group:</b> {formData.bloodGroup}
                      </div>
                      <div>
                        <b>Class:</b>{" "}
                        {classes.find((c: any) => c.id === formData.classId)
                          ?.fullDisplayName || ""}
                      </div>
                      <div>
                        <b>Section:</b>{" "}
                        {sections.find((s: any) => s.id === formData.sectionId)
                          ?.displayName || ""}
                      </div>
                      <div>
                        <b>Admission Date:</b> {formData.admissionDate}
                      </div>
                      <div>
                        <b>Address:</b> {formData.address}
                      </div>
                      <div>
                        <b>Nationality:</b> {formData.nationality}
                      </div>
                      <div>
                        <b>Religion:</b> {formData.religion}
                      </div>
                      <div>
                        <b>Birth Certificate No:</b>{" "}
                        {formData.birthCertificateNo}
                      </div>
                      <div>
                        <b>Previous School:</b> {formData.previousSchool}
                      </div>
                      <div>
                        <b>Medical Info:</b> {formData.medicalInfo}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Parent Info</h4>
                      <div>
                        <b>Name:</b> {formData.parentFirstName}{" "}
                        {formData.parentLastName}
                      </div>
                      <div>
                        <b>Email:</b> {formData.parentEmail}
                      </div>
                      <div>
                        <b>Phone:</b> {formData.parentPhone}
                      </div>
                      <div>
                        <b>Gender:</b> {formData.parentGender}
                      </div>
                      <div>
                        <b>Relation:</b> {formData.relation}
                      </div>
                      <div>
                        <b>Address:</b> {formData.parentAddress}
                      </div>
                      <div>
                        <b>Emergency Contact:</b> {formData.emergencyContact}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Updating..." : "Update Student"}
                </Button>
              </div>
            </div>
          )}
          {/* Step Navigation */}
          {currentStep < 3 && (
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
