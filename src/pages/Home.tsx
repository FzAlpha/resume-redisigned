import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { usePageAnimations } from '@/components/motion/usePageAnimations';
import { Hero } from '@/sections/Hero';
import { About } from '@/sections/About';
import { Disciplines } from '@/sections/Disciplines';
import { SelectedWork } from '@/sections/SelectedWork';
import { Stack } from '@/sections/Stack';
import { Contact } from '@/sections/Contact';

export function Home() {
  const ref = usePageAnimations<HTMLDivElement>();
  return (
    <div ref={ref}>
      <Nav />
      <main>
        <Hero />
        <About />
        <Disciplines />
        <SelectedWork />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
