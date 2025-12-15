import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LayoutDashboard, CalendarDays, Users, Star, Settings } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SLO Manager",
  description: "System zarządzania służbą liturgiczną",
};

// Definicja linków w menu - łatwo dodać nowe
const routes = [
  {
    href: "/",
    label: "Ranking",
    icon: LayoutDashboard,
  },
  {
    href: "/grafiki/tygodniowy",
    label: "Grafik Tygodniowy",
    icon: CalendarDays,
  },
  {
    href: "/grafiki/niedzielny",
    label: "Grafik Niedzielny",
    icon: Users,
  },
  {
    href: "/grafiki/extra",
    label: "Służba Dodatkowa",
    icon: Star,
  },
  {
    href: "/grafiki/edycja",
    label: "Edytor Grafiku",
    icon: Settings,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // Domyślnie ciemny, jak chciałeś
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col md:flex-row">

            {/* --- SIDEBAR DLA DESKTOPU --- */}
            <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Users className="h-6 w-6" />
                  <span className="">SLO Manager</span>
                </Link>
              </div>
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto p-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tryb:</span>
                  <ModeToggle />
                </div>
              </div>
            </aside>

            {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
            <div className="flex flex-col flex-1">

              {/* --- HEADER MOBILNY (Tylko na małych ekranach) --- */}
              <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden justify-between">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Przełącz menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="flex flex-col">
                    <nav className="grid gap-2 text-lg font-medium">
                      <Link href="#" className="flex items-center gap-2 text-lg font-semibold mb-4">
                        <Users className="h-6 w-6" />
                        <span className="sr-only">SLO Manager</span>
                        SLO Manager
                      </Link>
                      {routes.map((route) => (
                        <Link
                          key={route.href}
                          href={route.href}
                          className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                        >
                          <route.icon className="h-5 w-5" />
                          {route.label}
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-auto pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span>Motyw</span>
                        <ModeToggle />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Tytuł na mobilce */}
                <span className="font-semibold">SLO Manager</span>
                <div className="w-8"></div> {/* Placeholder dla równowagi */}
              </header>

              {/* --- CONTENT STRONY --- */}
              <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-hidden">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}