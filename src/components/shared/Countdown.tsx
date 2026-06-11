import { useBirthdayLock } from '../../hooks/useBirthdayLock';

export default function Countdown({ className = '' }: { className?: string }) {
  const { timeRemaining, isLocked } = useBirthdayLock();

  if (!isLocked) {
    return (
      <div className={`text-center ${className}`}>
        <span className="text-2xl">🎉</span>
        <p className="font-[family-name:var(--font-display)] text-[var(--color-brown)] text-lg mt-1">
          Unlocked!
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
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span
              className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-semibold tabular-nums"
              style={{ color: 'var(--color-brown)' }}
            >
              {String(unit.value).padStart(2, '0')}
            </span>
            <span
              className="text-[10px] uppercase tracking-widest mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span
              className="font-[family-name:var(--font-display)] text-2xl -mt-4"
              style={{ color: 'var(--color-accent)' }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
