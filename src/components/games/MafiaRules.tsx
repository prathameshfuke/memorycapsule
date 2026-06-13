import Card from '../shared/Card';
import Button from '../shared/Button';

interface MafiaRulesProps {
  onStartPlaying: () => void;
}

const ROLES = [
  {
    name: 'Mafia',
    accent: true,
    description:
      'Wakes at night and quietly chooses someone to eliminate. Wins if the Mafia equals or outnumbers the remaining town.',
  },
  {
    name: 'Detective',
    accent: false,
    description:
      "Each night, investigates one person and learns if they're Mafia or not — but can't tell anyone without giving themselves away.",
  },
  {
    name: 'Doctor',
    accent: false,
    description:
      'Each night, chooses one person to protect. If the Mafia targets that person, they survive.',
  },
  {
    name: 'Villager',
    accent: false,
    description: 'No special power. Just sharp eyes, good instincts, and a vote.',
  },
];

const PHASES = [
  {
    name: 'Night',
    description:
      'Mafia, Detective, and Doctor make their choices privately on their own screens. Everyone else just waits.',
  },
  {
    name: 'Morning',
    description:
      "The app reveals who didn't make it through the night (or that everyone's safe, if the Doctor guessed right).",
  },
  {
    name: 'Day',
    description:
      "Everyone talks it out loud, in person. Who's acting suspicious? Who's too quiet? Then everyone votes on their phone for who they think is Mafia.",
  },
];

export default function MafiaRules({ onStartPlaying }: MafiaRulesProps) {
  const handleStart = () => {
    localStorage.setItem('mafia_rules_seen', 'true');
    onStartPlaying();
  };

  return (
    <div className="mafia-rules">
      <div className="mafia-rules-content">
        <div className="mafia-rules-grid">
          {/* Left Column: Intro & Actions */}
          <div className="mafia-rules-intro-column">
            <div>
              <span className="mafia-rules-eyebrow">How to play</span>
              <h1 className="mafia-rules-heading">Mafia</h1>
            </div>

            <p className="mafia-rules-intro">
              A game of secrets, suspicion, and bluffing. Everyone gets a hidden role. 
              The town doesn't know who the Mafia is. The Mafia knows everyone. 
              Each round, someone disappears at night — and during the day, 
              the town votes to cast someone out. Survive, or get them first.
            </p>

            <Card className="mafia-rules-callout">
              <p className="mafia-rules-callout-text">
                <strong>One important rule:</strong> Don't show your screen to anyone else. 
                Your role is yours alone — that's the whole game.
              </p>
            </Card>

            <div className="mafia-rules-cta">
              <Button variant="primary" onClick={handleStart} className="mafia-rules-btn">
                Got it — start playing
              </Button>
            </div>
          </div>

          {/* Right Column: Roles & Phases */}
          <div className="mafia-rules-details-column">
            <section className="mafia-rules-section">
              <h2 className="mafia-rules-section-heading">The Roles</h2>
              <dl className="mafia-rules-role-list">
                {ROLES.map((role) => (
                  <div key={role.name} className="mafia-rules-role">
                    <dt
                      className="mafia-rules-role-name"
                      style={{ color: role.accent ? 'var(--red)' : 'var(--ink)' }}
                    >
                      {role.name}
                    </dt>
                    <dd className="mafia-rules-role-desc">{role.description}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="mafia-rules-section">
              <h2 className="mafia-rules-section-heading">How a Round Works</h2>
              <div className="mafia-rules-phases">
                {PHASES.map((phase) => (
                  <div key={phase.name} className="mafia-rules-phase">
                    <span className="mafia-rules-phase-name">{phase.name}</span>
                    <span className="mafia-rules-phase-sep"> — </span>
                    <span className="mafia-rules-phase-desc">{phase.description}</span>
                  </div>
                ))}
              </div>

              <p className="mafia-rules-outro">
                The person with the most votes is eliminated and their role is revealed. 
                The game continues until the Mafia is caught, or the Mafia takes over the town.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
