'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PersonIcon } from '@radix-ui/react-icons';

const testimonials = [
  {
    quote: "Aamar School has transformed how we manage our institution. The platform's comprehensive features have streamlined our operations and improved communication with parents.",
    author: "Dr. Sarah Johnson",
    role: "Principal, St. Mary's High School",
  },
  {
    quote: "The attendance tracking and fee management features have saved us countless hours. It's a game-changer for school administration.",
    author: "Michael Chen",
    role: "Administrator, Global Academy",
  },
  {
    quote: "As a teacher, I love how easy it is to manage grades and communicate with parents. The interface is intuitive and user-friendly.",
    author: "Emily Rodriguez",
    role: "Senior Teacher, Bright Future School",
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">
            Trusted by Schools Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join hundreds of educational institutions that have transformed their operations
            with our School Management System.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-4">
                  <PersonIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{testimonial.author}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <blockquote className="text-muted-foreground">
                "{testimonial.quote}"
              </blockquote>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="w-32 h-12 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">School 1</span>
            </div>
            <div className="w-32 h-12 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">School 2</span>
            </div>
            <div className="w-32 h-12 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">School 3</span>
            </div>
            <div className="w-32 h-12 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">School 4</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 