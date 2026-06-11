import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Countdown from '../components/shared/Countdown';

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
  const isInView = useInView(ref, { once: true, margin: '-100px' });
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
    const el = document.getElementById('beginning-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.section
      ref={targetRef}
      style={{ opacity, y: yTranslate }}
      className="relative min-h-[100dvh] w-full flex items-center bg-[#FAF7F2] overflow-hidden"
    >
      {/* Full bleed grid */}
      <div className="w-full min-h-[100dvh] grid grid-cols-1 md:grid-cols-12 items-center">
        {/* Visual Frame - Left Column on Desktop */}
        <div className="md:col-span-6 w-full h-full min-h-[50vh] md:min-h-screen flex items-center justify-center p-6 bg-[#FAF7F2] relative">
          {/* Subtle warm overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FAF7F2] to-[#FAF7F2]/40 z-10 pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, rotate: -3 }}
            animate={{ opacity: 1, rotate: -1.5 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-20"
          >
            {/* Polaroid image frame */}
            <div
              className="w-64 h-80 md:w-80 md:h-[400px] p-4 bg-[#FAF7F2] border border-[var(--color-dust)] rounded-[4px]"
              style={{
                boxShadow: 'none',
              }}
            >
              <img
                src={latestImg}
                alt="Kashish"
                className="w-full h-full object-cover grayscale brightness-[1.02] contrast-[0.98]"
              />
            </div>
          </motion.div>
        </div>

        {/* Text Details - Right Column on Desktop */}
        <div className="md:col-span-6 w-full h-full flex flex-col justify-center px-8 md:px-16 py-12 md:py-0 bg-[#FAF7F2] relative">
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md space-y-6 text-left"
          >
            <p className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--color-dust)]">
              5 July 2026
            </p>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-tight text-[var(--color-ink)] font-[family-name:var(--font-display)]">
              a small celebration
            </h1>
            <p className="text-xl md:text-2xl font-light italic leading-relaxed text-[var(--color-dust)] font-[family-name:var(--font-display)]">
              for someone who means a lot to all of us.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <button
                onClick={scrollToJourney}
                className="px-8 py-3 rounded-[4px] text-xs font-medium tracking-[0.2em] uppercase transition-colors cursor-pointer border border-[var(--color-dust)] text-[var(--color-ink)] hover:bg-[var(--color-cream)]"
              >
                begin the chapters
              </button>
              
              <div className="scale-90 origin-left">
                <Countdown />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

/* ─── Story Section Template ─── */
function StorySection({
  id,
  image,
  title,
  caption,
  style = 'polaroid',
  rotation = 0,
  isEven,
}: {
  id: string;
  image: string;
  title: string;
  caption: string;
  style?: 'polaroid' | 'scrapbook' | 'film' | 'cinematic';
  rotation?: number;
  isEven: boolean;
}) {
  const renderImage = () => {
    switch (style) {
      case 'polaroid':
        return (
          <div
            className="bg-[#FAF7F2] p-4 pb-8 border border-[var(--color-dust)] rounded-[4px]"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <img src={image} alt={title} className="w-full aspect-square object-cover mb-4" />
            <div className="h-6 w-full bg-[#FAF7F2] border-t border-[var(--color-dust)]/10" />
          </div>
        );
      case 'scrapbook':
        return (
          <div
            className="p-3 bg-[#FAF7F2] border border-[var(--color-dust)] rounded-[4px] relative"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {/* Scrapbook photo tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[rgba(201,137,122,0.15)] border border-dashed border-[var(--color-dust)]/20 rotate-[-2deg]" />
            <img src={image} alt={title} className="w-full aspect-[4/3] object-cover rounded-[2px]" />
          </div>
        );
      case 'film':
        return (
          <div className="relative py-4 bg-[#1A1614] px-6 rounded-[4px] border border-[var(--color-dust)]">
            {/* Film strip edge markings */}
            <div className="absolute top-0 bottom-0 left-2 w-2 flex flex-col justify-between py-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-1.5 h-3 bg-[#FAF7F2] rounded-[1px]" />
              ))}
            </div>
            <div className="absolute top-0 bottom-0 right-2 w-2 flex flex-col justify-between py-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-1.5 h-3 bg-[#FAF7F2] rounded-[1px]" />
              ))}
            </div>
            <img src={image} alt={title} className="w-full aspect-[3/2] object-cover grayscale brightness-95" />
          </div>
        );
      case 'cinematic':
        return (
          <div className="rounded-[4px] overflow-hidden border border-[var(--color-dust)] relative">
            <img src={image} alt={title} className="w-full aspect-[16/10] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614]/40 to-transparent" />
          </div>
        );
      default:
        return <img src={image} alt={title} className="w-full object-cover rounded-[4px]" />;
    }
  };

  return (
    <section id={id} className="min-h-[85vh] flex items-center justify-center py-20 px-6 border-b border-[var(--color-dust)]/10">
      <div className="w-full max-w-[860px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        {/* Asymmetric layout logic: Alternate ordering on desktop, Normal order on mobile */}
        <FadeInSection className={isEven ? "md:order-1" : "md:order-2"} delay={0}>
          <div className="relative z-10">{renderImage()}</div>
        </FadeInSection>

        <FadeInSection className={isEven ? "md:order-2" : "md:order-1"} delay={0.15}>
          <div className={`space-y-4 ${isEven ? 'text-left' : 'text-left md:text-right'}`}>
            <h2
              className="text-2xl md:text-3xl font-light"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
            >
              {title}
            </h2>
            <p
              className="text-base md:text-lg leading-relaxed text-[var(--color-dust)] whitespace-pre-line"
              style={{ fontFamily: 'var(--font-body)' }}
            >
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
    <section className="min-h-screen flex flex-col items-center justify-center py-24 px-6 relative bg-[#FAF7F2]/50 border-t border-[var(--color-dust)]/10">
      {/* Decorative vertical separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-[var(--color-dust)]/20" />

      <div className="w-full max-w-xl text-center space-y-12">
        <FadeInSection>
          <div
            className="w-full aspect-[4/5] md:aspect-square max-w-sm mx-auto p-4 bg-[#FAF7F2] border border-[var(--color-dust)] rounded-[4px]"
            style={{ transform: 'rotate(1deg)' }}
          >
            <img src={latestImg} alt="Latest Portrait" className="w-full h-full object-cover grayscale" />
          </div>
        </FadeInSection>

        <FadeInSection delay={0.15}>
          <div className="space-y-4">
            <p
              className="text-xl md:text-2xl leading-loose font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]"
            >
              And now,
            </p>
            <p
              className="text-2xl md:text-3xl leading-loose font-light font-[family-name:var(--font-display)] text-[var(--color-ink)]"
            >
              another year.
              <br />
              another memory.
              <br />
              another chapter.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.3} className="pt-6">
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            {/* Play Games Button */}
            <button
              onClick={() => navigate('/games')}
              className="py-4 rounded-[4px] text-xs font-medium uppercase tracking-[0.2em] cursor-pointer border border-[var(--color-dust)] text-[var(--color-ink)] bg-[var(--color-cream)] hover:bg-[#FAF7F2] transition-colors"
            >
              play party games
            </button>

            {/* Direct Dashboard Access Button for Guest / Admin */}
            {showGuestDashboard && (
              <button
                onClick={() => navigate('/guest')}
                className="py-4 rounded-[4px] text-xs font-medium uppercase tracking-[0.2em] cursor-pointer bg-[var(--color-ink)] text-[var(--color-cream)] hover:bg-[var(--color-ink)]/90 transition-colors"
              >
                enter guest area
              </button>
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
      {/* Film grain layer overlay */}
      <div className="film-grain pointer-events-none fixed inset-0 z-40" />

      <HeroSection />

      {/* Chapter 1: The Beginning */}
      <StorySection
        id="beginning-section"
        image={babyImg}
        title="The Beginning"
        caption={`Every family album has a few photos\nthat somehow survive every cleanup.\n\nThis is one of them.`}
        style="polaroid"
        rotation={-2}
        isEven={true}
      />

      {/* Chapter 2: Strong Opinions */}
      <StorySection
        id="opinions-section"
        image={angydonImg}
        title="Strong Opinions Since Day One"
        caption={`Some things change with time.\n\nThat look isn't one of them.`}
        style="scrapbook"
        rotation={3}
        isEven={false}
      />

      {/* Chapter 3: Center Stage */}
      <StorySection
        id="stage-section"
        image={kidImg}
        title="Center Stage"
        caption={`School functions.\nDance performances.\nAnnual days.\n\nThe camera somehow always found her.`}
        style="film"
        isEven={true}
      />

      {/* Chapter 4: The Version We Know */}
      <StorySection
        id="version-section"
        image={landerImg}
        title="The Version We Know"
        caption={`Somewhere between\nthe old photo albums\nand today,\n\nshe became everyone's favourite person.`}
        style="scrapbook"
        rotation={-1.5}
        isEven={false}
      />

      {/* Chapter 5: Aaj Kal */}
      <StorySection
        id="today-section"
        image={presentImg}
        title="Aaj Kal"
        caption={`A little older.\n\nA little wiser.\n\nStill exactly herself.`}
        style="cinematic"
        isEven={true}
      />

      <FinalRevealSection />
    </PageWrapper>
  );
}
