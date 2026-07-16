import { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

const navItems = [
  {
    label: 'Product',
    dropdown: ['Connections', 'Workflows', 'Insights'],
  },
  {
    label: 'Solutions',
    dropdown: ['Guides', 'Use cases', 'API reference'],
  },
  {
    label: 'About',
    dropdown: ['Our story', 'Open roles', 'Reach us'],
  },
  {
    label: 'Plans',
    dropdown: null,
  },
];

function Logo() {
  return (
    <a href="#" className="flex items-center gap-2.5">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 2L26 14L14 26L2 14L14 2Z"
          fill="white"
          fillOpacity="0.9"
        />
        <path
          d="M14 7L21 14L14 21L7 14L14 7Z"
          fill="white"
          fillOpacity="0.5"
        />
      </svg>
      <span className="text-white text-lg sm:text-xl font-medium tracking-tight">
        flowpath
      </span>
    </a>
  );
}

function DesktopNavDropdown({ items, open, onMouseEnter, onMouseLeave }) {
  if (!open) return null;
  return (
    <div
      className="!absolute top-full left-0 liquid-glass rounded-xl py-3 px-2 min-w-[160px] shadow-xl animate-dropdown"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {items.map((item) => (
        <a
          key={item}
          href="#"
          className="block text-white/80 hover:text-white text-sm rounded-lg hover:bg-white/5 px-3 py-2"
        >
          {item}
        </a>
      ))}
    </div>
  );
}

function DesktopNav() {
  const [openDropdown, setOpenDropdown] = useState(null);

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => (
        <div
          key={item.label}
          className="relative"
          onMouseEnter={() => item.dropdown && setOpenDropdown(item.label)}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <button className="flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
            {item.label}
            {item.dropdown && (
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  openDropdown === item.label ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>
          {item.dropdown && (
            <DesktopNavDropdown
              items={item.dropdown}
              open={openDropdown === item.label}
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            />
          )}
        </div>
      ))}
    </nav>
  );
}

function MobileMenu({ open, onClose }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  if (!open) return null;

  return (
    <div
      className="absolute top-full left-0 right-0 mt-2 mx-2 bg-[#2C221C]/95 backdrop-blur-xl rounded-2xl p-6 z-50 animate-dropdown"
      style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)', transitionDuration: '400ms' }}
    >
      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <div key={item.label}>
            <button
              onClick={() =>
                item.dropdown && setOpenDropdown(openDropdown === item.label ? null : item.label)
              }
              className="flex items-center justify-between w-full text-white/90 hover:text-white text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              {item.label}
              {item.dropdown && (
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    openDropdown === item.label ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>
            {item.dropdown && openDropdown === item.label && (
              <div className="ml-4 flex flex-col gap-0.5">
                {item.dropdown.map((subItem) => (
                  <a
                    key={subItem}
                    href="#"
                    className="text-white/70 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {subItem}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
        <a
          href="#"
          className="text-white/90 hover:text-white text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-white/5 text-center transition-colors"
        >
          Log in
        </a>
        <a
          href="#"
          className="liquid-glass rounded-full px-5 py-2.5 text-white text-sm font-medium text-center"
        >
          Try it free
        </a>
      </div>
    </div>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full relative z-50">
      <div className="flex items-center justify-between px-5 sm:px-6 md:px-12 lg:px-16 py-4 sm:py-5">
        <Logo />
        <DesktopNav />
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#"
            className="text-white/90 hover:text-white text-sm font-medium transition-colors"
          >
            Log in
          </a>
          <a
            href="#"
            className="liquid-glass rounded-full px-5 py-2 text-white text-sm font-medium"
          >
            Try it free
          </a>
        </div>
        <button
          className="md:hidden relative w-8 h-8 flex items-center justify-center text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`absolute transition-all duration-300 ${
              mobileOpen
                ? 'rotate-90 scale-0 opacity-0'
                : 'rotate-0 scale-100 opacity-100'
            }`}
          >
            <Menu size={22} />
          </span>
          <span
            className={`absolute transition-all duration-300 ${
              mobileOpen
                ? 'rotate-0 scale-100 opacity-100'
                : '-rotate-90 scale-0 opacity-0'
            }`}
          >
            <X size={22} />
          </span>
        </button>
      </div>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

export default function HeroSection() {
  return (
    <section className="h-screen w-full overflow-hidden relative">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260703_053131_1ec3dd1c-d627-44fb-ab20-6e1fce41b0d5.mp4"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <Navbar />

        {/* Hero content */}
        <div className="flex-1 flex items-start justify-center pt-16 sm:pt-20 md:pt-24">
          <div className="text-center max-w-3xl px-5 sm:px-6">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] tracking-[-0.02em]">
              Bridge the
              <br />
              gaps. <span className="text-white/60">Ditch the</span>
              <br />
              <span className="text-white/60">grindwork.</span>
            </h1>
            <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto mt-6 sm:mt-8">
              Flowpath unifies your complete wellness tools, so your crew spends
              less energy plugging gaps and more on real progress.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <a
                href="#"
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-900 text-sm font-semibold rounded-full hover:bg-white/90 transition-colors"
              >
                Begin your journey
              </a>
              <a
                href="#"
                className="px-5 sm:px-6 py-2.5 sm:py-3 liquid-glass rounded-full text-white text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                See it live
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
