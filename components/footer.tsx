import Link from 'next/link';
import { GitHubLogoIcon, TwitterLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons';

export function Footer() {
  const footerSections = [
    {
      title: 'Programs',
      links: [
        { name: 'Student Management', href: '/programs/students' },
        { name: 'Staff Management', href: '/programs/staff' },
        { name: 'Academic Calendar', href: '/programs/calendar' },
        { name: 'Fee Management', href: '/programs/fees' },
      ],
    },
    {
      title: 'About',
      links: [
        { name: 'Our Company', href: '/about/company' },
        { name: 'Careers', href: '/about/careers' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Success Stories', href: '/about/success' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Help Center', href: '/help' },
        { name: 'API Reference', href: '/api' },
        { name: 'System Status', href: '/status' },
      ],
    },
  ];

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AS</span>
              </div>
              <span className="text-primary">Aamar</span>
              <span className="text-foreground">School</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Streamline your school's operations with our comprehensive management system. 
              Built for educators, designed for success.
            </p>
            <div className="flex gap-4">
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <GitHubLogoIcon className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <TwitterLogoIcon className="h-5 w-5" />
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LinkedInLogoIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 Aamar School. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 