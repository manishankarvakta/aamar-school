'use client';

import { motion } from 'framer-motion';
import {
  PersonIcon,
  CalendarIcon,
  BarChartIcon,
  ChatBubbleIcon,
  CardStackIcon,
  FileTextIcon,
} from '@radix-ui/react-icons';

const features = [
  {
    title: 'Student Management',
    description: 'Comprehensive student information system with admission tracking, ID cards, and performance analytics.',
    icon: PersonIcon,
  },
  {
    title: 'Staff Management',
    description: 'Efficient staff management with timetables, salary processing, leave management, and performance tracking.',
    icon: CalendarIcon,
  },
  {
    title: 'Attendance & Scheduling',
    description: 'Track daily attendance, manage class schedules, and handle holidays with our intuitive system.',
    icon: BarChartIcon,
  },
  {
    title: 'Fees & Billing',
    description: 'Streamlined fee collection with automated invoices, payment gateway integration, and payment reminders.',
    icon: CardStackIcon,
  },
  {
    title: 'Exam & Results',
    description: 'Create and manage exams, generate results, and produce comprehensive report cards.',
    icon: FileTextIcon,
  },
  {
    title: 'Communication',
    description: 'Integrated communication tools including SMS, email, notices, and in-app notifications.',
    icon: ChatBubbleIcon,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">
            Everything You Need to Run a School—Smarter.
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A comprehensive suite of tools designed to streamline your school's operations
            and enhance the learning experience.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              <feature.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 