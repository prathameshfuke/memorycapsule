import { useBirthdayLock } from '../../hooks/useBirthdayLock';

export default function Countdown({ className = '' }: { className?: string }) {
  const { timeRemaining, isLocked } = useBirthdayLock();

  if (!isLocked) {
    return (
      <div className={`text-center ${className}`}>
        <p
          className="text-2xl font-light font-[family-name:var(--font-display)] italic"
          style={{ color: 'var(--color-blush)' }}
        >
          the capsule is open
        </p>
      </div>
    );
  }

  const units = [
    { value: timeRemaining.days, label: 'Days' },
    { value: timeRemaining.hours, label: 'Hours' },
    { value: timeRemaining.minutes, label: 'Min' },
    { value: timeRemaining.seconds, label: 'Sec' },
  ];

  return (
    <div
      className={`grid grid-cols-4 gap-4 ${className}`}
      style={{ maxWidth: '320px', margin: '0 auto' }}
    >
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <span
            className="font-[family-name:var(--font-display)] text-3xl md:text-4xl tabular-nums text-right w-full"
            style={{ color: 'inherit', fontWeight: 400 }}
          >
            {String(unit.value).padStart(2, '0')}
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.2em] mt-1 text-center w-full"
            style={{ color: 'var(--color-dust)', fontFamily: 'var(--font-body)' }}
          >
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
