'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  RocketIcon,
  GearIcon,
  PersonIcon,
  LockClosedIcon,
  QuestionMarkIcon,
} from '@radix-ui/react-icons';

const sections = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Quick Start Guide', href: '/docs/quick-start' },
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Configuration', href: '/docs/configuration' },
    ],
    icon: RocketIcon,
  },
  {
    title: 'User Management',
    items: [
      { title: 'User Roles', href: '/docs/user-roles' },
      { title: 'Permissions', href: '/docs/permissions' },
      { title: 'Authentication', href: '/docs/authentication' },
    ],
    icon: PersonIcon,
  },
  {
    title: 'Features',
    items: [
      { title: 'Student Management', href: '/docs/student-management' },
      { title: 'Attendance', href: '/docs/attendance' },
      { title: 'Grades', href: '/docs/grades' },
    ],
    icon: GearIcon,
  },
  {
    title: 'Security',
    items: [
      { title: 'Data Protection', href: '/docs/data-protection' },
      { title: 'Privacy Policy', href: '/docs/privacy' },
      { title: 'Security Best Practices', href: '/docs/security' },
    ],
    icon: LockClosedIcon,
  },
  {
    title: 'Support',
    items: [
      { title: 'FAQ', href: '/docs/faq' },
      { title: 'Troubleshooting', href: '/docs/troubleshooting' },
      { title: 'Contact Support', href: '/docs/support' },
    ],
    icon: QuestionMarkIcon,
  },
];

export default function DocsPage() {
  return (
    <div className="py-20">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about using and customizing Aamar School.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <nav className="sticky top-20 space-y-8">
              {sections.map((section) => (
                <div key={section.title}>
                  <div className="flex items-center gap-2 mb-4">
                    <section.icon className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">{section.title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.title}>
                        <Link
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-gray max-w-none"
            >
              <h2>Welcome to Aamar School Documentation</h2>
              <p>
                This documentation will guide you through setting up and using Aamar School
                effectively. Whether you're a school administrator, teacher, or IT staff,
                you'll find everything you need to get started.
              </p>

              <h3>Quick Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Link
                  href="/docs/quick-start"
                  className="flex items-center gap-2 p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <RocketIcon className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Quick Start Guide</h4>
                    <p className="text-sm text-muted-foreground">
                      Get up and running in minutes
                    </p>
                  </div>
                </Link>
                <Link
                  href="/docs/installation"
                  className="flex items-center gap-2 p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <GearIcon className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Installation Guide</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed setup instructions
                    </p>
                  </div>
                </Link>
              </div>

              <h3>Need Help?</h3>
              <p>
                If you can't find what you're looking for, our support team is always ready to help.
                You can reach out to us through the following channels:
              </p>
              <ul>
                <li>Email: support@aamarschool.com</li>
                <li>Live Chat: Available 24/7</li>
                <li>Phone: +1 (555) 123-4567</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 