import { AttendanceStatus, StaffStatus, LeaveStatus } from '../types';

interface StatusBadgeProps {
  status: AttendanceStatus | StaffStatus | LeaveStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  switch (status) {
    case 'Present':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'Late':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      dotColor = 'bg-amber-500';
      break;
    case 'Absent':
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
      dotColor = 'bg-rose-500';
      break;
    case 'On Leave':
      colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
      dotColor = 'bg-sky-500';
      break;
    case 'Active':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'Inactive':
      colorClasses = 'bg-zinc-100 text-zinc-600 border-zinc-200';
      dotColor = 'bg-zinc-400';
      break;
    case 'Approved':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'Pending':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
      dotColor = 'bg-amber-500';
      break;
    case 'Rejected':
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200';
      dotColor = 'bg-rose-500';
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${colorClasses} whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}
