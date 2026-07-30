"use client";

import { useLanguage } from "@/lib/i18n-context";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="py-8 bg-background border-t border-border/10 text-center text-muted-foreground text-sm">
      <div className="container mx-auto px-4">
        <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="#" className="hover:text-primary transition-colors">{t("footer.privacy")}</a>
          <a href="#" className="hover:text-primary transition-colors">{t("footer.terms")}</a>
          <a href="#" className="hover:text-primary transition-colors">{t("footer.contact")}</a>
        </div>
      </div>
    </footer>
  );
}
