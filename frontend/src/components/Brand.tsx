import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Learnova Tutor home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
        <BookOpen className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span className={`text-[17px] font-bold tracking-[-0.04em] ${light ? 'text-white' : 'text-slate-900'}`}>
        Learnova <span className={`font-medium ${light ? 'text-indigo-200' : 'text-slate-500'}`}>Tutor</span>
      </span>
    </Link>
  );
}
