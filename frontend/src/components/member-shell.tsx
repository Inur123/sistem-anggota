import Link from "next/link";
import { ChevronDownIcon, LockKeyholeIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandMark } from "@/components/brand-mark";
import { LogoutMenuItem } from "@/components/logout-menu-item";
import type { SessionUser } from "@/types/member";

type MemberShellProps = {
  user: SessionUser;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
};

export function MemberShell({ user, eyebrow, title, description, children }: MemberShellProps) {
  const initials = (user.name || "Anggota")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="member-canvas flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/75 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-18 w-full max-w-[1280px] items-center justify-between px-4 sm:h-20 sm:px-8 lg:px-10">
          <Link href="/profile" className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25">
            <BrandMark />
            <span className="leading-tight">
              <span className="block font-display text-sm font-extrabold tracking-[-0.025em] text-foreground">Sistem Anggota</span>
              <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[0.18em] text-primary/65">Ruang anggota</span>
            </span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger className="group flex items-center gap-2 rounded-xl border border-border/85 bg-white py-1.5 pl-1.5 pr-2 shadow-sm outline-none transition hover:border-primary/25 focus-visible:ring-3 focus-visible:ring-ring/25 data-[popup-open]:border-primary/25">
              <Avatar className="size-8">
                {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                <AvatarFallback className="bg-secondary font-bold text-primary">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-36 truncate text-sm font-semibold sm:block">{user.name}</span>
              <ChevronDownIcon className="size-3.5 text-muted-foreground transition-transform group-data-[popup-open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2 w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <span className="block truncate font-semibold text-foreground">{user.name}</span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <LogoutMenuItem />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 sm:px-8 sm:py-11 lg:px-10">
        {title ? (
          <div className="mx-auto mb-8 w-full max-w-5xl sm:mb-10">
            {eyebrow ? <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">{eyebrow}</p> : null}
            <h1 className="text-balance font-display text-3xl font-[760] leading-[1.04] tracking-[-0.045em] text-foreground sm:text-5xl">{title}</h1>
            {description ? <p className="text-pretty mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px] sm:leading-7">{description}</p> : null}
          </div>
        ) : null}
        {children}
      </main>

      <footer className="relative z-10 border-t border-border/75 bg-background/75">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-5 text-[11px] font-semibold text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>© {new Date().getFullYear()} Sistem Anggota IPNU IPPNU</span>
          <span className="flex items-center gap-1.5"><LockKeyholeIcon className="size-3.5 text-primary" /> Data sensitif disimpan secara terenkripsi</span>
        </div>
      </footer>
    </div>
  );
}
