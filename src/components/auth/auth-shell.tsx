'use client';

import Image from 'next/image';
import { GraduationCap, Moon, Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTheme } from '@/providers/theme-provider';

function BrandMark({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-fg">
        <GraduationCap className="size-5" aria-hidden />
      </span>
      <span
        className={`text-lg font-semibold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}
      >
        SkillBee
      </span>
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-lg border border-line bg-surface p-2 text-ink-muted transition-colors hover:text-ink"
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

/**
 * Split-screen authentication shell.
 * - ≥1024px: left branded visual panel + right form.
 * - 768–1023px: compact banner + form on canvas.
 * - <768px: immersive full-screen hero background with a centered glass card.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-canvas lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Immersive hero background — mobile only (<768px) */}
      <div className="absolute inset-0 md:hidden" aria-hidden="true">
        <Image
          src="/auth-hero.svg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1f33]/60 via-[#0b1f33]/45 to-[#0b1f33]/85" />
      </div>

      {/* Visual / branding panel — tablet & desktop banner, full panel on lg */}
      <aside className="relative hidden h-56 flex-col justify-between overflow-hidden p-6 sm:h-64 md:flex lg:h-auto lg:p-10">
        <Image
          src="/auth-hero.svg"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        {/* Readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f33]/90 via-[#0b1f33]/35 to-[#0b1f33]/10" />

        <div className="relative flex items-center justify-between">
          <BrandMark dark />
          <span className="hidden text-xs font-medium uppercase tracking-widest text-white/60 lg:block">
            Student Console
          </span>
        </div>

        <div className="relative hidden max-w-md lg:block">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
            Your Learning Journey Starts Here
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/75 xl:text-base">
            Access your courses, track your progress, and build the skills that move your future
            forward.
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative z-10 flex min-h-screen flex-1 flex-col px-5 py-6 sm:px-8 md:min-h-0 md:bg-canvas md:px-10 md:py-10 lg:items-center lg:justify-center lg:px-16">
        {/* Mobile top bar: brand + theme toggle floating over hero */}
        <div className="flex items-center justify-between md:hidden">
          <BrandMark dark />
          <ThemeToggle />
        </div>

        {/* Desktop/tablet theme toggle */}
        <div className="absolute right-5 top-5 hidden md:block lg:right-10 lg:top-8">
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8 md:py-0">
          {/* Glass card on mobile, plain column on md+ */}
          <div className="rounded-3xl border border-white/10 bg-surface/90 p-6 shadow-pop backdrop-blur-xl sm:p-8 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
