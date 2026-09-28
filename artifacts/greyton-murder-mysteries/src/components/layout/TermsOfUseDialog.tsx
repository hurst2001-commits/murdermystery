import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import termsText from '@/content/terms-of-use.txt?raw';

const [introduction, ...sectionBlocks] = termsText.trim().split(/\r?\n(?=\d+\.\s)/);
const [, updatedDate, ...introParagraphs] = introduction.split(/\r?\n/);
const sections = sectionBlocks.map((block) => {
  const [title, ...paragraphs] = block.split(/\r?\n/);
  return { title, paragraphs };
});

export function TermsOfUseDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          Terms of Use
        </button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="flex w-[calc(100vw-2rem)] max-w-3xl max-h-[85dvh] flex-col gap-0 overflow-hidden border-[#806546] bg-[#211c19] p-0 text-[#e9dcc5]"
      >
        <DialogHeader className="shrink-0 border-b border-[#806546]/50 px-5 py-5 pr-12 text-left sm:px-7">
          <DialogTitle className="font-serif text-2xl text-[#d9b881]">Terms of Use</DialogTitle>
          <p className="text-xs text-[#b9aa91]">{updatedDate}</p>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto px-5 py-6 text-sm leading-relaxed sm:px-7 sm:text-base" tabIndex={0}>
          <div className="space-y-3">
            {introParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="mt-8 space-y-8">
            {sections.map(({ title, paragraphs }) => (
              <section key={title} className="space-y-3">
                <h3 className="font-serif text-xl text-[#d9b881]">{title}</h3>
                {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}