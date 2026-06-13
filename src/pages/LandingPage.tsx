import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/shared/Button';
import { useBirthdayLock } from '../hooks/useBirthdayLock';
import babyImg from '../assets/baby.png';
import angydonImg from '../assets/angydon.png';
import troubledImg from '../assets/troubled.png';
import smallImg from '../assets/small.png';
import glassesImg from '../assets/glasses.png';
import kidImg from '../assets/kid.png';
import landerImg from '../assets/lander.png';
import presentImg from '../assets/present.png';
import latestImg from '../assets/latest.png';

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.18 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function Tape({ className = '' }: { className?: string }) {
  return <span className={`scrapbook-tape ${className}`} aria-hidden="true" />;
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '9%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);

  return (
    <section ref={ref} className="scrapbook-hero">
      <motion.img
        src={latestImg}
        alt="Kashish in a lavender saree"
        className="scrapbook-hero-image"
        style={{ y: imageY }}
      />
      <div className="scrapbook-hero-wash" />
      <motion.div
        className="scrapbook-hero-content"
        style={{ y: contentY }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease }}
      >
        <p className="scrapbook-kicker">A birthday collection</p>
        <h1>Kashish</h1>
        <p>A collection of moments,<br />memories and people.</p>
        <Button
          className="scrapbook-begin"
          onClick={() => document.getElementById('story-start')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Begin
        </Button>
      </motion.div>
      <span className="scrapbook-scroll-cue" aria-hidden="true" />
    </section>
  );
}

function BeforeEveryone() {
  return (
    <section id="story-start" className="story-block story-before">
      <div className="story-shell">
        <Reveal className="story-heading">
          <span className="story-number">01</span>
          <h2>Before everyone<br />knew her</h2>
        </Reveal>
        <Reveal className="baby-polaroid" delay={0.1}>
          <Tape />
          <img src={babyImg} alt="Kashish as a baby" />
          <span className="handwritten">the original</span>
        </Reveal>
        <Reveal className="story-copy" delay={0.18}>
          <p>Every family album has <br />one photograph that survives <br />every cleanup.</p>
          <p>This is one of them.</p>
        </Reveal>
      </div>
    </section>
  );
}

const collagePhotos = [
  { image: angydonImg, label: 'Strong opinions.', className: 'collage-one' },
  { image: troubledImg, label: 'Zero patience.', className: 'collage-two' },
  { image: smallImg, label: 'Tiny CEO.', className: 'collage-three' },
  { image: glassesImg, label: 'Main character since birth.', className: 'collage-four' },
];

function ScrapbookWall() {
  return (
    <section className="story-block scrapbook-wall">
      <div className="story-shell">
        <Reveal className="wall-title">
          <span className="story-number">02</span>
          <h2>Evidence of<br /><em>a personality</em></h2>
        </Reveal>
        <div className="collage-board">
          {collagePhotos.map((photo, index) => (
            <Reveal key={photo.label} className={`collage-photo ${photo.className}`} delay={index * 0.06}>
              <Tape />
              <img src={photo.image} alt={photo.label} />
              <span className="handwritten">{photo.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CenterStage() {
  return (
    <section className="story-block center-stage">
      <div className="stage-glow" aria-hidden="true" />
      <div className="story-shell">
        <Reveal className="stage-title">
          <span className="story-number">03</span>
          <h2>Center stage</h2>
        </Reveal>
        <Reveal className="stage-photo" delay={0.08}>
          <img src={kidImg} alt="Kashish performing as a child" />
        </Reveal>
        <Reveal className="stage-copy" delay={0.16}>
          <p>School functions.</p>
          <p>Dance performances.</p>
          <p>Annual days.</p>
          <strong>Somehow the camera always found her.</strong>
        </Reveal>
      </div>
    </section>
  );
}

function VersionWeKnow() {
  return (
    <section className="story-block version-known">
      <div className="story-shell">
        <Reveal className="version-note">
          <span className="story-number">04</span>
          <p>The version<br />we know</p>
        </Reveal>
        <Reveal className="landscape-frame" delay={0.08}>
          <Tape className="tape-left" />
          <Tape className="tape-right" />
          <img src={landerImg} alt="Kashish smiling outdoors" />
        </Reveal>
        <Reveal delay={0.16}>
          <h2 className="no-explanation">No explanation<br /><em>needed.</em></h2>
        </Reveal>
      </div>
    </section>
  );
}

function Today() {
  return (
    <section className="story-block today-block">
      <div className="story-shell">
        <Reveal className="today-title">
          <span className="story-number">05</span>
          <h2>Today</h2>
        </Reveal>
        <div className="today-stack">
          <Reveal className="today-photo today-photo-back">
            <img src={presentImg} alt="Kashish today" />
          </Reveal>
          <Reveal className="today-photo today-photo-front" delay={0.12}>
            <Tape />
            <img src={latestImg} alt="Kashish in a lavender saree" />
            <span className="handwritten">still exactly herself</span>
          </Reveal>
        </div>
        <Reveal className="today-copy" delay={0.2}>
          <p>Some things change.</p>
          <p>Some things don't.</p>
        </Reveal>
      </div>
    </section>
  );
}

function BirthdayCountdown() {
  const { timeRemaining, isLocked } = useBirthdayLock();
  const units = [
    ['Days', timeRemaining.days],
    ['Hours', timeRemaining.hours],
    ['Minutes', timeRemaining.minutes],
    ['Seconds', timeRemaining.seconds],
  ] as const;

  return (
    <section className="story-block countdown-block">
      <div className="story-shell">
        <Reveal className="countdown-card">
          <p className="countdown-kicker">{isLocked ? 'Birthday unlock in:' : 'The birthday capsule is'}</p>
          {isLocked ? (
            <div className="countdown-grid">
              {units.map(([label, value]) => (
                <div key={label}>
                  <strong>{String(value).padStart(2, '0')}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          ) : (
            <h2>Open</h2>
          )}
          <p className="countdown-date">July 5 · made quietly, with love</p>
        </Reveal>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <PageWrapper className="scrapbook-page !pb-0">
      <Hero />
      <main>
        <BeforeEveryone />
        <ScrapbookWall />
        <CenterStage />
        <VersionWeKnow />
        <Today />
        <BirthdayCountdown />
      </main>
    </PageWrapper>
  );
}
