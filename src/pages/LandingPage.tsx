import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../hooks/useGuest';
import { TIMELINE_CHAPTERS } from '../lib/constants';
import PageWrapper from '../components/layout/PageWrapper';
import Countdown from '../components/shared/Countdown';

// Import images — these will be replaced when actual photos are added back
import babyImg from '../assets/baby.jpg';
import baby2Img from '../assets/baby2.jpg';
import donImg from '../assets/don.jpg';
import presentImg from '../assets/present.jpg';
import landerImg from '../assets/lander.jpg';

const imageMap: Record<string, string> = {
  'baby.jpg': babyImg,
  'baby2.jpg': baby2Img,
  'don.jpg': donImg,
  'present.jpg': presentImg,
  'lander.jpg': landerImg,
};

/* ─── Fade-in on scroll wrapper ─── */
function FadeInSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
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
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 60]);

  const scrollToJourney = () => {
    const el = document.getElementById('intro-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.section
      ref={targetRef}
      style={{ opacity, scale, y }}
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden"
    >
      {/* Subtle floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
              background: 'var(--color-accent-light)',
              opacity: 0.2 + Math.random() * 0.15,
              left: `${10 + Math.random() * 80}%`,
              top: `${20 + Math.random() * 60}%`,
              animation: `float ${5 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-8"
      >
        <div
          className="w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden float"
          style={{
            boxShadow: '0 12px 48px rgba(93, 64, 55, 0.15), 0 4px 16px rgba(93, 64, 55, 0.08)',
            border: '4px solid rgba(244, 239, 230, 0.8)',
          }}
        >
          <img
            src={landerImg}
            alt="Her beautiful smile"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Decorative ring */}
        <div
          className="absolute inset-[-8px] rounded-full border border-dashed pointer-events-none"
          style={{ borderColor: 'rgba(212, 163, 115, 0.25)' }}
        />
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-center max-w-md"
      >
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-4"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
        >
          Her Story
        </h1>
        <p
          className="text-base md:text-lg leading-relaxed mb-2"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
        >
          Some people make memories.
        </p>
        <p
          className="text-base md:text-lg leading-relaxed italic"
          style={{ color: 'var(--color-brown)', fontFamily: 'var(--font-display)' }}
        >
          She somehow became one.
        </p>
      </motion.div>

      {/* Countdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-8"
      >
        <Countdown />
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        onClick={scrollToJourney}
        className="mt-10 px-8 py-3 rounded-full text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer"
        style={{
          background: 'var(--color-brown)',
          color: 'var(--color-cream)',
          boxShadow: '0 4px 20px rgba(93, 64, 55, 0.2)',
        }}
        whileHover={{ scale: 1.05, boxShadow: '0 6px 24px rgba(93, 64, 55, 0.3)' }}
        whileTap={{ scale: 0.98 }}
      >
        Begin The Journey
      </motion.button>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border-2 flex justify-center pt-1.5"
          style={{ borderColor: 'var(--color-brown-light)' }}
        >
          <div
            className="w-1 h-2 rounded-full"
            style={{ background: 'var(--color-brown-light)' }}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

/* ─── Intro Section ─── */
function IntroSection() {
  return (
    <section id="intro-section" className="px-6 py-20 max-w-lg mx-auto text-center">
      <FadeInSection>
        <div
          className="w-48 h-48 mx-auto mb-8 rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 8px 32px rgba(93, 64, 55, 0.1)',
            transform: 'rotate(-2deg)',
          }}
        >
          <img src={landerImg} alt="" className="w-full h-full object-cover" />
        </div>
      </FadeInSection>
      <FadeInSection delay={0.2}>
        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          No dramatic introductions needed.
        </p>
      </FadeInSection>
      <FadeInSection delay={0.3}>
        <p className="text-base leading-relaxed mt-4" style={{ color: 'var(--color-text-muted)' }}>
          If you've met her, you already know.
        </p>
      </FadeInSection>
      <FadeInSection delay={0.4}>
        <p className="text-base leading-relaxed mt-4" style={{ color: 'var(--color-text-muted)' }}>
          If you haven't, you'll understand by the end of this page.
        </p>
      </FadeInSection>
    </section>
  );
}

/* ─── Timeline Chapter ─── */
function TimelineChapter({ chapter, index }: {
  chapter: typeof TIMELINE_CHAPTERS[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const isEven = index % 2 === 0;

  const renderPhoto = () => {
    const imgSrc = imageMap[chapter.image];
    if (!imgSrc) return null;

    switch (chapter.style) {
      case 'polaroid':
        return (
          <div className="polaroid mx-auto max-w-[280px]" style={{ transform: `rotate(${isEven ? -2 : 2}deg)` }}>
            <div className="tape tape-top" />
            <img src={imgSrc} alt={chapter.title} className="w-full aspect-[3/4] object-cover" />
            <span className="polaroid-caption">{chapter.subtitle.split('.')[0]}</span>
          </div>
        );
      case 'scrapbook':
        return (
          <div className="scrapbook-paper p-4 mx-auto max-w-[280px]" style={{ transform: `rotate(${isEven ? 1 : -1}deg)` }}>
            <div className="photo-corners">
              <img src={imgSrc} alt={chapter.title} className="w-full aspect-[3/4] object-cover" />
            </div>
          </div>
        );
      case 'film':
        return (
          <div className="mx-auto max-w-[280px] relative">
            {/* Film strip border */}
            <div
              className="absolute -left-3 top-0 bottom-0 w-6 flex flex-col justify-between py-2"
              style={{ background: '#1a1a1a' }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-3 h-2 mx-auto rounded-sm" style={{ background: '#333' }} />
              ))}
            </div>
            <div
              className="absolute -right-3 top-0 bottom-0 w-6 flex flex-col justify-between py-2"
              style={{ background: '#1a1a1a' }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-3 h-2 mx-auto rounded-sm" style={{ background: '#333' }} />
              ))}
            </div>
            <img
              src={imgSrc}
              alt={chapter.title}
              className="w-full aspect-[3/4] object-cover relative z-10"
              style={{ filter: 'contrast(1.1) saturate(0.9)' }}
            />
          </div>
        );
      case 'cinematic':
        return (
          <div className="mx-auto max-w-[340px]">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 20px 60px rgba(93, 64, 55, 0.2), 0 8px 24px rgba(93, 64, 55, 0.1)',
              }}
            >
              <img src={imgSrc} alt={chapter.title} className="w-full aspect-[3/4] object-cover" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="py-12"
    >
      {/* Year label */}
      <div className="text-center mb-6">
        <span
          className="inline-block px-4 py-1 text-xs tracking-[0.2em] uppercase rounded-full"
          style={{
            background: 'var(--color-cream)',
            color: 'var(--color-accent-dark)',
            border: '1px solid rgba(212, 163, 115, 0.2)',
          }}
        >
          {chapter.year}
        </span>
      </div>

      {/* Chapter title */}
      <h2
        className="text-2xl md:text-3xl text-center mb-8"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
      >
        {chapter.title}
      </h2>

      {/* Photo */}
      <div className="mb-8">{renderPhoto()}</div>

      {/* Caption */}
      <div className="max-w-sm mx-auto text-center">
        <p
          className="text-lg md:text-xl italic leading-relaxed"
          style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--color-brown)' }}
        >
          "{chapter.caption}"
        </p>
        <p
          className="text-sm mt-4 leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {chapter.subtitle}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Transition Text ─── */
function TransitionSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-md mx-auto text-center">
        <FadeInSection>
          <p
            className="text-xl md:text-2xl leading-relaxed"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
          >
            Time has a strange way of moving.
          </p>
        </FadeInSection>
        <FadeInSection delay={0.3}>
          <p
            className="text-base mt-6 leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            One moment it's old photographs in an album.
          </p>
        </FadeInSection>
        <FadeInSection delay={0.5}>
          <p
            className="text-base mt-3 leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            The next, it's people making new memories together.
          </p>
        </FadeInSection>
        {/* Decorative divider */}
        <FadeInSection delay={0.7}>
          <div className="flex items-center justify-center gap-3 mt-10">
            <div className="w-12 h-px" style={{ background: 'var(--color-accent-light)' }} />
            <span style={{ color: 'var(--color-accent)' }}>✦</span>
            <div className="w-12 h-px" style={{ background: 'var(--color-accent-light)' }} />
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── Call to Action Section ─── */
function CTASection() {
  const navigate = useNavigate();
  const { isRegistered, setShowRegistration } = useGuest();

  const handleAction = (path: string) => {
    if (!isRegistered) {
      setShowRegistration(true);
      return;
    }
    navigate(path);
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-md mx-auto text-center">
        <FadeInSection>
          <h2
            className="text-3xl md:text-4xl mb-3"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
          >
            Ab Tumhari Baari.
          </h2>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--color-text-muted)' }}>
            Everyone here knows her differently.
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Friend. Family. Classmate. Partner in crime.
          </p>
          <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--color-text-muted)' }}>
            Leave a memory, a thought, or just one word.
          </p>
          <p className="text-sm leading-relaxed mt-2 italic" style={{ color: 'var(--color-brown-light)' }}>
            Let's see the version of her that exists in everyone else's story.
          </p>
        </FadeInSection>

        <FadeInSection delay={0.4}>
          <div className="mt-10 flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction('/one-word')}
              className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all cursor-pointer"
              style={{
                background: 'var(--color-brown)',
                color: 'var(--color-cream)',
                boxShadow: '0 4px 16px rgba(93, 64, 55, 0.15)',
              }}
            >
              💬 Describe her in one word
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction('/messages')}
              className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all cursor-pointer"
              style={{
                background: 'var(--color-cream)',
                color: 'var(--color-brown)',
                border: '1px solid rgba(93, 64, 55, 0.12)',
              }}
            >
              💌 Leave a secret message
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAction('/camera')}
              className="w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all cursor-pointer"
              style={{
                background: 'var(--color-cream)',
                color: 'var(--color-brown)',
                border: '1px solid rgba(93, 64, 55, 0.12)',
              }}
            >
              📸 Add to the album
            </motion.button>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="py-16 px-6 text-center relative overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3 + Math.random() * 4,
              height: 3 + Math.random() * 4,
              background: 'var(--color-accent-light)',
              opacity: 0.15,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${6 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      <FadeInSection>
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Made with ❤️ for the most beautiful chapter yet.
        </p>
      </FadeInSection>
    </footer>
  );
}

/* ─── Landing Page ─── */
export default function LandingPage() {
  return (
    <PageWrapper>
      <HeroSection />
      <IntroSection />

      {/* Timeline */}
      <section className="px-6">
        <div className="max-w-lg mx-auto">
          {/* Vertical line */}
          <div className="relative">
            <div
              className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
              style={{ background: 'linear-gradient(to bottom, transparent, var(--color-accent-light), transparent)' }}
            />
            {TIMELINE_CHAPTERS.map((chapter, i) => (
              <TimelineChapter key={chapter.id} chapter={chapter} index={i} />
            ))}
          </div>
        </div>
      </section>

      <TransitionSection />
      <CTASection />
      <Footer />
    </PageWrapper>
  );
}
