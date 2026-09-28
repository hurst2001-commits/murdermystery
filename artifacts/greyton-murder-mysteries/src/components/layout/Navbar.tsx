import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Show, useClerk } from '@clerk/react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { signOut } = useClerk();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/#the-mystery', label: 'The Mystery' },
    { href: '/public-event', label: 'Public Events' },
    { href: '/custom', label: 'Custom Mystery' },
    { href: '/#packages', label: 'Packages' },
    { href: '/#greyton', label: 'Greyton' },
    { href: '/#faq', label: 'FAQ' },
  ];

  return (
    <header
      className={cn(
        'case-nav fixed top-0 w-full z-50 transition-all duration-300',
        scrolled || isOpen
          ? 'bg-background/95 backdrop-blur-sm border-b border-border shadow-sm'
          : 'bg-background/75 backdrop-blur-sm border-b border-secondary/20'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-5">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Greyton Murder Mysteries home">
          <img
            src={`${import.meta.env.BASE_URL}greyton-logo.png`}
            alt="Greyton Murder Mysteries"
             className="h-14 md:h-16 w-auto object-contain"
            width={108}
            height={72}
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) =>
            link.href.includes('#') ? (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location === link.href
                    ? 'text-primary'
                    : 'text-muted-foreground',
                )}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Show when="signed-in">
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Admin
            </Link>
            <button
              type="button"
              onClick={() => signOut({ redirectUrl: basePath || '/' })}
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Sign out
            </button>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Sign In
            </Link>
          </Show>
          <Link href="/book" className={cn(buttonVariants({ variant: 'default' }), "font-serif tracking-wide bg-primary text-primary-foreground hover:bg-primary/90")}>
            BOOK NOW
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-background border-b border-border shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col p-4 gap-4">
            {navLinks.map((link) =>
              link.href.includes('#') ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-2 text-lg font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'text-lg font-medium p-2 rounded-md transition-colors hover:bg-muted',
                    location === link.href
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ),
            )}
            <div className="h-px bg-border my-2" />
            <Link href="/book" onClick={() => setIsOpen(false)} className={cn(buttonVariants({ variant: 'default' }), "w-full font-serif tracking-wide bg-primary text-primary-foreground")}>
              BOOK NOW
            </Link>
            <Show when="signed-in">
              <Link href="/admin" onClick={() => setIsOpen(false)} className="text-center font-medium p-2 text-muted-foreground hover:text-primary">
                Admin Dashboard
              </Link>
            </Show>
            <Show when="signed-out">
              <Link href="/sign-in" onClick={() => setIsOpen(false)} className="text-center font-medium p-2 text-muted-foreground hover:text-primary">
                Sign In
              </Link>
            </Show>
          </nav>
        </div>
      )}
    </header>
  );
}
