import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-950/[0.06]">
      <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
        {icon}
      </span>
      <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-600">{description}</p>
    </article>
  );
}
