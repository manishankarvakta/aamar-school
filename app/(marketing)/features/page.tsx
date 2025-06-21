'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  PersonIcon,
  CalendarIcon,
  BarChartIcon,
  ChatBubbleIcon,
  CardStackIcon,
  GlobeIcon,
  GearIcon,
  LockClosedIcon,
  BellIcon,
  FileTextIcon,
} from '@radix-ui/react-icons';

const features = [
  {
    category: 'Student Management',
    items: [
      {
        title: 'Student Profiles',
        description: 'Comprehensive student information management with customizable fields.',
        icon: PersonIcon,
      },
      {
        title: 'Attendance Tracking',
        description: 'Real-time attendance monitoring with automated reporting.',
        icon: CalendarIcon,
      },
      {
        title: 'Performance Analytics',
        description: 'Detailed analytics and insights into student performance.',
        icon: BarChartIcon,
      },
    ],
  },
  {
    category: 'Communication',
    items: [
      {
        title: 'Parent Portal',
        description: "Dedicated portal for parents to monitor their child's progress.",
        icon: ChatBubbleIcon,
      },
      {
        title: 'Notification System',
        description: 'Automated notifications for important updates and events.',
        icon: BellIcon,
      },
      {
        title: 'Document Sharing',
        description: 'Secure document sharing between teachers, students, and parents.',
        icon: FileTextIcon,
      },
    ],
  },
  {
    category: 'Administration',
    items: [
      {
        title: 'Fee Management',
        description: 'Streamlined fee collection and payment tracking system.',
        icon: CardStackIcon,
      },
      {
        title: 'Online Learning',
        description: 'Virtual classroom and learning management system.',
        icon: GlobeIcon,
      },
      {
        title: 'Security & Privacy',
        description: 'Enterprise-grade security with role-based access control.',
        icon: LockClosedIcon,
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-20">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Powerful Features for Modern Education</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to manage your school efficiently and effectively.
          </p>
        </motion.div>

        {features.map((category, categoryIndex) => (
          <motion.div
            key={category.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-8">{category.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.items.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (categoryIndex * 0.1) + (index * 0.1) }}
                  className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Button variant="ghost" className="p-0 h-auto">
                    Learn more →
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-16"
        >
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of schools already using our platform.
          </p>
          <Button size="lg" className="gap-2">
            <GearIcon className="h-5 w-5" />
            Start Free Trial
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 