import SplitText from '../components/interactive/SplitText.jsx'
import Reveal from '../components/interactive/Reveal.jsx'

const principles = [
  { num: '01', title: 'Body-positive & inclusive', text: 'Quill uses only positive, supportive language. No body shaming, no unrealistic ideals — just genuine care.' },
  { num: '02', title: 'Privacy-first', text: 'No accounts, no tracking, no data collection. Everything stays on your device.' },
  { num: '03', title: 'Evidence-informed', text: 'Content is built on general wellness knowledge and beginner-safe guidance — not trends or harmful myths.' },
  { num: '04', title: 'Medically responsible', text: 'We never diagnose, never promise cures, and always encourage speaking with a professional for real concerns.' },
]

export default function About() {
  return (
    <div className="bg-cream">
      {/* HERO */}
      <section style={{ viewTransitionName: 'hero-about' }} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
        <div className="border-b border-ink/15 pb-3 mb-10 flex items-center justify-between">
          <span className="editorial-label">Chapter · About</span>
          <span className="editorial-label">A wellness prototype</span>
        </div>
        <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl text-ink leading-[0.9] tracking-tight">
          <SplitText byChar stagger={28}>About</SplitText>
          <br />
          <span className="display-italic text-clay"><SplitText byChar stagger={28} startDelay={500}>Quill.</SplitText></span>
        </h1>
        <Reveal delay={1000} className="mt-8 max-w-lg">
          <p className="display-italic text-2xl text-ink-soft leading-relaxed">
            "A simple, beautiful, trustworthy wellness companion — built for the people who deserve better self-care tools."
          </p>
        </Reveal>
      </section>

      {/* What Quill is */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-6 border-t border-ink/15 pt-10">
            <span className="editorial-label">What it is</span>
            <div>
              <p className="font-display text-3xl text-ink leading-tight mb-4">
                Quill is an educational self-care companion.
              </p>
              <p className="text-ink-soft leading-relaxed mb-4">
                A digital guide to help young women explore fitness routines, skincare basics, body wellness, and everyday self-care practices in a calm, supportive, and non-judgemental space.
              </p>
              <p className="text-ink-soft leading-relaxed">
                It was designed with care to be beginner-friendly, free from toxic beauty standards, and grounded in general wellness knowledge. Every piece of content encourages you to listen to your body, be kind to yourself, and seek professional help when you need it.
              </p>
            </div>
          </div>
        </Reveal>

        {/* What it is NOT */}
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-6 border-t border-ink/15 mt-10 pt-10">
            <span className="editorial-label">What it isn&apos;t</span>
            <div>
              <p className="font-display text-3xl text-ink leading-tight mb-4">
                Not a doctor, not a diagnosis.
              </p>
              <ul className="space-y-3">
                {[
                  'A medical diagnosis tool — Quill cannot diagnose any condition',
                  'A replacement for professional medical, dermatological, or mental health advice',
                  'A guarantee of results — wellness is personal and individual',
                  'A fitness or diet prescription platform — there are no weight-loss goals here',
                ].map((item, i) => (
                  <li key={item} className="flex items-baseline gap-3 text-ink-soft">
                    <span className="num-display text-sm text-clay w-6">{String(i + 1).padStart(2, '0')}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Principles */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Reveal>
          <div className="border-t border-ink/15 pt-10 mb-10">
            <span className="editorial-label">Our principles</span>
            <h2 className="font-display text-5xl text-ink mt-2 leading-none">
              Four things <span className="display-italic text-clay">we keep.</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-0 border-t border-ink/15">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="py-8 border-b border-ink/10">
                <span className="editorial-num text-2xl text-clay">{p.num}</span>
                <p className="font-display text-2xl text-ink mt-2 leading-tight">{p.title}</p>
                <p className="text-sm text-ink-soft mt-3 leading-relaxed">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Reveal>
          <div className="bg-ink text-cream p-8 sm:p-12">
            <span className="editorial-label text-gold">Important disclaimer</span>
            <p className="font-display text-3xl mt-3 leading-tight mb-6">
              Please <span className="display-italic text-gold">read this.</span>
            </p>
            <div className="space-y-4 text-cream/80 leading-relaxed text-sm">
              <p>
                This app provides <strong className="text-cream">general wellness and self-care information</strong> and does not replace medical advice. The content within Quill is intended for general informational and educational purposes only.
              </p>
              <p>
                For severe symptoms, ongoing concerns, sudden changes in your health, or any situation that worries you — please talk to a <strong className="text-cream">doctor, dermatologist, parent, guardian, or trusted adult</strong>.
              </p>
              <p>
                If you are ever in distress or need urgent support, please reach out for help. You are not alone, and you deserve proper care.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="text-center mt-8 editorial-label text-ink-softer">
            Quill v0.2 — Editorial prototype · Built with React & Tailwind CSS · Set in Fraunces & Instrument Serif
          </p>
        </Reveal>
      </section>
    </div>
  )
}
