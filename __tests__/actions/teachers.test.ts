import { getTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher } from '@/app/actions/teachers';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    teacher: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    profile: {
      create: jest.fn(),
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

describe('Teachers Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTeachers', () => {
    it('should return teachers successfully', async () => {
      const mockTeachers = [
        {
          id: '1',
          qualification: 'M.Ed',
          experience: 5,
          subjects: ['Math', 'Physics'],
          createdAt: new Date('2023-01-01'),
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            profile: {
              phone: '1234567890'
            },
            branch: {
              id: 'branch1',
              name: 'Main Campus',
              school: {
                name: 'Test School'
              }
            }
          },
          classes: [],
          _count: {
            classes: 3
          }
        }
      ];

      mockPrisma.teacher.count.mockResolvedValue(1);
      mockPrisma.teacher.findMany.mockResolvedValue(mockTeachers);

      const result = await getTeachers('234567', 1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        email: 'john@example.com'
      });
    });

    it('should handle errors gracefully', async () => {
      mockPrisma.teacher.count.mockRejectedValue(new Error('Database error'));

      const result = await getTeachers('234567');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch teachers');
    });
  });

  describe('getTeacherById', () => {
    it('should return teacher details successfully', async () => {
      const mockTeacher = {
        id: '1',
        qualification: 'M.Ed',
        experience: 5,
        subjects: ['Math', 'Physics'],
        createdAt: new Date('2023-01-01'),
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          profile: {
            phone: '1234567890',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'MALE',
            address: '123 Main St',
            nationality: 'US',
            religion: 'Christian',
            bloodGroup: 'O+'
          },
          branch: {
            id: 'branch1',
            name: 'Main Campus',
            school: {
              name: 'Test School'
            }
          }
        },
        classes: [],
        _count: {
          classes: 3
        }
      };

      mockPrisma.teacher.findUnique.mockResolvedValue(mockTeacher);

      const result = await getTeacherById('1');

      expect(result.success).toBe(true);
      expect(result.data.teacher.firstName).toBe('John');
      expect(result.data.professional.qualification).toBe('M.Ed');
    });

    it('should return error for non-existent teacher', async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(null);

      const result = await getTeacherById('999');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Teacher not found');
    });
  });

  describe('createTeacher', () => {
    it('should create teacher successfully', async () => {
      const formData = new FormData();
      formData.append('firstName', 'Jane');
      formData.append('lastName', 'Smith');
      formData.append('email', 'jane@example.com');
      formData.append('qualification', 'B.Ed');
      formData.append('experience', '3');
      formData.append('specialization', 'Mathematics');
      formData.append('branchId', 'branch1');
      formData.append('aamarId', '234567');

      const mockUser = {
        id: 'user1',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      };

      const mockTeacher = {
        id: 'teacher1',
        userId: 'user1',
        qualification: 'B.Ed',
        experience: 3,
        subjects: ['Mathematics']
      };

      mockPrisma.user.findUnique.mockResolvedValue(null); // Email doesn't exist
      mockPrisma.$transaction.mockResolvedValue({
        user: mockUser,
        teacher: mockTeacher
      });

      const result = await createTeacher(formData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('created successfully');
    });

    it('should handle validation errors', async () => {
      const formData = new FormData();
      formData.append('firstName', '');
      formData.append('email', 'invalid-email');

      const result = await createTeacher(formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Required fields are missing');
    });
  });

  describe('updateTeacher', () => {
    it('should update teacher successfully', async () => {
      const formData = new FormData();
      formData.append('firstName', 'John Updated');
      formData.append('lastName', 'Doe Updated');
      formData.append('email', 'john.updated@example.com');
      formData.append('qualification', 'M.Ed Updated');
      formData.append('experience', '6');

      // Mock finding the teacher with proper structure
      const mockExistingTeacher = {
        id: 'teacher1',
        userId: 'user1',
        subjects: ['Math'],
        user: {
          id: 'user1',
          firstName: 'John',
          lastName: 'Doe',
          profile: { 
            id: 'profile1',
            userId: 'user1'
          }
        }
      };

      mockPrisma.teacher.findUnique.mockResolvedValue(mockExistingTeacher);
      mockPrisma.$transaction.mockResolvedValue(mockExistingTeacher);

      const result = await updateTeacher('teacher1', formData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('updated successfully');
    });
  });

  describe('deleteTeacher', () => {
    it('should delete teacher successfully', async () => {
      const mockTeacher = {
        id: 'teacher1',
        userId: 'user1'
      };

      mockPrisma.teacher.findUnique.mockResolvedValue(mockTeacher);
      mockPrisma.$transaction.mockResolvedValue(mockTeacher);

      const result = await deleteTeacher('teacher1');

      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');
    });

    it('should handle non-existent teacher deletion', async () => {
      mockPrisma.teacher.findUnique.mockResolvedValue(null);
      // Mock the transaction to throw an error when teacher is not found
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback({
          teacher: {
            findUnique: jest.fn().mockResolvedValue(null)
          }
        });
      });

      const result = await deleteTeacher('999');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Teacher not found');
    });
  });
}); 