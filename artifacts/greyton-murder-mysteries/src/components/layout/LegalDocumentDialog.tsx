import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function TextBlocks({ lines }: { lines: string[] }) {
  const blocks: Array<string | string[]> = [];
  for (const line of lines) {
    if (line.startsWith('- ')) {
      const previous = blocks[blocks.length - 1];
      if (Array.isArray(previous)) previous.push(line.slice(2));
      else blocks.push([line.slice(2)]);
    } else {
      blocks.push(line);
    }
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => Array.isArray(block)
        ? (
          <ul key={index} className="list-disc space-y-1 pl-5 marker:text-[#d9b881]">
            {block.map((item) => <li key={item}>{item}</li>)}
          </ul>
        )
        : <p key={index}>{block}</p>)}
    </div>
  );
}

export function LegalDocumentDialog({ text }: { text: string }) {
  const [introduction, ...sectionBlocks] = text.trim().split(/\r?\n(?=\d+\.\s)/);
  const [title, updatedDate, ...introParagraphs] = introduction.split(/\r?\n/);
  const sections = sectionBlocks.map((block) => {
    const [heading, ...paragraphs] = block.split(/\r?\n/);
    return { heading, paragraphs };
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors">
          {title}
        </button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="flex w-[calc(100vw-2rem)] max-w-3xl max-h-[85dvh] flex-col gap-0 overflow-hidden border-[#806546] bg-[#211c19] p-0 text-[#e9dcc5]"
      >
        <DialogHeader className="shrink-0 border-b border-[#806546]/50 px-5 py-5 pr-12 text-left sm:px-7">
          <DialogTitle className="font-serif text-2xl text-[#d9b881]">{title}</DialogTitle>
          <p className="text-xs text-[#b9aa91]">{updatedDate}</p>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto px-5 py-6 text-sm leading-relaxed sm:px-7 sm:text-base" tabIndex={0}>
          <TextBlocks lines={introParagraphs} />
          <div className="mt-8 space-y-8">
            {sections.map(({ heading, paragraphs }) => (
              <section key={heading} className="space-y-3">
                <h3 className="font-serif text-xl text-[#d9b881]">{heading}</h3>
                <TextBlocks lines={paragraphs} />
              </section>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}