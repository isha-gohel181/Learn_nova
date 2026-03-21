import { Bell, Search, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

export default function NavBar() {
  return (
    <motion.nav
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 glass-panel"
    >
      <div className="flex items-center gap-3 w-1/3">
        <div className="flex items-center gap-3 rounded-full border border-[rgba(59,130,246,0.35)] bg-[rgba(255,255,255,0.04)] px-4 py-1.5 text-[#E5E7EB] shadow-[0_0_14px_rgba(59,130,246,0.25)]">
              <img
                src="/Logo.jpeg"
                alt="LearnNova logo"
                className="h-10 w-10 rounded-xl bg-white/70 p-1 object-contain shadow-[0_0_18px_rgba(34,211,238,0.55)] ring-[0.5px] ring-[rgba(59,130,246,0.3)] brightness-110 contrast-110"
              />
          <div>
            <p className="font-heading text-[11px] uppercase tracking-[0.28em] text-[#93C5FD]">LearnNova</p>
            <p className="text-[10px] text-[#9CA3AF]">Neon Frost OS</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 text-sm font-medium text-[#D1D5DB] border border-[rgba(59,130,246,0.25)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white">
          Courses
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-[#E5E7EB] border border-[rgba(59,130,246,0.35)] bg-[rgba(59,130,246,0.15)] shadow-[0_0_12px_rgba(59,130,246,0.3)]">
          Reporting
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-[#D1D5DB] border border-[rgba(59,130,246,0.25)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white">
          Settings
        </button>
      </div>

      <div className="w-1/3 flex justify-end items-center gap-3">
        <div className="relative w-full max-w-[260px] group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <Input
            type="search"
            placeholder="Search lessons"
            className="w-full pl-9 glass-input text-[#E5E7EB] placeholder:text-[#9CA3AF] rounded-full h-9 focus-visible:ring-[rgba(34,211,238,0.6)]"
          />
        </div>
        <button className="h-9 w-9 rounded-full border border-[rgba(59,130,246,0.35)] bg-[rgba(255,255,255,0.05)] text-[#93C5FD] shadow-[0_0_12px_rgba(59,130,246,0.25)] hover:text-white">
          <Bell className="h-4 w-4 mx-auto" />
        </button>
        <button className="h-9 w-9 rounded-full border border-[rgba(34,211,238,0.4)] bg-[rgba(34,211,238,0.12)] text-[#22D3EE] shadow-[0_0_14px_rgba(34,211,238,0.35)] hover:text-white">
          <UserCircle className="h-4 w-4 mx-auto" />
        </button>
      </div>
    </motion.nav>
  );
}
