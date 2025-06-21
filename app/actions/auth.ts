'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const registerSchema = z.object({
  schoolName: z.string().min(3, 'School name must be at least 3 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Generate unique aamarId with timestamp and random suffix
function generateAamarId(): string {
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random characters
  return `AAMAR${timestamp}${random}`;
}

// Generate school code from school name
function generateSchoolCode(schoolName: string): string {
  // Take first 3 letters of each word, max 6 chars total
  const words = schoolName.split(' ').filter(word => word.length > 0);
  let code = '';
  
  for (const word of words) {
    if (code.length >= 6) break;
    const letters = word.replace(/[^a-zA-Z]/g, ''); // Remove non-letters
    code += letters.substring(0, Math.min(3, 6 - code.length));
  }
  
  // Ensure minimum 3 characters, pad with school name if needed
  if (code.length < 3) {
    const cleanName = schoolName.replace(/[^a-zA-Z]/g, '');
    code = cleanName.substring(0, 3);
  }
  
  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${code.toUpperCase()}${randomSuffix}`;
}

export async function registerSchoolAndAdmin(
  prevState: any,
  formData: FormData
) {
  const data = Object.fromEntries(formData.entries());

  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: 'Invalid form data',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { schoolName, firstName, lastName, email, password, phone } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: 'User with this email already exists' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const aamarId = generateAamarId();
    const schoolCode = generateSchoolCode(schoolName);

    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          aamarId,
          name: schoolName,
          code: schoolCode,
          address: 'To be updated', // Placeholder for setup page
          phone: 'To be updated',
          email: 'To be updated',
        },
      });

      const branch = await tx.branch.create({
        data: {
          aamarId,
          name: 'Main Campus',
          code: 'MAIN',
          address: 'To be updated', // Placeholder for setup page
          phone: 'To be updated',
          email: 'To be updated',
          schoolId: school.id,
        },
      });

      const user = await tx.user.create({
        data: {
          aamarId,
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role: UserRole.ADMIN,
          schoolId: school.id,
          branchId: branch.id,
          profile: {
            create: {
              aamarId,
              phone,
              email,
            },
          },
        },
      });
      
      return { school, branch, user };
    });

    revalidatePath('/');
    return { 
      success: true, 
      message: 'School and Admin account created successfully',
      schoolId: result.school.id,
      aamarId,
      redirectTo: '/school-setup'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An internal server error occurred' };
  }
}
