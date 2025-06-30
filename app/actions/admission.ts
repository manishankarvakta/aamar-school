'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, getSessionData } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { UserRole, Gender } from '@prisma/client';

// Types based on Prisma schema
interface StudentAdmissionData {
  // Student Information
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone?: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup?: string;
  rollNumber: string;
  sectionId: string; // Changed from classId to sectionId as per schema
  admissionDate: string;
  address?: string;
  
  // Parent Information
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone?: string;
  parentGender: Gender;
  relation: string; // Father, Mother, Guardian
  parentAddress?: string;
  
  // Optional fields
  previousSchool?: string;
  medicalInfo?: string;
  emergencyContact?: string;
  nationality?: string;
  religion?: string;
  birthCertificateNo?: string;
}

interface AdmissionResult {
  success: boolean;
  message: string;
  data?: {
    studentId: string;
    parentId: string;
    applicationNo: string;
  };
}

/**
 * Create a new student admission with parent
 * Uses session-based multi-tenancy
 */
export async function createStudentWithParent(
  prevState: any,
  formData: FormData
): Promise<AdmissionResult> {
  console.log('🎓 Starting student admission process...');
  
  try {
    // Get session data for multi-tenancy
    const session = await requireAuth();
    console.log('✅ Session data retrieved:', {
      userId: session.userId,
      role: session.role,
      aamarId: session.aamarId,
      schoolId: session.schoolId,
      branchId: session.branchId
    });

    // Extract and validate section selection
    const selectedSectionId = formData.get('sectionId') as string;
    console.log('📝 Selected section ID:', selectedSectionId);
    
    if (!selectedSectionId) {
      console.log('❌ No section selected');
      return {
        success: false,
        message: 'Please select a section'
      };
    }

    // Fetch the section with its class, branch and school information
    console.log('🔍 Fetching section details...');
    const selectedSection = await prisma.section.findUnique({
      where: { 
        id: selectedSectionId,
        aamarId: session.aamarId // Multi-tenant filter
      },
      include: {
        class: {
          include: {
            branch: {
              include: {
                school: true
              }
            }
          }
        }
      }
    });

    console.log('📊 Section details:', selectedSection ? {
      sectionId: selectedSection.id,
      sectionName: selectedSection.name,
      className: selectedSection.class.name,
      branchName: selectedSection.class.branch.name,
      schoolName: selectedSection.class.branch.school.name
    } : 'Not found');

    if (!selectedSection) {
      console.log('❌ Selected section not found or not accessible');
      return {
        success: false,
        message: 'Selected section not found or not accessible'
      };
    }

    // Extract form data
    console.log('📋 Extracting form data...');
    const data: StudentAdmissionData = {
      // Student data
      studentFirstName: formData.get('studentFirstName') as string,
      studentLastName: formData.get('studentLastName') as string,
      studentEmail: formData.get('studentEmail') as string,
      studentPhone: formData.get('studentPhone') as string,
      dateOfBirth: formData.get('dateOfBirth') as string,
      gender: formData.get('gender') as Gender,
      bloodGroup: formData.get('bloodGroup') as string,
      rollNumber: formData.get('rollNumber') as string,
      sectionId: selectedSectionId,
      admissionDate: formData.get('admissionDate') as string,
      address: formData.get('address') as string,
      
      // Parent data
      parentFirstName: formData.get('parentFirstName') as string,
      parentLastName: formData.get('parentLastName') as string,
      parentEmail: formData.get('parentEmail') as string,
      parentPhone: formData.get('parentPhone') as string,
      parentGender: formData.get('parentGender') as Gender,
      relation: formData.get('relation') as string,
      parentAddress: formData.get('parentAddress') as string || formData.get('address') as string,
      
      // Optional fields
      previousSchool: formData.get('previousSchool') as string,
      medicalInfo: formData.get('medicalInfo') as string,
      emergencyContact: formData.get('emergencyContact') as string,
      nationality: formData.get('nationality') as string || 'Bangladeshi',
      religion: formData.get('religion') as string || 'Islam',
      birthCertificateNo: formData.get('birthCertificateNo') as string,
    };

    console.log('📝 Extracted form data:', {
      studentName: `${data.studentFirstName} ${data.studentLastName}`,
      studentEmail: data.studentEmail,
      parentName: `${data.parentFirstName} ${data.parentLastName}`,
      parentEmail: data.parentEmail,
      rollNumber: data.rollNumber,
      gender: data.gender,
      relation: data.relation
    });

    // Validate required fields
    console.log('✅ Validating required fields...');
    const requiredFields = [
      'studentFirstName', 'studentLastName', 'studentEmail', 'dateOfBirth', 
      'gender', 'rollNumber', 'sectionId', 'admissionDate',
      'parentFirstName', 'parentLastName', 'parentEmail', 'relation'
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof StudentAdmissionData]) {
        console.log(`❌ Missing required field: ${field}`);
        return {
          success: false,
          message: `${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`
        };
      }
    }
    console.log('✅ All required fields validated');

    // Validate email formats
    console.log('📧 Validating email formats...');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.studentEmail)) {
      console.log('❌ Invalid student email format:', data.studentEmail);
      return {
        success: false,
        message: 'Invalid student email format'
      };
    }
    
    if (!emailRegex.test(data.parentEmail)) {
      console.log('❌ Invalid parent email format:', data.parentEmail);
      return {
        success: false,
        message: 'Invalid parent email format'
      };
    }
    console.log('✅ Email formats validated');

    // Check if emails already exist (within the same organization)
    console.log('🔍 Checking for existing emails...');
    const existingUserByStudentEmail = await prisma.user.findFirst({
      where: { 
        email: data.studentEmail,
        aamarId: session.aamarId
      }
    });

    if (existingUserByStudentEmail) {
      console.log('❌ Student email already exists:', data.studentEmail);
      return {
        success: false,
        message: 'Student email already exists in this organization'
      };
    }

    const existingUserByParentEmail = await prisma.user.findFirst({
      where: { 
        email: data.parentEmail,
        aamarId: session.aamarId
      }
    });

    if (existingUserByParentEmail) {
      console.log('❌ Parent email already exists:', data.parentEmail);
      return {
        success: false,
        message: 'Parent email already exists in this organization'
      };
    }
    console.log('✅ Email uniqueness validated');

    // Check if roll number already exists in the section
    console.log('🔍 Checking roll number uniqueness...');
    const existingStudent = await prisma.student.findFirst({
      where: {
        rollNumber: data.rollNumber,
        sectionId: data.sectionId,
        aamarId: session.aamarId
      }
    });

    if (existingStudent) {
      console.log('❌ Roll number already exists:', data.rollNumber);
      return {
        success: false,
        message: 'Roll number already exists in this section'
      };
    }
    console.log('✅ Roll number uniqueness validated');

    // Generate application number
    const applicationNo = `ADM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    console.log('📄 Generated application number:', applicationNo);

    // Start database transaction
    console.log('💾 Starting database transaction...');
    const result = await prisma.$transaction(async (tx) => {
      console.log('👤 Creating parent user...');
      
      // Create Parent User
      const parentUser = await tx.user.create({
        data: {
          aamarId: session.aamarId,
          email: data.parentEmail,
          password: 'parent123', // Default password - should be changed on first login
          firstName: data.parentFirstName,
          lastName: data.parentLastName,
          role: UserRole.PARENT,
          schoolId: selectedSection.class.branch.school.id,
          branchId: selectedSection.class.branch.id,
          profile: {
            create: {
              aamarId: session.aamarId,
              email: data.parentEmail,
              phone: data.parentPhone,
              address: data.parentAddress,
              gender: data.parentGender,
              nationality: data.nationality,
              religion: data.religion,
            },
          },
          parent: {
            create: {
              aamarId: session.aamarId,
              relation: data.relation,
            },
          },
        },
        include: { parent: true },
      });

      console.log('✅ Parent user created:', {
        userId: parentUser.id,
        parentId: parentUser.parent?.id,
        email: parentUser.email,
        name: `${parentUser.firstName} ${parentUser.lastName}`
      });

      console.log('👨‍🎓 Creating student user...');
      
      // Create Student User
      const studentUser = await tx.user.create({
        data: {
          aamarId: session.aamarId,
          email: data.studentEmail,
          password: 'student123', // Default password - should be changed on first login
          firstName: data.studentFirstName,
          lastName: data.studentLastName,
          role: UserRole.STUDENT,
          schoolId: selectedSection.class.branch.school.id,
          branchId: selectedSection.class.branch.id,
          profile: {
            create: {
              aamarId: session.aamarId,
              email: data.studentEmail,
              phone: data.studentPhone,
              address: data.address,
              dateOfBirth: new Date(data.dateOfBirth),
              gender: data.gender,
              bloodGroup: data.bloodGroup,
              nationality: data.nationality,
              religion: data.religion,
              birthCertificateNo: data.birthCertificateNo,
            },
          },
          student: {
            create: {
              aamarId: session.aamarId,
              rollNumber: data.rollNumber,
              admissionDate: new Date(data.admissionDate),
              sectionId: data.sectionId,
              classId: selectedSection.class.id,
              parentId: parentUser.parent!.id,
            },
          },
        },
        include: { student: true },
      });

      console.log('✅ Student user created:', {
        userId: studentUser.id,
        studentId: studentUser.student?.id,
        email: studentUser.email,
        name: `${studentUser.firstName} ${studentUser.lastName}`,
        rollNumber: studentUser.student?.rollNumber
      });

      return {
        parentUser,
        studentUser,
        applicationNo
      };
    });

    console.log('🎉 Transaction completed successfully!');
    console.log('📊 Final result:', {
      studentId: result.studentUser.student?.id,
      parentId: result.parentUser.parent?.id,
      applicationNo: result.applicationNo
    });

    // Revalidate relevant paths
    revalidatePath('/dashboard/admissions');
    revalidatePath('/dashboard/students');
    revalidatePath('/dashboard/parents');

    return {
      success: true,
      message: `Student admission successful! Application No: ${result.applicationNo}`,
      data: {
        studentId: result.studentUser.student!.id,
        parentId: result.parentUser.parent!.id,
        applicationNo: result.applicationNo
      }
    };

  } catch (error) {
    console.error('❌ Error in student admission:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create student admission'
    };
  }
}

/**
 * Get all classes for the current organization
 */
export async function getClasses() {
  console.log('📚 Getting classes...');
  
  try {
    const session = await requireAuth();
    console.log('✅ Session data for classes:', {
      aamarId: session.aamarId,
      role: session.role
    });

    const classes = await prisma.class.findMany({
      where: {
        aamarId: session.aamarId
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        sections: {
          select: {
            id: true,
            name: true,
            displayName: true,
            capacity: true,
            _count: {
              select: {
                students: true
              }
            }
          }
        },
        _count: {
          select: {
            sections: true
          }
        }
      },
      orderBy: [
        { branch: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    console.log('📊 Classes retrieved:', {
      count: classes.length,
      classes: classes.map(c => ({
        id: c.id,
        name: c.name,
        branch: c.branch.name,
        sectionsCount: c._count.sections,
        teacher: c.teacher ? `${c.teacher.user.firstName} ${c.teacher.user.lastName}` : 'Not assigned'
      }))
    });

    return classes;
  } catch (error) {
    console.error('❌ Error getting classes:', error);
    throw new Error('Failed to fetch classes');
  }
}

/**
 * Get sections by class ID
 */
export async function getSectionsByClass(classId: string) {
  console.log('📝 Getting sections for class:', classId);
  
  try {
    const session = await requireAuth();
    console.log('✅ Session data for sections:', {
      aamarId: session.aamarId,
      classId
    });

    const sections = await prisma.section.findMany({
      where: {
        classId,
        aamarId: session.aamarId
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            branch: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('📊 Sections retrieved:', {
      classId,
      count: sections.length,
      sections: sections.map(s => ({
        id: s.id,
        name: s.name,
        displayName: s.displayName,
        capacity: s.capacity,
        currentStudents: s._count.students,
        available: s.capacity - s._count.students
      }))
    });

    return sections;
  } catch (error) {
    console.error('❌ Error getting sections:', error);
    throw new Error('Failed to fetch sections');
  }
}

/**
 * Get all sections for admission form
 */
export async function getAllSections() {
  console.log('📝 Getting all sections...');
  
  try {
    const session = await requireAuth();
    console.log('✅ Session data for all sections:', {
      aamarId: session.aamarId
    });

    const sections = await prisma.section.findMany({
      where: {
        aamarId: session.aamarId
      },
      include: {
        class: {
          include: {
            branch: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: [
        { class: { branch: { name: 'asc' } } },
        { class: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    console.log('📊 All sections retrieved:', {
      count: sections.length,
      byBranch: sections.reduce((acc, section) => {
        const branchName = section.class.branch.name;
        if (!acc[branchName]) acc[branchName] = 0;
        acc[branchName]++;
        return acc;
      }, {} as Record<string, number>)
    });

    return sections;
  } catch (error) {
    console.error('❌ Error getting all sections:', error);
    throw new Error('Failed to fetch sections');
  }
}

/**
 * Generate next available roll number for a section
 */
export async function generateRollNumber(sectionId: string): Promise<string> {
  console.log('🔢 Generating roll number for section:', sectionId);
  
  try {
    const session = await requireAuth();
    console.log('✅ Session data for roll number generation:', {
      aamarId: session.aamarId,
      sectionId
    });

    // Get section details
    const section = await prisma.section.findUnique({
      where: {
        id: sectionId,
        aamarId: session.aamarId
      },
      include: {
        class: {
          select: {
            name: true
          }
        }
      }
    });

    if (!section) {
      console.log('❌ Section not found:', sectionId);
      throw new Error('Section not found');
    }

    // Get the highest roll number in this section
    const lastStudent = await prisma.student.findFirst({
      where: {
        sectionId,
        aamarId: session.aamarId
      },
      orderBy: {
        rollNumber: 'desc'
      },
      select: {
        rollNumber: true
      }
    });

    console.log('📊 Last student roll number:', lastStudent?.rollNumber);

    // Generate new roll number
    let nextNumber = 1;
    if (lastStudent?.rollNumber) {
      // Extract number from roll number (assuming format like "2024001", "2024002", etc.)
      const match = lastStudent.rollNumber.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const currentYear = new Date().getFullYear();
    const rollNumber = `${currentYear}${String(nextNumber).padStart(3, '0')}`;

    console.log('✅ Generated roll number:', {
      sectionId,
      sectionName: `${section.class.name} ${section.name}`,
      rollNumber,
      nextNumber
    });

    return rollNumber;
  } catch (error) {
    console.error('❌ Error generating roll number:', error);
    throw new Error('Failed to generate roll number');
  }
}

/**
 * Get admission applications/students
 */
export async function getAdmissionApplications() {
  console.log('📋 Getting admission applications...');
  
  try {
    const session = await requireAuth();
    console.log('✅ Session data for applications:', {
      aamarId: session.aamarId
    });

    const students = await prisma.student.findMany({
      where: {
        aamarId: session.aamarId
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        section: {
          include: {
            class: {
              include: {
                branch: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        parent: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('📊 Applications retrieved:', {
      count: students.length,
      recentApplications: students.slice(0, 3).map(s => ({
        name: `${s.user.firstName} ${s.user.lastName}`,
        rollNumber: s.rollNumber,
        section: `${s.section.class.name} ${s.section.name}`,
        admissionDate: s.admissionDate
      }))
    });

    return students.map(student => ({
      id: student.id,
      applicationNo: `ADM-${student.rollNumber}`,
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      rollNumber: student.rollNumber,
      class: student.section.class.name,
      section: student.section.name,
      branch: student.section.class.branch.name,
      admissionDate: student.admissionDate,
      parentName: student.parent ? `${student.parent.user.firstName} ${student.parent.user.lastName}` : 'N/A',
      parentEmail: student.parent?.user.email || 'N/A',
      parentPhone: student.parent?.user.profile?.phone || 'N/A',
      studentEmail: student.user.email,
      studentPhone: student.user.profile?.phone || 'N/A',
      address: student.user.profile?.address || 'N/A',
      status: 'Approved', // Since they're already admitted
      dateOfBirth: student.user.profile?.dateOfBirth,
      gender: student.user.profile?.gender,
    }));
  } catch (error) {
    console.error('❌ Error getting admission applications:', error);
    throw new Error('Failed to fetch admission applications');
  }
}

/**
 * Get admission statistics
 */
export async function getAdmissionStats() {
  console.log('📊 Getting admission statistics...');
  
  try {
    const session = await requireAuth();
    console.log('✅ Session data for stats:', {
      aamarId: session.aamarId
    });

    // Get all students for the organization
    const students = await prisma.student.findMany({
      where: {
        aamarId: session.aamarId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        section: {
          include: {
            class: {
              include: {
                branch: true,
              },
            },
          },
        },
      },
    });

    console.log('📈 Students data for stats:', {
      totalStudents: students.length
    });

    // Calculate statistics
    const totalStudents = students.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthAdmissions = students.filter(student => {
      const admissionDate = new Date(student.admissionDate);
      return admissionDate.getMonth() === currentMonth && 
             admissionDate.getFullYear() === currentYear;
    }).length;

    // Group by class
    const classCounts = students.reduce((acc: Record<string, number>, student) => {
      const className = `${student.section.class.name} ${student.section.name}`;
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {});

    // Group by branch
    const branchCounts = students.reduce((acc: Record<string, number>, student) => {
      const branchName = student.section.class.branch.name;
      acc[branchName] = (acc[branchName] || 0) + 1;
      return acc;
    }, {});

    // Group by gender
    const genderCounts = students.reduce((acc: Record<string, number>, student) => {
      const gender = student.user.profile?.gender || 'Not specified';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    // Recent admissions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAdmissions = students.filter(student => 
      new Date(student.admissionDate) >= thirtyDaysAgo
    ).length;

    const stats = {
      totalStudents,
      thisMonthAdmissions,
      recentAdmissions,
      activeStudents: totalStudents, // All students are considered active
      classCounts,
      branchCounts,
      genderCounts,
    };

    console.log('📊 Statistics calculated:', stats);

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('❌ Error getting admission stats:', error);
    return {
      success: false,
      message: 'Failed to fetch admission statistics'
    };
  }
}

/**
 * Search admission applications
 */
export async function searchAdmissions(query: string) {
  console.log('🔍 Searching admissions with query:', query);
  
  try {
    const session = await requireAuth();
    console.log('✅ Session data for search:', {
      aamarId: session.aamarId,
      query
    });

    if (!query || query.trim().length < 2) {
      console.log('❌ Query too short:', query);
      return [];
    }

    const searchTerm = query.trim().toLowerCase();

    const students = await prisma.student.findMany({
      where: {
        aamarId: session.aamarId,
        OR: [
          {
            user: {
              firstName: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              lastName: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          },
          {
            user: {
              email: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          },
          {
            rollNumber: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        section: {
          include: {
            class: {
              include: {
                branch: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        parent: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20 // Limit results
    });

    console.log('📊 Search results:', {
      query: searchTerm,
      count: students.length,
      results: students.slice(0, 3).map(s => ({
        name: `${s.user.firstName} ${s.user.lastName}`,
        rollNumber: s.rollNumber,
        email: s.user.email
      }))
    });

    return students.map(student => ({
      id: student.id,
      applicationNo: `ADM-${student.rollNumber}`,
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      rollNumber: student.rollNumber,
      class: student.section.class.name,
      section: student.section.name,
      branch: student.section.class.branch.name,
      admissionDate: student.admissionDate,
      parentName: student.parent ? `${student.parent.user.firstName} ${student.parent.user.lastName}` : 'N/A',
      parentEmail: student.parent?.user.email || 'N/A',
      studentEmail: student.user.email,
      status: 'Approved',
    }));
  } catch (error) {
    console.error('❌ Error searching admissions:', error);
    throw new Error('Failed to search admissions');
  }
}

/**
 * Get student details by ID
 */
export async function getStudentDetails(studentId: string) {
  console.log('👨‍🎓 Getting student details for ID:', studentId);
  
  try {
    const session = await requireAuth();
    console.log('✅ Session data for student details:', {
      aamarId: session.aamarId,
      studentId
    });

    const student = await prisma.student.findUnique({
      where: {
        id: studentId,
        aamarId: session.aamarId
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        section: {
          include: {
            class: {
              include: {
                branch: {
                  include: {
                    school: true
                  }
                }
              }
            }
          }
        },
        parent: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      console.log('❌ Student not found:', studentId);
      throw new Error('Student not found');
    }

    console.log('📊 Student details retrieved:', {
      studentId: student.id,
      name: `${student.user.firstName} ${student.user.lastName}`,
      rollNumber: student.rollNumber,
      section: `${student.section.class.name} ${student.section.name}`,
      branch: student.section.class.branch.name
    });

    return {
      id: student.id,
      applicationNo: `ADM-${student.rollNumber}`,
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      rollNumber: student.rollNumber,
      class: student.section.class.name,
      section: student.section.name,
      branch: student.section.class.branch.name,
      school: student.section.class.branch.school.name,
      admissionDate: student.admissionDate,
      parentName: student.parent ? `${student.parent.user.firstName} ${student.parent.user.lastName}` : 'N/A',
      parentEmail: student.parent?.user.email || 'N/A',
      parentPhone: student.parent?.user.profile?.phone || 'N/A',
      parentRelation: student.parent?.relation || 'N/A',
      studentEmail: student.user.email,
      studentPhone: student.user.profile?.phone || 'N/A',
      address: student.user.profile?.address || 'N/A',
      dateOfBirth: student.user.profile?.dateOfBirth,
      gender: student.user.profile?.gender,
      bloodGroup: student.user.profile?.bloodGroup,
      nationality: student.user.profile?.nationality,
      religion: student.user.profile?.religion,
      birthCertificateNo: student.user.profile?.birthCertificateNo,
      status: 'Active',
    };
  } catch (error) {
    console.error('❌ Error getting student details:', error);
    throw new Error('Failed to fetch student details');
  }
} 