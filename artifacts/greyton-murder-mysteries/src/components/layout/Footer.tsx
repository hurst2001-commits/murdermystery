import { Link } from 'wouter';
import { Facebook, Instagram } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

export function Footer() {
  return (
    <footer className="case-footer bg-card text-card-foreground border-t border-border mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block" aria-label="Greyton Murder Mysteries home">
              <img
                src={`${import.meta.env.BASE_URL}greyton-logo.png`}
                alt="Greyton Murder Mysteries"
                className="w-48 h-auto object-contain"
                width={192}
                height={128}
                loading="lazy"
              />
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mt-4 leading-relaxed">
              Secrets. Lies. Murder. A night in Greyton you won't forget.
              An immersive murder-mystery experience in the heart of the Western Cape.
            </p>
          </div>
          
          <div>
            <h3 className="font-serif font-semibold mb-4 text-lg">Experiences</h3>
            <ul className="space-y-3">
              <li>
                <a href="/#the-mystery" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  The Greyton Murder Mystery
                </a>
              </li>
              <li>
                <Link href="/custom" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Create Your Own Murder
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Book Now
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-serif font-semibold mb-4 text-lg">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hurst2001@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  hurst2001@gmail.com
                </a>
              </li>
              <li className="pt-4 flex items-center gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://wa.me/27828985006?text=Hi!%20I'd%20like%20to%20enquire%20about%20a%20Greyton%20Murder%20Mystery."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="WhatsApp Greyton Murder Mysteries"
                >
                  <SiWhatsapp className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Greyton Murder Mysteries. All rights reserved.
          </p>
          <a
            href="https://fortunedesign.co.za"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Website Designed by Fortune Design
          </a>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
      
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/27828985006?text=Hi!%20I'd%20like%20to%20enquire%20about%20a%20Greyton%20Murder%20Mystery." 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50 hover-elevate"
        aria-label="Contact us on WhatsApp"
      >
        <SiWhatsapp className="w-6 h-6" />
      </a>
    </footer>
  );
}
