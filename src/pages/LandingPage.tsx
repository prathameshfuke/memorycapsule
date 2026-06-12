import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Countdown from '../components/shared/Countdown';
import Button from '../components/shared/Button';

// Import local photos
import babyImg from '../assets/baby.png';
import angydonImg from '../assets/angydon.png';
import kidImg from '../assets/kid.png';
import landerImg from '../assets/lander.png';
import presentImg from '../assets/present.png';
import latestImg from '../assets/latest.png';

/* ─── Scroll Fade-In Wrapper ─── */
function FadeInSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const yTranslate = useTransform(scrollYProgress, [0, 0.6], [0, prefersReducedMotion ? 0 : -30]);

  const scrollToJourney = () => {
    const el = document.getElementById('chapter-01');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.section
      ref={targetRef}
      style={{ opacity, y: yTranslate }}
      className="relative min-h-[100dvh] w-full flex items-center justify-center bg-[var(--color-ink)] overflow-hidden"
    >
      {/* Film grain on dark */}
      <div className="film-grain pointer-events-none absolute inset-0 z-10" />

      {/* Vignette */}
      <div className="ink-vignette absolute inset-0 z-20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-30 text-center px-6 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          <h1
            className="font-[family-name:var(--font-display)] italic font-light text-[var(--color-cream)]"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1.05 }}
          >
            Her Story
          </h1>
          <p
            className="text-base md:text-lg font-[family-name:var(--font-body)] text-[var(--color-dust)] max-w-[480px] mx-auto leading-relaxed"
          >
            A collection of moments, memories and people.
          </p>

          <div className="pt-4">
            <Button variant="primary" onClick={scrollToJourney}>
              begin
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ─── Story Chapter ─── */
function StoryChapter({
  id,
  image,
  title,
  caption,
  chapterNum,
  style = 'polaroid',
  rotation = 0,
  isEven,
}: {
  id: string;
  image: string;
  title: string;
  caption: string;
  chapterNum: string;
  style?: 'polaroid' | 'scrapbook' | 'film' | 'cinematic';
  rotation?: number;
  isEven: boolean;
}) {
  const frameClass = "bg-[var(--color-cream)] p-4 border border-[var(--color-ember)] rounded-[4px]";

  const renderImage = () => {
    switch (style) {
      case 'polaroid':
        return (
          <div
            className={`${frameClass} pb-10`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <img src={image} alt={title} className="w-full object-cover" style={{ aspectRatio: '4/5' }} />
          </div>
        );
      case 'scrapbook':
        return (
          <div
            className={`${frameClass} relative`}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[rgba(201,137,122,0.15)] border border-dashed border-[var(--color-dust)]/20 rotate-[-2deg]" />
            <img src={image} alt={title} className="w-full object-cover rounded-[2px]" style={{ aspectRatio: '4/5' }} />
          </div>
        );
      case 'film':
        return (
          <div className={`${frameClass} relative py-4 bg-[var(--color-ink)] border-[var(--color-dust)]`}>
            <div className="absolute top-0 bottom-0 left-2 w-2 flex flex-col justify-between py-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-1.5 h-3 bg-[var(--color-cream)] rounded-[1px]" />
              ))}
            </div>
            <div className="absolute top-0 bottom-0 right-2 w-2 flex flex-col justify-between py-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-1.5 h-3 bg-[var(--color-cream)] rounded-[1px]" />
              ))}
            </div>
            <img src={image} alt={title} className="w-full object-cover grayscale brightness-95" style={{ aspectRatio: '4/5' }} />
          </div>
        );
      case 'cinematic':
        return (
          <div className={`${frameClass} p-1 overflow-hidden relative`}>
            <img src={image} alt={title} className="w-full object-cover rounded-[2px]" style={{ aspectRatio: '4/5' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/20 to-transparent" />
          </div>
        );
      default:
        return (
          <div className={frameClass}>
            <img src={image} alt={title} className="w-full object-cover" style={{ aspectRatio: '4/5' }} />
          </div>
        );
    }
  };

  return (
    <section id={id} className="w-full">
      <div className="max-w-[860px] mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-[48px] items-center">
        {/* Asymmetric layout: alternate ordering on desktop */}
        <FadeInSection className={isEven ? 'md:order-1' : 'md:order-2'} delay={0}>
          <div className="relative z-10">{renderImage()}</div>
        </FadeInSection>

        <FadeInSection className={isEven ? 'md:order-2' : 'md:order-1'} delay={0.15}>
          <div className={`space-y-4 ${isEven ? 'text-left' : 'text-left md:text-right'}`}>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[var(--color-dust)]">
              {chapterNum}
            </span>
            <h2
              className="text-2xl md:text-3xl font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]"
            >
              {title}
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-[var(--color-dust)] whitespace-pre-line font-[family-name:var(--font-body)]">
              {caption}
            </p>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── Final Reveal Section ─── */
function FinalRevealSection() {
  const navigate = useNavigate();
  const mode = localStorage.getItem('mode');
  const showGuestDashboard = mode === 'guest' || mode === 'admin';

  return (
    <section className="min-h-[100dvh] flex flex-col items-center justify-center py-24 px-6 relative bg-[var(--color-parchment)]">
      {/* Decorative vertical separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-[var(--color-dust)]/20" />

      <div className="w-full max-w-md text-center space-y-8">
        <FadeInSection>
          <div
            className="w-full max-w-xs mx-auto p-4 bg-[var(--color-cream)] border border-[var(--color-dust)] rounded-[4px]"
            style={{ transform: 'rotate(1deg)' }}
          >
            <img src={latestImg} alt="Latest Portrait" className="w-full object-cover grayscale" style={{ aspectRatio: '4/5' }} />
          </div>
        </FadeInSection>

        <FadeInSection delay={0.15}>
          <div className="space-y-4">
            <p className="text-xl md:text-2xl leading-loose font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
              And now,
            </p>
            <p className="text-2xl md:text-3xl leading-loose font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]">
              another year.
              <br />
              another memory.
              <br />
              another chapter.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.3}>
          <div className="pt-8">
            <Countdown />
          </div>
        </FadeInSection>

        <FadeInSection delay={0.4} className="pt-4">
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            <Button variant="ghost" onClick={() => navigate('/games')} fullWidth>
              play party games
            </Button>
            {showGuestDashboard && (
              <Button variant="primary" onClick={() => navigate('/guest')} fullWidth>
                enter guest area
              </Button>
            )}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  return (
    <PageWrapper>
      <HeroSection />

      {/* 96px gap between chapters */}
      <div className="bg-[var(--color-parchment)] w-full py-24 flex flex-col gap-[96px]">
        <StoryChapter
          id="chapter-01"
          image={babyImg}
          title="The Beginning"
          caption={`Every family album has a few photos\nthat somehow survive every cleanup.\n\nThis is one of them.`}
          chapterNum="Chapter 01"
          style="polaroid"
          rotation={-2}
          isEven={true}
        />

        <StoryChapter
          id="chapter-02"
          image={angydonImg}
          title="Strong Opinions Since Day One"
          caption={`Some things change with time.\n\nThat look isn't one of them.`}
          chapterNum="Chapter 02"
          style="scrapbook"
          rotation={3}
          isEven={false}
        />

        <StoryChapter
          id="chapter-03"
          image={kidImg}
          title="Center Stage"
          caption={`School functions.\nDance performances.\nAnnual days.\n\nThe camera somehow always found her.`}
          chapterNum="Chapter 03"
          style="film"
          isEven={true}
        />

        <StoryChapter
          id="chapter-04"
          image={landerImg}
          title="The Version We Know"
          caption={`Somewhere between\nthe old photo albums\nand today,\n\nshe became everyone's favourite person.`}
          chapterNum="Chapter 04"
          style="scrapbook"
          rotation={-1.5}
          isEven={false}
        />

        <StoryChapter
          id="chapter-05"
          image={presentImg}
          title="Aaj Kal"
          caption={`A little older.\n\nA little wiser.\n\nStill exactly herself.`}
          chapterNum="Chapter 05"
          style="cinematic"
          isEven={true}
        />
      </div>

      <FinalRevealSection />
    </PageWrapper>
  );
}
