export function Footer() {
  return (
    <footer className="py-8 bg-background border-t border-border/10 text-center text-muted-foreground text-sm">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Jeanostar. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
