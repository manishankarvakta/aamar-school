import {
  getClasses,
  getClassesByAamarId,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassesByBranch,
  getClassesByTeacher,
  getClassStats,
  assignStudentsToClass,
  transferStudents,
  searchClasses,
  getAvailableTeachers,
  getAvailableSubjects,
  getClassCapacityInfo,
} from '@/app/actions/classes';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    class: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    teacher: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    subject: {
      findMany: jest.fn(),
    },
    student: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    branch: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockPrisma = require('@/lib/prisma').prisma;

describe('Classes Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClasses', () => {
    it('should fetch all classes successfully', async () => {
      const mockClasses = [
        {
          id: '1',
          name: 'Grade 10',
          section: 'A',
          academicYear: '2024-25',
          branchId: 'branch1',
          branch: { id: 'branch1', name: 'Main Branch' },
          teacher: { id: 'teacher1', user: { firstName: 'John', lastName: 'Doe' } },
          subjects: [{ id: 'sub1', name: 'Math' }],
          students: [],
          _count: { students: 35 },
        },
      ];

      mockPrisma.class.findMany.mockResolvedValue(mockClasses);

      const result = await getClasses();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockClasses);
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.class.findMany.mockRejectedValue(new Error('Database connection failed'));

      const result = await getClasses();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch classes');
    });
  });

  describe('getClassesByAamarId', () => {
    it('should fetch classes by aamarId successfully', async () => {
      const mockClasses = [
        {
          id: '1',
          name: 'Grade 10',
          section: 'A',
          aamarId: 'test123',
          academicYear: '2024-25',
          branchId: 'branch1',
          teacherId: 'teacher1',
          createdAt: new Date(),
          updatedAt: new Date(),
          branch: { id: 'branch1', name: 'Main Branch', address: '123 St', phone: '123456789' },
          teacher: { 
            id: 'teacher1', 
            userId: 'user1',
            qualification: 'M.Ed',
            experience: 5,
            subjects: ['Math'],
            user: { 
              firstName: 'John', 
              lastName: 'Doe',
              email: 'john@example.com',
              profile: { phone: '123456789' }
            }
          },
          subjects: [{ id: 'sub1', name: 'Math', code: 'M001', description: 'Mathematics' }],
          students: [{ 
            id: 'student1', 
            rollNumber: '001',
            user: { 
              id: 'user2',
              firstName: 'Jane', 
              lastName: 'Student',
              email: 'jane@example.com'
            }
          }],
          _count: { students: 1, subjects: 1, timetables: 0 },
        },
      ];

      mockPrisma.class.findMany.mockResolvedValue(mockClasses);

      const result = await getClassesByAamarId('test123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
    });

    it('should handle invalid aamarId', async () => {
      const result = await getClassesByAamarId('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid aamarId');
      expect(result.data).toEqual([]);
    });
  });

  describe('createClass', () => {
    it('should create a new class successfully', async () => {
      const formData = {
        name: 'Grade 10',
        section: 'A',
        academicYear: '2024-25',
        branchId: 'branch1',
        teacherId: 'teacher1',
        subjectIds: ['sub1', 'sub2'],
      };

      const mockCreatedClass = {
        id: '1',
        name: 'Grade 10',
        section: 'A',
        academicYear: '2024-25',
        branchId: 'branch1',
        teacherId: 'teacher1',
        branch: { name: 'Main Branch' },
        teacher: { user: { firstName: 'John', lastName: 'Doe' } },
        subjects: [{ id: 'sub1', name: 'Math' }],
        _count: { students: 0 },
      };

      // Mock checks
      mockPrisma.class.findFirst.mockResolvedValue(null); // No existing class
      mockPrisma.teacher.findUnique.mockResolvedValue({
        id: 'teacher1',
        user: { firstName: 'John', lastName: 'Doe' },
      });
      mockPrisma.class.findMany.mockResolvedValue([]); // Teacher not overloaded
      mockPrisma.class.create.mockResolvedValue(mockCreatedClass);

      const result = await createClass(formData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedClass);
      expect(result.message).toContain('created successfully');
    });

    it('should fail when required fields are missing', async () => {
      const formData = {
        name: '',
        section: 'A',
        academicYear: '2024-25',
        branchId: 'branch1',
      };

      const result = await createClass(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name, section, branch, and academic year are required');
    });

    it('should fail when class already exists', async () => {
      const formData = {
        name: 'Grade 10',
        section: 'A',
        academicYear: '2024-25',
        branchId: 'branch1',
      };

      mockPrisma.class.findFirst.mockResolvedValue({
        id: '1',
        name: 'Grade 10',
        section: 'A',
      });

      const result = await createClass(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Class already exists');
    });

    it('should fail when teacher does not exist', async () => {
      const formData = {
        name: 'Grade 10',
        section: 'A',
        academicYear: '2024-25',
        branchId: 'branch1',
        teacherId: 'nonexistent',
      };

      mockPrisma.class.findFirst.mockResolvedValue(null);
      mockPrisma.teacher.findUnique.mockResolvedValue(null);

      const result = await createClass(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Teacher not found');
    });

    it('should fail when teacher is overloaded', async () => {
      const formData = {
        name: 'Grade 10',
        section: 'A',
        academicYear: '2024-25',
        branchId: 'branch1',
        teacherId: 'teacher1',
      };

      mockPrisma.class.findFirst.mockResolvedValue(null);
      mockPrisma.teacher.findUnique.mockResolvedValue({
        id: 'teacher1',
        user: { firstName: 'John', lastName: 'Doe' },
      });
      // Teacher already has 3 classes
      mockPrisma.class.findMany.mockResolvedValue([1, 2, 3]);

      const result = await createClass(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Teacher overloaded');
    });
  });

  describe('updateClass', () => {
    it('should update class successfully', async () => {
      const formData = {
        name: 'Grade 10 Updated',
        section: 'A',
        academicYear: '2024-25',
        branchId: 'branch1',
      };

      const mockExistingClass = {
        id: 'class1',
        name: 'Grade 10',
        section: 'A',
        teacherId: null,
        subjectIds: [],
      };

      const mockUpdatedClass = {
        id: 'class1',
        name: 'Grade 10 Updated',
        section: 'A',
        branch: { name: 'Main Branch' },
        teacher: { user: { firstName: 'John', lastName: 'Doe' } },
        subjects: [],
        _count: { students: 35 },
      };

      // The updateClass function uses findFirst twice: first to check if class exists, then to check for duplicates
      mockPrisma.class.findFirst
        .mockResolvedValueOnce(mockExistingClass) // Class exists
        .mockResolvedValueOnce(null); // No duplicate
      mockPrisma.class.update.mockResolvedValue(mockUpdatedClass);

      const result = await updateClass('class1', formData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedClass);
      expect(result.message).toContain('updated successfully');
    });

    it('should fail when class not found', async () => {
      const formData = {
        name: 'Grade 10',
        section: 'A',
        academicYear: '2024-25',
        branchId: 'branch1',
      };

      mockPrisma.class.findFirst.mockResolvedValue(null);

      const result = await updateClass('nonexistent', formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Class not found');
    });
  });

  describe('deleteClass', () => {
    it('should delete class successfully', async () => {
      const mockClass = {
        id: 'class1',
        name: 'Grade 10',
        section: 'A',
        _count: { students: 0 }, // Required for the function logic
      };

      // The deleteClass function uses findFirst to check if class exists
      mockPrisma.class.findFirst.mockResolvedValue(mockClass);
      mockPrisma.class.delete.mockResolvedValue(mockClass);

      const result = await deleteClass('class1');

      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');
    });

    it('should fail when class not found', async () => {
      mockPrisma.class.findFirst.mockResolvedValue(null);

      const result = await deleteClass('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Class not found');
    });
  });

  describe('getClassStats', () => {
    it('should return class statistics successfully', async () => {
      const mockClasses = [
        {
          id: 'class1',
          name: 'Grade 10',
          section: 'A',
          academicYear: '2024-25',
          branch: { name: 'Main Branch' },
          _count: { students: 35 },
        },
        {
          id: 'class2',
          name: 'Grade 9',
          section: 'B',
          academicYear: '2024-25',
          branch: { name: 'Secondary Branch' },
          _count: { students: 30 },
        },
      ];

      mockPrisma.class.findMany.mockResolvedValue(mockClasses);

      const result = await getClassStats();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.class.findMany.mockRejectedValue(new Error('Database error'));

      const result = await getClassStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch class statistics');
    });
  });

  describe('searchClasses', () => {
    it('should search classes successfully', async () => {
      const mockClasses = [
        {
          id: '1',
          name: 'Grade 10',
          section: 'A',
          teacher: { user: { firstName: 'John', lastName: 'Doe' } },
        },
      ];

      mockPrisma.class.findMany.mockResolvedValue(mockClasses);

      const result = await searchClasses('Grade 10');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockClasses);
    });

    it('should handle empty search query', async () => {
      // The actual implementation doesn't validate empty queries
      mockPrisma.class.findMany.mockResolvedValue([]);

      const result = await searchClasses('');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('assignStudentsToClass', () => {
    it('should assign students to class successfully', async () => {
      const mockClass = {
        id: 'class1',
        name: 'Grade 10',
        section: 'A',
        capacity: 40,
        _count: { students: 30 },
      };

      mockPrisma.class.findFirst.mockResolvedValue(mockClass);
      mockPrisma.student.updateMany.mockResolvedValue({ count: 5 });

      const result = await assignStudentsToClass('class1', ['s1', 's2', 's3', 's4', 's5']);

      expect(result.success).toBe(true);
      expect(result.message).toContain('5 students assigned');
    });

    it('should fail when class not found', async () => {
      mockPrisma.class.findFirst.mockResolvedValue(null);

      const result = await assignStudentsToClass('nonexistent', ['s1', 's2']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Class not found');
    });
  });

  describe('getAvailableTeachers', () => {
    it('should return available teachers successfully', async () => {
      const mockTeachers = [
        {
          id: 'teacher1',
          userId: 'user1',
          qualification: 'M.Ed',
          experience: 5,
          subjects: ['Math'],
          user: { 
            firstName: 'John', 
            lastName: 'Doe',
            email: 'john@example.com',
            profile: { phone: '123456789' }
          },
          classes: [],
          _count: { classes: 0 },
        },
      ];

      mockPrisma.teacher.findMany.mockResolvedValue(mockTeachers);

      const result = await getAvailableTeachers();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
    });
  });

  describe('getAvailableSubjects', () => {
    it('should return available subjects successfully', async () => {
      const mockSubjects = [
        { id: 'sub1', name: 'Mathematics' },
        { id: 'sub2', name: 'Physics' },
      ];

      mockPrisma.subject.findMany.mockResolvedValue(mockSubjects);

      const result = await getAvailableSubjects();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSubjects);
    });
  });
}); 