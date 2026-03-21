import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-[#0B0F1A]/95 border-b border-[#1F2937]">
      <div className="flex items-center gap-3 w-1/3">
        <div className="text-[#E5E7EB] border border-[#4B5563] px-3 py-1.5 text-sm bg-transparent">
          App name and logo
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 text-sm font-medium text-[#D1D5DB] border border-[#4B5563] bg-transparent hover:bg-[#1F2937] transition-colors">
          Courses
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-[#E5E7EB] border border-[#6B7280] bg-[#1F2937]/50 shadow-inner">
          Reporting
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-[#D1D5DB] border border-[#4B5563] bg-transparent hover:bg-[#1F2937] transition-colors">
          Setting
        </button>
      </div>

      <div className="w-1/3 flex justify-end">
        <div className="relative w-full max-w-[240px] group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <Input 
            type="search" 
            placeholder="Allow to search..." 
            className="w-full pl-9 bg-transparent border-[#4B5563] text-[#E5E7EB] focus:border-[#6B7280] focus:ring-0 rounded-md h-9 transition-all placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>
    </nav>
  );
}
