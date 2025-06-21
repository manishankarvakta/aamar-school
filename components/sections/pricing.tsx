'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckIcon } from '@radix-ui/react-icons';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small schools just getting started',
    price: '49',
    features: [
      'Up to 500 students',
      'Basic attendance tracking',
      'Grade management',
      'Parent communication',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    description: 'Ideal for growing schools with more needs',
    price: '99',
    features: [
      'Up to 2000 students',
      'Advanced attendance tracking',
      'Fee management',
      'Exam management',
      'SMS notifications',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large institutions with complex requirements',
    price: '249',
    features: [
      'Unlimited students',
      'Custom integrations',
      'Advanced analytics',
      'Multi-branch support',
      'API access',
      'Dedicated support',
      'Custom development',
    ],
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

export function PricingSection() {
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
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your school. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={item}
              className={`relative bg-card rounded-xl p-8 shadow-sm ${
                plan.popular ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-primary mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                Get Started
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground">
            Need a custom plan?{' '}
            <a href="/contact" className="text-primary hover:underline">
              Contact us
            </a>{' '}
            for a tailored solution.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 