import { Link } from 'wouter';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, PenTool, Mail, Sparkles, Image, Target } from 'lucide-react';

export default function CustomMystery() {
  return (
    <div className="case-custom w-full">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 flex items-center justify-center overflow-hidden bg-foreground text-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-6 text-primary">
            YOUR OWN MURDER
          </h1>
          <h2 className="font-serif text-2xl md:text-4xl font-bold mb-4 uppercase tracking-wider text-background">
            The victim can be fictional.
          </h2>
          <h2 className="font-serif text-2xl md:text-4xl font-bold mb-10 uppercase tracking-wider text-background">
            The suspects are your friends.
          </h2>
          
          <div className="text-lg md:text-xl text-background/80 mb-12 max-w-2xl mx-auto leading-relaxed space-y-6">
            <p>
              Imagine arriving for a birthday weekend in Greyton and discovering that you and your closest friends are the principal suspects in a murder.
            </p>
            <p>
              Except this isn't a generic murder mystery.
            </p>
            <p className="font-bold text-background text-2xl">
              It was written specifically for you.
            </p>
            <p>
              We create an original mystery inspired by the personalities in your group.
            </p>
          </div>
          
          <Link href="/book" className={cn(buttonVariants({ size: 'lg' }), "w-full sm:w-auto max-w-full h-auto min-h-14 whitespace-normal text-center leading-snug font-serif tracking-widest text-base sm:text-lg px-5 sm:px-10 py-5 sm:py-8 bg-primary text-primary-foreground hover:bg-primary/90")}>
            REQUEST A CUSTOM MYSTERY
          </Link>
        </div>
      </section>

      {/* HOW YOUR PERSONALISED MURDER WORKS */}
      <section className="py-24 md:py-32 bg-background relative">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold">How Your Personalised Murder Works</h2>
          </div>
          
          <div className="space-y-16">
            {[
              {
                num: 1,
                title: "TELL US ABOUT YOUR GROUP",
                desc: "The organiser completes a fun questionnaire about each player. We ask for their personality, hobbies, funny habits, relationships, things they're famous for among their friends, favourite sayings, and harmless inside jokes.",
                icon: <Search className="w-8 h-8 text-primary" />
              },
              {
                num: 2,
                title: "WE CREATE THE MURDER",
                desc: "We transform your group into suspects in an original fictional murder mystery. Personalities and jokes can inspire characters, but all crimes, scandals and compromising behaviour created for the game are strictly fictional.",
                icon: <PenTool className="w-8 h-8 text-primary" />
              },
              {
                num: 3,
                title: "EVERYONE GETS A CHARACTER",
                desc: "Each guest receives a personal invitation, character identity, background story, secrets, a motive, information they can reveal, and information they must initially hide.",
                icon: <Mail className="w-8 h-8 text-primary" />
              },
              {
                num: 4,
                title: "ARRIVE IN CHARACTER",
                desc: "Everyone comes dressed for their role. The moment they arrive, the game begins.",
                icon: <Sparkles className="w-8 h-8 text-primary" />
              },
              {
                num: 5,
                title: "THE EVIDENCE STARTS APPEARING",
                desc: "New information is released over multiple rounds. This could include fictional photographs, letters, WhatsApp messages, bank statements, contracts, love notes, newspaper stories, receipts, witness statements, and secret documents.",
                icon: <Image className="w-8 h-8 text-primary" />
              },
              {
                num: 6,
                title: "SOLVE YOUR OWN MURDER",
                desc: "Everyone makes their final accusation. Then the truth comes out.",
                icon: <Target className="w-8 h-8 text-primary" />
              }
            ].map((step) => (
              <div key={step.num} className="flex flex-col md:flex-row gap-6 md:gap-10 items-start group">
                <div className="flex-shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-full bg-card border border-border flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/5 transition-all">
                  {step.icon}
                </div>
                <div className="pt-2 md:pt-4">
                  <span className="text-primary font-bold font-serif tracking-widest uppercase text-sm block mb-2">Step {step.num}</span>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW NAUGHTY CAN WE MAKE IT? */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">How Naughty Can We Make It?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              You get to choose the tone of your mystery. The game is designed to make your group laugh, not hurt anyone. Personalised crimes, affairs, scandals and compromising situations are fictional.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {[
              { level: "VERY GENTLE", desc: "Family-friendly fun and harmless secrets." },
              { level: "FUNNY & CHEEKY", desc: "Inside jokes, ridiculous scandals and plenty of teasing." },
              { level: "JUICY", desc: "Affairs, money, blackmail, jealousy and scandal — all fictional." },
              { level: "ABSOLUTELY OUTRAGEOUS", desc: "You know your friends. We hope." }
            ].map((tone, idx) => (
              <div key={idx} className="bg-background border border-border p-8 rounded-2xl">
                <h3 className="font-serif text-2xl font-bold text-primary mb-3">{tone.level}</h3>
                <p className="text-muted-foreground text-lg">{tone.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 p-8 rounded-2xl text-center max-w-3xl mx-auto border border-border">
            <h3 className="font-serif text-xl font-bold mb-4">Anything completely off limits?</h3>
            <p className="text-muted-foreground mb-4">
              When you book, you can tell us exactly what subjects are off limits so everyone has a fantastic time.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-background text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-5xl font-bold mb-8 uppercase tracking-wide">
            Ready to frame your friends?
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Let's start building a night they'll never forget.
          </p>
          <Link href="/book?type=custom" className={cn(buttonVariants({ size: 'lg' }), "w-full sm:w-auto max-w-full h-auto min-h-14 whitespace-normal text-center leading-snug font-serif tracking-widest px-5 sm:px-12 py-5 sm:py-8 text-base sm:text-xl")}>
            START OUR INVESTIGATION
          </Link>
        </div>
      </section>
    </div>
  );
}
