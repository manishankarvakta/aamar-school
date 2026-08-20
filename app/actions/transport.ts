'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function getTransportData() {
  try {
    const session = await requireAuth();

    // 1. Fetch all routes including associated vehicle and assigned students
    const routes = await prisma.route.findMany({
      where: { aamarId: session.aamarId },
      include: {
        vehicle: true,
        students: true,
      },
      orderBy: { name: 'asc' },
    });

    // 2. Fetch all vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: { aamarId: session.aamarId },
      include: {
        routes: true,
      },
      orderBy: { number: 'asc' },
    });

    // 3. Fetch all students who are assigned to transport
    const studentTransport = await prisma.student.findMany({
      where: {
        aamarId: session.aamarId,
        routeId: { not: null },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            profile: {
              select: {
                phone: true,
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
        route: true,
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    // 4. Fetch all students for the assignment dropdown list
    const allStudents = await prisma.student.findMany({
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
        routes: routes.map((r) => ({
          id: r.id,
          routeName: r.name,
          busNumber: r.vehicle.number,
          driverName: r.vehicle.driverName || 'No Driver Assigned',
          driverPhone: r.vehicle.driverPhone || 'N/A',
          capacity: r.vehicle.capacity,
          studentsAssigned: r.students.length,
          totalStops: 5, // static fallback for total stops
          startTime: r.startTime || '07:00 AM',
          endTime: r.endTime || '08:30 AM',
          status: r.status || 'Active',
          distance: r.distance || '25 km',
        })),
        studentTransport: studentTransport.map((s) => ({
          id: s.id,
          studentName: `${s.user.firstName} ${s.user.lastName}`,
          studentId: s.rollNumber,
          class: s.class.name,
          routeName: s.route?.name || 'N/A',
          routeId: s.routeId,
          stopName: s.stopName || 'N/A',
          pickupTime: s.route?.startTime || '07:00 AM',
          dropTime: s.route?.endTime || '02:30 PM',
          feeStatus: s.transportFeeStatus || 'Paid',
          parentContact: s.user.profile?.phone || 'N/A',
          photo: s.user.profile?.avatar || '',
        })),
        drivers: vehicles
          .filter((v) => v.driverName)
          .map((v) => ({
            id: v.id,
            name: v.driverName || '',
            phone: v.driverPhone || '',
            licenseNumber: v.driverLicense || '',
            experience: v.driverExperience || '',
            assignedRoute: v.routes[0]?.name || 'Unassigned',
            busNumber: v.number,
            status: v.status || 'Active',
          })),
        vehicles: vehicles.map((v) => ({
          id: v.id,
          number: v.number,
          type: v.type,
          capacity: v.capacity,
          driverName: v.driverName || '',
          driverPhone: v.driverPhone || '',
          driverLicense: v.driverLicense || '',
          driverExperience: v.driverExperience || '',
          status: v.status || 'Active',
        })),
        allStudents: allStudents.map((s) => ({
          id: s.id,
          name: `${s.user.firstName} ${s.user.lastName}`,
          className: s.class.name,
          rollNumber: s.rollNumber,
        })),
      },
    };
  } catch (error) {
    console.error('Error getting transport data:', error);
    return { success: false, error: 'Failed to fetch transport data.' };
  }
}

export async function addVehicle(data: {
  number: string;
  type: string;
  capacity: number;
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;
  driverExperience?: string;
}) {
  try {
    const session = await requireAuth();

    const vehicle = await prisma.vehicle.create({
      data: {
        aamarId: session.aamarId,
        schoolId: session.schoolId,
        number: data.number,
        type: data.type,
        capacity: data.capacity,
        driverName: data.driverName || null,
        driverPhone: data.driverPhone || null,
        driverLicense: data.driverLicense || null,
        driverExperience: data.driverExperience || null,
        status: 'Active',
      },
    });

    revalidatePath('/dashboard/transport');
    return { success: true, data: vehicle };
  } catch (error) {
    console.error('Error adding vehicle:', error);
    return { success: false, error: 'Failed to add vehicle.' };
  }
}

export async function addRoute(data: {
  name: string;
  startPoint: string;
  endPoint: string;
  distance: string;
  startTime: string;
  endTime: string;
  vehicleId: string;
}) {
  try {
    const session = await requireAuth();

    const route = await prisma.route.create({
      data: {
        aamarId: session.aamarId,
        name: data.name,
        startPoint: data.startPoint,
        endPoint: data.endPoint,
        distance: data.distance,
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'Active',
        vehicleId: data.vehicleId,
      },
    });

    revalidatePath('/dashboard/transport');
    return { success: true, data: route };
  } catch (error) {
    console.error('Error adding route:', error);
    return { success: false, error: 'Failed to add route.' };
  }
}

export async function deleteRoute(id: string) {
  try {
    // Unassign students from this route first
    await prisma.student.updateMany({
      where: { routeId: id },
      data: { routeId: null, stopName: null },
    });

    await prisma.route.delete({
      where: { id },
    });

    revalidatePath('/dashboard/transport');
    return { success: true };
  } catch (error) {
    console.error('Error deleting route:', error);
    return { success: false, error: 'Failed to delete route.' };
  }
}

export async function assignStudentToRoute(data: {
  studentId: string;
  routeId: string;
  stopName: string;
  transportFeeStatus: string;
}) {
  try {
    const session = await requireAuth();

    // Check if route has space
    const route = await prisma.route.findUnique({
      where: { id: data.routeId },
      include: {
        vehicle: true,
        students: true,
      },
    });

    if (!route) {
      return { success: false, error: 'Selected transport route not found.' };
    }

    if (route.students.length >= route.vehicle.capacity) {
      return { success: false, error: 'Selected transport route vehicle capacity is full.' };
    }

    await prisma.student.update({
      where: { id: data.studentId },
      data: {
        routeId: data.routeId,
        stopName: data.stopName,
        transportFeeStatus: data.transportFeeStatus,
      },
    });

    revalidatePath('/dashboard/transport');
    return { success: true };
  } catch (error) {
    console.error('Error assigning student:', error);
    return { success: false, error: 'Failed to assign student.' };
  }
}

export async function unassignStudentFromRoute(studentId: string) {
  try {
    await prisma.student.update({
      where: { id: studentId },
      data: {
        routeId: null,
        stopName: null,
      },
    });

    revalidatePath('/dashboard/transport');
    return { success: true };
  } catch (error) {
    console.error('Error unassigning student:', error);
    return { success: false, error: 'Failed to unassign student.' };
  }
}
