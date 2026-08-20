'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function getLibraryData() {
  try {
    const session = await requireAuth();

    // 1. Fetch all books
    const books = await prisma.book.findMany({
      where: { aamarId: session.aamarId },
      orderBy: { title: 'asc' },
    });

    // 2. Fetch all active borrowings (returnDate is null) and past borrowings
    const borrowings = await prisma.bookBorrowing.findMany({
      where: { aamarId: session.aamarId },
      include: {
        book: true,
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profile: {
                  select: {
                    avatar: true,
                  },
                },
              },
            },
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { borrowDate: 'desc' },
    });

    // 3. Fetch list of all students in the branch/school to populate the issue book dropdown
    const students = await prisma.student.findMany({
      where: { aamarId: session.aamarId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { rollNumber: 'asc' },
    });

    return {
      success: true,
      data: {
        books: books.map((b) => ({
          id: b.id,
          isbn: b.isbn,
          title: b.title,
          author: b.author,
          quantity: b.quantity,
          available: b.available,
        })),
        borrowings: borrowings.map((br) => ({
          id: br.id,
          bookId: br.bookId,
          bookTitle: br.book.title,
          studentId: br.student.id,
          studentRoll: br.student.rollNumber,
          studentName: `${br.student.user.firstName} ${br.student.user.lastName}`,
          className: br.student.class.name,
          avatar: br.student.user.profile?.avatar || '',
          borrowDate: br.borrowDate.toISOString().split('T')[0],
          returnDate: br.returnDate ? br.returnDate.toISOString().split('T')[0] : null,
          dueDate: new Date(br.borrowDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days default due date
        })),
        students: students.map((s) => ({
          id: s.id,
          name: `${s.user.firstName} ${s.user.lastName}`,
          className: s.class.name,
          rollNumber: s.rollNumber,
        })),
      },
    };
  } catch (error) {
    console.error('Error fetching library data:', error);
    return { success: false, error: 'Failed to fetch library data.' };
  }
}

export async function addBook(data: {
  title: string;
  author: string;
  isbn: string;
  quantity: number;
}) {
  try {
    const session = await requireAuth();

    const newBook = await prisma.book.create({
      data: {
        aamarId: session.aamarId,
        schoolId: session.schoolId,
        title: data.title,
        author: data.author,
        isbn: data.isbn,
        quantity: data.quantity,
        available: data.quantity, // all copies initially available
      },
    });

    revalidatePath('/dashboard/library');
    return { success: true, data: newBook };
  } catch (error) {
    console.error('Error adding book:', error);
    return { success: false, error: 'Failed to add book. Please verify inputs.' };
  }
}

export async function deleteBook(id: string) {
  try {
    const session = await requireAuth();

    // Check if there are active borrowings for this book
    const activeBorrowings = await prisma.bookBorrowing.findFirst({
      where: {
        bookId: id,
        returnDate: null,
        aamarId: session.aamarId,
      },
    });

    if (activeBorrowings) {
      return {
        success: false,
        error: 'This book cannot be deleted because it is currently borrowed by a student.',
      };
    }

    await prisma.book.delete({
      where: { id },
    });

    revalidatePath('/dashboard/library');
    return { success: true };
  } catch (error) {
    console.error('Error deleting book:', error);
    return { success: false, error: 'Failed to delete book.' };
  }
}

export async function issueBook(data: {
  studentId: string;
  bookId: string;
}) {
  try {
    const session = await requireAuth();

    // Check if book has available copies
    const book = await prisma.book.findUnique({
      where: { id: data.bookId },
    });

    if (!book || book.available <= 0) {
      return { success: false, error: 'No copies of this book are currently available to borrow.' };
    }

    // Create borrowing
    const borrowing = await prisma.bookBorrowing.create({
      data: {
        aamarId: session.aamarId,
        studentId: data.studentId,
        bookId: data.bookId,
        borrowDate: new Date(),
      },
    });

    // Update book available copies
    await prisma.book.update({
      where: { id: data.bookId },
      data: {
        available: book.available - 1,
      },
    });

    revalidatePath('/dashboard/library');
    return { success: true, data: borrowing };
  } catch (error) {
    console.error('Error issuing book:', error);
    return { success: false, error: 'Failed to issue book.' };
  }
}

export async function returnBook(borrowingId: string) {
  try {
    const session = await requireAuth();

    const borrowing = await prisma.bookBorrowing.findUnique({
      where: { id: borrowingId },
    });

    if (!borrowing || borrowing.returnDate) {
      return { success: false, error: 'This borrowing record was not found or the book is already returned.' };
    }

    // Mark as returned
    await prisma.bookBorrowing.update({
      where: { id: borrowingId },
      data: {
        returnDate: new Date(),
      },
    });

    // Update book available copies
    const book = await prisma.book.findUnique({
      where: { id: borrowing.bookId },
    });

    if (book) {
      await prisma.book.update({
        where: { id: borrowing.bookId },
        data: {
          available: Math.min(book.available + 1, book.quantity),
        },
      });
    }

    revalidatePath('/dashboard/library');
    return { success: true };
  } catch (error) {
    console.error('Error returning book:', error);
    return { success: false, error: 'Failed to return book.' };
  }
}
