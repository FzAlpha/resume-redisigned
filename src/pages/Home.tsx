import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { usePageAnimations } from '@/components/motion/usePageAnimations';
import { Hero } from '@/sections/Hero';
import { About } from '@/sections/About';
import { Disciplines } from '@/sections/Disciplines';
import { SelectedWork } from '@/sections/SelectedWork';
import { Stack } from '@/sections/Stack';
import { Contact } from '@/sections/Contact';
import { Activity } from '@/sections/Activity';
import { Manifesto } from '@/sections/Manifesto';
import { Prologue } from '@/sections/Prologue';
import { Interlude } from '@/sections/Interlude';
import { usePageTitle } from '@/lib/usePageTitle';

export function Home() {
  const ref = usePageAnimations<HTMLDivElement>();
  usePageTitle();
  return (
    <div ref={ref} data-page="/">
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Prologue />
        <Interlude direction="forward" label="Scroll to trace the signal" />
        <About />
        <Manifesto />
        <Disciplines />
        <Interlude direction="reverse" label="Analog in, digital out" />
        <SelectedWork />
        <Stack />
        <Activity />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
