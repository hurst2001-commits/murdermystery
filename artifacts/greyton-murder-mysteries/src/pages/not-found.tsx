import { Link } from "wouter";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <h1 className="font-serif text-7xl font-bold mb-4 text-primary">404</h1>
      <h2 className="font-serif text-3xl font-bold mb-6">Page Not Found</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        The mystery you are looking for seems to have vanished without a trace.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: 'lg' }), "font-serif tracking-widest px-8")}>
        RETURN TO VILLAGE
      </Link>
    </div>
  );
}
