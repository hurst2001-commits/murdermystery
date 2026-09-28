import { useGetSiteContent } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Button, buttonVariants } from '@/components/ui/button';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { GlassWater, Moon, Sparkles, MapPin, Users, Clock, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import './HomeCustomCta.css';
import { CaseIllustration, type CaseIllustrationName } from '@/components/CaseIllustration';

const processArt: CaseIllustrationName[] = [
  'brass-compass',
  'detective-kit',
  'confidential-dossier',
  'oil-lantern',
  'magnifying-glass',
  'sealed-letter',
];

function CharacterCard({ suspect }: { suspect: any }) {
  const [revealed, setRevealed] = useState(false);
  
  return (
    <div className="bg-card border border-border p-6 rounded-xl flex flex-col h-full hover:shadow-lg transition-shadow">
      <div className="flex-1">
        <h3 className="font-serif text-2xl font-bold text-foreground mb-1">{suspect.name}</h3>
        <p className="text-primary font-medium text-sm tracking-wide uppercase mb-4">{suspect.role}</p>
        <p className="text-muted-foreground mb-6 text-pretty leading-relaxed">
          {suspect.description}
        </p>
      </div>
      <div className="pt-4 border-t border-border mt-auto">
        {!revealed ? (
          <Button 
            variant="outline" 
            className="w-full font-serif tracking-wide border-primary/20 hover:bg-primary/5 hover:text-primary"
            onClick={() => setRevealed(true)}
          >
            WHAT ARE THEY HIDING?
          </Button>
        ) : (
          <div className="w-full text-center py-2 px-4 bg-muted/50 rounded-md animate-in fade-in zoom-in-95 duration-300">
            <span className="text-sm font-medium text-foreground italic">You'll have to play to find out.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: content, isLoading, isError } = useGetSiteContent();

  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });

  useEffect(() => {
    if (!content) return;

    const sectionId = window.location.hash.slice(1);
    if (!sectionId) return;

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [content]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen pt-20 px-4 space-y-20 pb-20">
        <div className="max-w-4xl mx-auto space-y-6 text-center mt-20">
          <Skeleton className="h-16 md:h-24 w-3/4 mx-auto bg-muted" />
          <Skeleton className="h-8 w-1/2 mx-auto bg-muted" />
          <Skeleton className="h-20 w-full max-w-2xl mx-auto bg-muted" />
        </div>
      </div>
    );
  }

  if (isError || !content) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="font-serif text-3xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">We couldn't load the mystery. Please refresh the page.</p>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    );
  }

  return (
    <div className="w-full case-home">
      {/* HERO SECTION */}
      <section className="case-hero relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Abstract background elements instead of generic images */}
        <div className="case-hero-image absolute inset-0" />
        <div className="case-hero-shade absolute inset-0" />
        
        <div className="container mx-auto px-6 md:px-10 relative z-10 text-left max-w-7xl mt-20">
          <div className="case-hero-content">
          <div className="case-hero-rule" aria-hidden="true" />
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-none">
            {content.brand.heroTitle}
          </h1>
          <p className="font-serif text-2xl md:text-3xl text-primary font-medium mb-8">
            {content.brand.heroSubtitle}
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
            {content.brand.heroCopy}
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link href="/book" className={cn(buttonVariants({ size: 'lg' }), "w-full sm:w-auto font-serif tracking-widest text-lg px-8 py-6")}>
              BOOK YOUR MURDER
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto font-serif tracking-widest text-lg px-8 py-6" asChild>
              <a href="#how-it-works">HOW IT WORKS</a>
            </Button>
          </div>
          <p className="mt-8 text-sm font-medium tracking-widest text-muted-foreground uppercase">
            An immersive murder-mystery experience in Greyton, Western Cape.
          </p>
          </div>
        </div>
      </section>

      {/* FEATURED VIDEO */}
      <section className="case-video border-y border-border bg-card py-16 md:py-24">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-xl">
            <video
              className="aspect-video w-full object-contain"
              autoPlay
              muted
              controls
              playsInline
              preload="auto"
              aria-label="Greyton Murder Mysteries video"
            >
              <source
                src={`${import.meta.env.BASE_URL}videos/greyton-murder-mystery-feature.mp4`}
                type="video/mp4"
              />
              Your browser does not support embedded videos.
            </video>
          </div>
        </div>
      </section>

      {/* THE MYSTERY / INTRO */}
      <section id="the-mystery" className="case-paper py-24 md:py-32 bg-card relative">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <CaseIllustration name="sealed-letter" className="case-paper-art" />
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 uppercase tracking-wide">
            This isn't a board game.
          </h2>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-12 uppercase tracking-wide text-primary">
            You're in the story.
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed text-left md:text-center">
            <p>
              The Greyton Murder Mystery is an interactive experience created in Greyton.
            </p>
            <p>
              A private gathering in Greyton ends rather badly for the controversial Sebastian "Seb" Marais. By morning, Seb is dead.
            </p>
            <p className="font-medium text-foreground">
              Six people were with him. Every one of them had a motive. Every one of them is hiding something. And one of them is the murderer.
            </p>
            <p>
              You and your friends become the suspects. Over six rounds you'll uncover evidence, expose secrets, interrogate each other, defend yourselves and attempt to solve the murder before the final reveal.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="case-process py-24 md:py-32 border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">No acting experience required. A willingness to lie convincingly to your friends is useful.</p>
          </div>
          
          <div className="case-process-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {content.steps.map((step) => (
              <article key={step.number} className="case-step group">
                <div className="case-step-art">
                  <CaseIllustration
                    name={processArt[(step.number - 1) % processArt.length] ?? 'brass-compass'}
                  />
                </div>
                <div className="case-step-head">
                  <span className="case-step-number">{String(step.number).padStart(2, '0')}</span>
                  <h3 className="case-step-title">{step.title}</h3>
                </div>
                <p className="case-step-description">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* MEET THE SUSPECTS */}
      <section className="case-suspects py-24 md:py-32 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Meet the Suspects</h2>
            <p className="text-muted-foreground text-lg">Six friends. Six secrets. One murderer.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {content.suspects.map((suspect, idx) => (
              <CharacterCard key={idx} suspect={suspect} />
            ))}
          </div>
        </div>
      </section>

      {/* THE EXPERIENCE & PACKAGES */}
      <section id="packages" className="case-packages py-24 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* The Experience Panel */}
            <div className="bg-foreground text-background p-8 md:p-12 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-10 text-background">The Experience</h2>
              
              <ul className="space-y-6 relative z-10">
                <li className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">PLAYERS</h4>
                    <p className="text-background/70">6 people</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">DURATION</h4>
                    <p className="text-background/70">Approximately 2½–3 hours</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">LOCATION</h4>
                    <p className="text-background/70">Greyton, Western Cape</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Flame className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">AGE & DRESS</h4>
                    <p className="text-background/70">Recommended for adults. Come in character.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <GlassWater className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-bold text-lg">FOOD & DRINKS</h4>
                    <p className="text-background/70">Guests can bring snacks or platters. BYO or venue-specific arrangements.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Packages */}
            <div className="space-y-8 min-w-0">
              <h2 className="font-serif text-4xl font-bold mb-8">Choose Your Mystery</h2>
              
              {content.experiences.map((exp) => (
                <div key={exp.id} className="border border-border p-8 rounded-2xl bg-card hover-elevate transition-all">
                  <CaseIllustration
                    name={exp.id === 'custom' ? 'sealed-letter' : 'detective-kit'}
                    className="case-package-art"
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                    <div className="min-w-0">
                      <span className="text-xs font-bold tracking-widest text-primary uppercase mb-2 block">{exp.label}</span>
                      <h3 className="font-serif text-2xl font-bold">{exp.name}</h3>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-sm text-muted-foreground block">From</span>
                      <span className="font-bold text-xl">{exp.priceLabel}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-6">{exp.description}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                    {exp.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-secondary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={exp.id === 'custom' ? '/custom' : '/book'} className={cn(buttonVariants({ variant: 'default' }), "w-full h-auto min-h-10 whitespace-normal text-center leading-tight px-2 py-2 font-serif tracking-widest", exp.id === 'custom' ? 'bg-foreground text-background hover:bg-foreground/90' : '')}>
                    {exp.id === 'custom' ? 'CREATE OUR MURDER' : 'BOOK THE GREYTON MYSTERY'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PERFECT FOR / OCCASIONS */}
      <section className="case-occasions py-24 bg-background border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-4xl mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Perfect For...</h2>
        </div>
        <div className="container mx-auto px-4 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {[
              { title: "Weekends in Greyton", desc: "Something completely different after a day exploring the village." },
              { title: "Birthdays", desc: "Turn your birthday dinner into a murder investigation." },
              { title: "Groups of Friends", desc: "Wine, secrets and accusing your closest friends of murder." },
              { title: "Family Gatherings", desc: "Find out which member of the family is best at lying." },
              { title: "Corporate & Team Events", desc: "A much more entertaining alternative to traditional team building." },
              { title: "Reunions", desc: "You already know everyone's old secrets. We'll give you some new ones." }
            ].map((occ, idx) => (
              <div key={idx} className="flex-[0_0_80%] md:flex-[0_0_40%] lg:flex-[0_0_30%] min-w-0">
                <div className="bg-card border border-border p-8 rounded-2xl h-full">
                  <h3 className="font-serif text-xl font-bold mb-3">{occ.title}</h3>
                  <p className="text-muted-foreground">{occ.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YOUR OWN MURDER */}
      <section className="case-custom-cta case-custom-cta--refined">
        <div className="gfr-hero">
          <div className="gfr-hero-inner">
            <div className="gfr-hero-copy">
              <h2><span>OR...</span> MURDER YOUR FRIENDS.</h2>
              <p>What if the suspects were your actual friends?</p>
            </div>
          </div>
        </div>

        <div className="gfr-story">
          <div className="gfr-story-inner">
            <div className="gfr-lead">
              <p>Want to make the evening even more personal? We can create a <strong>completely customised murder mystery based on you and your friends.</strong></p>
            </div>
            <div className="gfr-details">
              <p>You tell us about the people attending — their personalities, occupations, hobbies, quirks, friendships, funny stories and the things your group knows them for.</p>
              <p>Then we turn them into suspects in their own murder mystery.</p>
              <p className="gfr-aside">The game can contain fictional scandals, private jokes, rivalries and references that only your group will understand.</p>
            </div>
          </div>
        </div>

        <div className="gfr-finale">
          <div className="gfr-finale-inner">
            <h3>You provide the characters.<br/><span>We create the murder.</span></h3>
            <Link href="/custom">CREATE OUR OWN MURDER</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {content.testimonials?.length > 0 && (
         <section className="case-testimonials py-24 bg-card border-y border-border">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-16 text-center">What the Suspects Say</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {content.testimonials.map((t, i) => (
                <div key={i} className="bg-background p-8 rounded-2xl relative shadow-sm">
                  <Moon className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
                  <p className="text-xl font-serif italic mb-6 text-foreground/90 leading-relaxed">"{t.quote}"</p>
                  <p className="font-bold tracking-wide uppercase text-sm text-primary">{t.attribution}</p>
                  {t.isSample && <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 block opacity-50">Sample</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GREYTON SECTION */}
      <section id="greyton" className="case-greyton py-24 md:py-32">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 tracking-tight">COME FOR GREYTON.</h2>
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-12 tracking-tight text-primary">STAY FOR THE MURDER.</h2>
          
          <div className="text-xl md:text-2xl font-serif text-muted-foreground space-y-4 leading-relaxed italic mb-16">
            <p>Spend the day exploring Greyton.</p>
            <p>Walk the village. Head into the mountains. Ride the trails.</p>
            <p>Have coffee. Enjoy lunch.</p>
            <p>Check into your accommodation.</p>
            <p>Then gather your friends.</p>
            <p className="font-bold not-italic text-foreground mt-8 text-3xl">Because tonight somebody is going to die.</p>
          </div>
          
          <div className="bg-card border border-border p-8 rounded-2xl max-w-lg mx-auto">
             <CaseIllustration name="explorer-globe" className="case-weekend-art" />
            <h3 className="font-serif text-2xl font-bold mb-4">Make a Weekend of It</h3>
            <p className="text-muted-foreground mb-8">
              You've walked the mountain. You've had the coffee. You've opened the wine. Now solve a murder.
            </p>
            <Link href="/book" className={cn(buttonVariants({ variant: 'default' }), "w-full h-auto min-h-10 whitespace-normal text-center leading-tight px-2 py-2 font-serif tracking-widest")}>
              PLAN OUR MURDER NIGHT
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="case-faq py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {content.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="font-serif text-lg text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="case-final py-32 bg-foreground text-background text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-4 tracking-tight">SIX PEOPLE WILL ARRIVE.</h2>
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-4 tracking-tight">ONE PERSON WILL DIE.</h2>
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-16 tracking-tight text-primary">EVERYONE WILL HAVE SOMETHING TO HIDE.</h2>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/book" className={cn(buttonVariants({ size: 'lg' }), "w-full sm:w-auto max-w-full h-auto min-h-14 whitespace-normal text-center leading-tight font-serif tracking-widest px-4 sm:px-8 py-4 sm:py-6 text-base sm:text-lg bg-primary text-primary-foreground hover:bg-primary/90")}>
              PLAY THE GREYTON MURDER MYSTERY
            </Link>
            <Link href="/custom" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), "w-full sm:w-auto max-w-full h-auto min-h-14 whitespace-normal text-center leading-tight font-serif tracking-widest px-4 sm:px-8 py-4 sm:py-6 text-base sm:text-lg border-background/20 text-background hover:bg-background/10")}>
              CREATE OUR OWN MURDER
            </Link>
          </div>
          
          <div className="text-background/50 font-serif tracking-widest uppercase text-sm space-y-2">
            <p>Greyton Murder Mysteries</p>
            <p>Greyton • Western Cape • South Africa</p>
          </div>
        </div>
      </section>
    </div>
  );
}
