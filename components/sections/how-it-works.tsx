'use client';

import { motion } from 'framer-motion';
import { PersonIcon, CalendarIcon, FileTextIcon, CheckCircledIcon } from '@radix-ui/react-icons';

const steps = [
  {
    title: 'Set Your Plan',
    description: 'Choose the perfect plan for your school needs and get started with a 14-day free trial.',
    icon: PersonIcon,
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Find Your Course',
    description: 'Set up your academic programs, classes, and curriculum with our intuitive course builder.',
    icon: CalendarIcon,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    title: 'Book Your Start',
    description: 'Schedule your implementation and get onboarded by our dedicated support team.',
    icon: FileTextIcon,
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Get Certificate',
    description: 'Launch your school management system and start seeing results from day one.',
    icon: CheckCircledIcon,
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    iconColor: 'text-pink-600 dark:text-pink-400',
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

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">How is work</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Getting started with our school management system is simple and straightforward
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={item}
              className={`${step.bgColor} rounded-xl p-6 text-center hover:shadow-lg transition-shadow`}
            >
              <div className={`w-16 h-16 ${step.iconColor} mx-auto mb-4 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm`}>
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 