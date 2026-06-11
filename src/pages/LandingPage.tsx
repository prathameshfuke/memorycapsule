import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Countdown from '../components/shared/Countdown';

// Import local photos
import babyImg from '../assets/baby.jpg';
import angydonImg from '../assets/angydon.jpg';
import kidImg from '../assets/kid.jpg';
import landerImg from '../assets/lander.jpg';
import presentImg from '../assets/present.jpg';
import latestImg from '../assets/latest.jpg';

/* ─── Scroll Fade-In Wrapper ─── */
function FadeInSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.25, 1, 0.5, 1] }}
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
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  const scrollToJourney = () => {
    const el = document.getElementById('beginning-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.section
      ref={targetRef}
      style={{ opacity, scale }}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden py-16"
    >
      {/* Decorative corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[var(--color-accent-light)] opacity-40 pointer-events-none" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[var(--color-accent-light)] opacity-40 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[var(--color-accent-light)] opacity-40 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[var(--color-accent-light)] opacity-40 pointer-events-none" />

      {/* Elegant Hero Image Frame */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-10 group"
      >
        <div
          className="w-64 h-80 md:w-80 md:h-[400px] overflow-hidden p-3 bg-white"
          style={{
            boxShadow: '0 20px 50px rgba(93, 64, 55, 0.18), 0 5px 15px rgba(93, 64, 55, 0.08)',
            transform: 'rotate(-1.5deg)',
          }}
        >
          <img
            src={latestImg}
            alt="Latest Portrait"
            className="w-full h-full object-cover filter brightness-[1.02] contrast-[0.98]"
          />
        </div>
        {/* Soft shadow accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brown)]/10 to-transparent pointer-events-none" />
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="text-center max-w-lg space-y-4"
      >
        <p className="text-xs uppercase tracking-[0.3em] font-medium" style={{ color: 'var(--color-accent-dark)' }}>
          🎂 5 July 2026
        </p>
        <h1
          className="text-4xl md:text-5xl leading-tight font-light"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
        >
          A small celebration
        </h1>
        <p
          className="text-lg md:text-xl font-light italic leading-relaxed"
          style={{ fontFamily: 'var(--font-handwritten)', color: 'var(--color-brown-light)' }}
        >
          for someone who means a lot to all of us.
        </p>
      </motion.div>

      {/* Countdown overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-8 scale-90"
      >
        <Countdown />
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        onClick={scrollToJourney}
        className="mt-10 px-10 py-3.5 rounded-full text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-500 cursor-pointer"
        style={{
          background: 'var(--color-brown)',
          color: 'var(--color-cream)',
          boxShadow: '0 8px 30px rgba(93, 64, 55, 0.25)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        Begin
      </motion.button>
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
}: {
  id: string;
  image: string;
  title: string;
  caption: string;
  style?: 'polaroid' | 'scrapbook' | 'film' | 'cinematic';
  rotation?: number;
}) {
  const renderImage = () => {
    switch (style) {
      case 'polaroid':
        return (
          <div
            className="bg-white p-4 pb-8"
            style={{
              boxShadow: '0 15px 35px rgba(93, 64, 55, 0.12), 0 3px 10px rgba(93, 64, 55, 0.05)',
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <img src={image} alt={title} className="w-full aspect-square object-cover mb-4" />
            <div className="h-6 w-full bg-[rgba(93,64,55,0.02)] rounded" />
          </div>
        );
      case 'scrapbook':
        return (
          <div
            className="p-3 bg-[var(--color-cream)] rounded-sm relative"
            style={{
              boxShadow: '0 10px 25px rgba(93, 64, 55, 0.1)',
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {/* Scrapbook photo tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[rgba(212,163,115,0.25)] backdrop-blur-[1px] rotate-[-2deg]" style={{ border: '1px dashed rgba(93, 64, 55, 0.1)' }} />
            <img src={image} alt={title} className="w-full aspect-[4/3] object-cover rounded-sm" />
          </div>
        );
      case 'film':
        return (
          <div className="relative py-4 bg-[#121212] px-6 rounded-md shadow-2xl">
            {/* Film strip edge markings */}
            <div className="absolute top-0 bottom-0 left-2 w-2 flex flex-col justify-between py-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-1.5 h-3 bg-[var(--color-bg)] rounded-sm" />
              ))}
            </div>
            <div className="absolute top-0 bottom-0 right-2 w-2 flex flex-col justify-between py-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="w-1.5 h-3 bg-[var(--color-bg)] rounded-sm" />
              ))}
            </div>
            <img src={image} alt={title} className="w-full aspect-[3/2] object-cover grayscale brightness-95" />
          </div>
        );
      case 'cinematic':
        return (
          <div className="rounded-2xl overflow-hidden shadow-2xl relative group">
            <img src={image} alt={title} className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brown)]/40 to-transparent" />
          </div>
        );
      default:
        return <img src={image} alt={title} className="w-full object-cover" />;
    }
  };

  return (
    <section id={id} className="min-h-[80vh] flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-lg space-y-8">
        <FadeInSection>
          <div className="relative z-10">{renderImage()}</div>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <div className="text-center space-y-4">
            <h2
              className="text-2xl md:text-3xl font-medium"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
            >
              {title}
            </h2>
            <p
              className="text-base md:text-lg leading-relaxed font-light whitespace-pre-line"
              style={{ color: 'var(--color-text-muted)' }}
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

  return (
    <section className="min-h-screen flex flex-col items-center justify-center py-24 px-6 relative bg-[rgba(93,64,55,0.02)]">
      {/* Decorative vertical separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-[var(--color-accent-light)]" />

      <div className="w-full max-w-xl text-center space-y-12">
        <FadeInSection>
          <div
            className="w-full aspect-[4/5] md:aspect-square max-w-sm mx-auto p-4 bg-white shadow-2xl"
            style={{ transform: 'rotate(1deg)' }}
          >
            <img src={latestImg} alt="Latest Portrait" className="w-full h-full object-cover" />
          </div>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <div className="space-y-4">
            <p
              className="text-xl md:text-2xl leading-loose font-light"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
            >
              And now,
            </p>
            <p
              className="text-2xl md:text-3xl leading-loose font-medium"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brown)' }}
            >
              another year.
              <br />
              Another memory.
              <br />
              Another chapter.
            </p>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.4} className="pt-6">
          <div className="flex flex-col gap-4 max-w-xs mx-auto">
            {/* Play Games Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/games')}
              className="py-4 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] cursor-pointer"
              style={{
                background: 'var(--color-brown)',
                color: 'var(--color-cream)',
                boxShadow: '0 4px 15px rgba(93, 64, 55, 0.15)',
              }}
            >
              🎮 Play Party Games
            </motion.button>

            {/* Secret Gate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const pass = prompt('Enter Guest Access Code:');
                if (pass === 'oneword') {
                  localStorage.setItem('guest_authorized', 'true');
                  navigate('/guest');
                } else if (pass) {
                  alert('Incorrect code! Hint: It is "oneword".');
                }
              }}
              className="py-4 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] cursor-pointer"
              style={{
                background: 'var(--color-cream)',
                color: 'var(--color-brown)',
                border: '1px solid rgba(93, 64, 55, 0.12)',
              }}
            >
              ✨ Enter Guest Area
            </motion.button>
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
      <div className="film-grain pointer-events-none fixed inset-0 z-40 opacity-[0.03]" />

      <HeroSection />

      {/* Chapter 1: The Beginning */}
      <StorySection
        id="beginning-section"
        image={babyImg}
        title="The Beginning"
        caption={`Every family album has a few photos\nthat somehow survive every cleanup.\n\nThis is one of them.`}
        style="polaroid"
        rotation={-2}
      />

      {/* Chapter 2: Strong Opinions */}
      <StorySection
        id="opinions-section"
        image={angydonImg}
        title="Strong Opinions Since Day One"
        caption={`Some things change with time.\n\nThat look isn't one of them.`}
        style="scrapbook"
        rotation={3}
      />

      {/* Chapter 3: Center Stage */}
      <StorySection
        id="stage-section"
        image={kidImg}
        title="Center Stage"
        caption={`School functions.\nDance performances.\nAnnual days.\n\nThe camera somehow always found her.`}
        style="film"
      />

      {/* Chapter 4: The Version We Know */}
      <StorySection
        id="version-section"
        image={landerImg}
        title="The Version We Know"
        caption={`Somewhere between\nthe old photo albums\nand today,\n\nshe became everyone's favourite person.`}
        style="scrapbook"
        rotation={-1.5}
      />

      {/* Chapter 5: Aaj Kal */}
      <StorySection
        id="today-section"
        image={presentImg}
        title="Aaj Kal"
        caption={`A little older.\n\nA little wiser.\n\nStill exactly herself.`}
        style="cinematic"
      />

      <FinalRevealSection />
    </PageWrapper>
  );
}
