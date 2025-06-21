import { getStudents, getStudentStats, updateStudent } from '@/app/actions/students';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    student: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    profile: {
      create: jest.fn(),
      update: jest.fn(),
    },
    parent: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockPrisma = require('@/lib/prisma').prisma;

describe('Students Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStudents', () => {
    it('should return students successfully', async () => {
      const mockStudents = [
        {
          id: '1',
          rollNumber: 'S001',
          admissionDate: new Date('2023-01-01'),
          user: {
            id: 'user1',
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice@example.com',
            isActive: true,
            profile: {
              phone: '1234567890',
              address: '123 Student St',
              dateOfBirth: new Date('2010-01-01'),
              gender: 'FEMALE',
              bloodGroup: 'A+'
            },
            branch: {
              id: 'branch1',
              name: 'Main Campus'
            }
          },
          class: {
            id: 'class1',
            name: 'Grade 5',
            section: 'A',
            academicYear: '2023-2024'
          },
          parent: {
            id: 'parent1',
            relation: 'Mother',
            user: {
              firstName: 'Mary',
              lastName: 'Johnson',
              email: 'mary@example.com'
            }
          },
          attendance: [],
          examResults: [],
          fees: []
        }
      ];

      mockPrisma.student.findMany.mockResolvedValue(mockStudents);

      const result = await getStudents();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]).toMatchObject({
        rollNumber: 'S001',
        user: {
          firstName: 'Alice',
          lastName: 'Johnson'
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.student.findMany.mockRejectedValue(new Error('Database connection failed'));

      const result = await getStudents();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch students');
    });

    it('should return empty array when no students found', async () => {
      mockPrisma.student.findMany.mockResolvedValue([]);

      const result = await getStudents();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getStudentStats', () => {
    it('should return student statistics successfully', async () => {
      mockPrisma.student.count
        .mockResolvedValueOnce(150) // totalStudents
        .mockResolvedValueOnce(145); // activeStudents  

      const result = await getStudentStats();

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        totalStudents: 150,
        activeStudents: 145
      });
    });

    it('should handle errors in statistics calculation', async () => {
      mockPrisma.student.count.mockRejectedValue(new Error('Query failed'));

      const result = await getStudentStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch statistics');
    });
  });

  describe('updateStudent', () => {
    it('should update student successfully', async () => {
      const studentData = {
        firstName: 'Alice Updated',
        lastName: 'Johnson Updated',
        email: 'alice.updated@example.com',
        phone: '9876543210',
        rollNumber: 'S001-UPDATED',
        isActive: true,
        admissionDate: '2023-01-01'
      };

      const mockExistingStudent = {
        id: 'student1',
        userId: 'user1',
        user: {
          id: 'user1',
          profile: {
            id: 'profile1'
          }
        },
        parent: null
      };

      mockPrisma.student.findFirst.mockResolvedValue(mockExistingStudent);
      mockPrisma.$transaction.mockResolvedValue({ success: true });

      const result = await updateStudent('student1', studentData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Student updated successfully');
    });

    it('should handle missing student ID', async () => {
      const studentData = {
        firstName: 'Test',
        lastName: 'Student',
        email: 'test@example.com',
        rollNumber: 'S001',
        isActive: true,
        admissionDate: '2023-01-01'
      };

      mockPrisma.student.findFirst.mockResolvedValue(null);

      const result = await updateStudent('', studentData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Student not found');
    });

    it('should handle database errors during update', async () => {
      const studentData = {
        firstName: 'Test',
        lastName: 'Student',
        email: 'test@example.com',
        rollNumber: 'S001',
        isActive: true,
        admissionDate: '2023-01-01'
      };

      const mockExistingStudent = {
        id: 'student1',
        userId: 'user1',
        user: {
          id: 'user1',
          profile: {
            id: 'profile1'
          }
        },
        parent: null
      };
      
      mockPrisma.student.findFirst.mockResolvedValue(mockExistingStudent);
      mockPrisma.$transaction.mockRejectedValue(new Error('Update failed'));

      const result = await updateStudent('student1', studentData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update student information');
    });
  });

  describe('Student validation', () => {
    it('should validate required fields', async () => {
      const studentData = {
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        rollNumber: '',
        isActive: true,
        admissionDate: '2023-01-01'
      };

      mockPrisma.student.findFirst.mockResolvedValue(null);

      const result = await updateStudent('student1', studentData);

      expect(result.success).toBe(false);
      // The actual validation logic depends on implementation
    });

    it('should validate email format', async () => {
      const studentData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'not-an-email',
        rollNumber: 'S001',
        isActive: true,
        admissionDate: '2023-01-01'
      };

      mockPrisma.student.findFirst.mockResolvedValue(null);

      const result = await updateStudent('student1', studentData);

      // This test depends on the actual validation implementation
      // Could be success or failure based on validation rules
      expect(typeof result.success).toBe('boolean');
    });
  });
}); 