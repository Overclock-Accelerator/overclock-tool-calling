'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/chat', label: 'Basic Chat' },
  { href: '/tools', label: 'Chat with Price Tools' },
  { href: '/crm', label: 'Medline CRM' },
  { href: '/agent', label: 'Medline Agent' },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 flex items-center gap-8 border-b border-zinc-800 bg-[#0a0a0a]/95 px-6 py-3 backdrop-blur-sm font-sans">
      <Link
        href="/"
        className="mr-2 text-lg font-bold tracking-tight text-zinc-100"
      >
        <span className="text-teal-400">Overclock</span>{' '}
        <span className="text-zinc-400 font-normal">Tool Calling</span>
      </Link>

      <div className="flex items-center gap-1">
        {navLinks.map(({ href, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
