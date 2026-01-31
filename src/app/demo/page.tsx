'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Star, Heart, Zap, Coffee, Send, Github, Twitter, FileSearch, ArrowRight } from 'lucide-react';
import {
  Card3DTilt,
  Card3DTiltContent,
  ParallaxSection,
  ScrollReveal,
  SharkLogoLoader,
  SharkFin,
  Confetti,
  SuccessConfetti,
  useConfetti,
  MagneticField,
  MagneticHover,
  MagneticButton,
  MagneticIcon,
  type ConfettiRef,
} from '@/components/interactions';
import { Button } from '@/components/ui';

export default function DemoPage() {
  const confettiRef = useRef<ConfettiRef>(null);
  const successConfettiRef = useRef<ConfettiRef>(null);
  const { fire: fireConfetti, Confetti: HookConfetti } = useConfetti({
    colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'],
  });

  return (
    <div className="min-h-screen bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-900)]">
      {/* Confetti containers */}
      <Confetti ref={confettiRef} />
      <SuccessConfetti ref={successConfettiRef} intensity="high" />
      <HookConfetti />

      {/* Hero with Parallax */}
      <ParallaxSection
        minHeight="100vh"
        background={
          <div className="w-full h-full bg-gradient-to-br from-[var(--color-primary-500)] via-[var(--color-primary-600)] to-[var(--color-accent-500)]" />
        }
        className="flex items-center justify-center"
      >
        <div className="relative z-10 text-center text-white px-4">
          <ScrollReveal direction="down" delay={0.2}>
            <h1 className="text-heading-1 mb-4">Micro Interactions Demo</h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.4}>
            <p className="text-body-1 opacity-80 max-w-2xl mx-auto">
              Interactive components with 3D tilt, parallax scrolling, shark loader,
              confetti celebrations, and magnetic hover effects.
            </p>
          </ScrollReveal>
        </div>
      </ParallaxSection>

      {/* AI Document Analyzer Banner */}
      <section className="py-12 px-4 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-accent-500)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <FileSearch className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI 문서 분석기</h2>
                <p className="text-white/80">
                  업무 문서를 업로드하고 자동화 기회를 발견하세요
                </p>
              </div>
            </div>
            <Link href="/demo/document-analyzer">
              <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                지금 사용해보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3D Tilt Cards Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-heading-2 text-center mb-12">3D Tilt Cards</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Design', icon: Star, color: 'from-pink-500 to-rose-500' },
              { title: 'Develop', icon: Zap, color: 'from-blue-500 to-cyan-500' },
              { title: 'Deploy', icon: Coffee, color: 'from-green-500 to-emerald-500' },
            ].map((item, index) => (
              <ScrollReveal key={item.title} delay={index * 0.1}>
                <Card3DTilt maxTilt={15} glare className="h-full">
                  <Card3DTiltContent className="h-64 flex flex-col items-center justify-center">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}
                    >
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-heading-3 mb-2">{item.title}</h3>
                    <p className="text-body-2 text-[var(--color-gray-500)] text-center">
                      Hover to see the 3D tilt effect with glare
                    </p>
                  </Card3DTiltContent>
                </Card3DTilt>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Shark Logo Loader Section */}
      <section className="py-20 px-4 bg-white dark:bg-[var(--color-gray-800)]">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-heading-2 text-center mb-12">Shark Logo Loader</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center justify-items-center">
            <ScrollReveal delay={0}>
              <div className="flex flex-col items-center gap-4">
                <SharkLogoLoader size="sm" showText={false} />
                <span className="text-caption text-[var(--color-gray-500)]">Small</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="flex flex-col items-center gap-4">
                <SharkLogoLoader size="md" text="Swimming..." />
                <span className="text-caption text-[var(--color-gray-500)]">Medium</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="flex flex-col items-center gap-4">
                <SharkLogoLoader size="lg" text="Loading content..." speed={0.8} />
                <span className="text-caption text-[var(--color-gray-500)]">Large</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="flex flex-col items-center gap-4">
                <SharkFin size="lg" />
                <span className="text-caption text-[var(--color-gray-500)]">
                  Shark Fin
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Confetti Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-heading-2 text-center mb-12">Confetti Celebration</h2>
          </ScrollReveal>

          <div className="flex flex-wrap justify-center gap-4">
            <ScrollReveal delay={0}>
              <Button
                onClick={() => confettiRef.current?.fire()}
                className="px-8 py-4"
              >
                Default Confetti
              </Button>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <Button
                variant="secondary"
                onClick={() => successConfettiRef.current?.fire()}
                className="px-8 py-4"
              >
                Success Celebration
              </Button>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <Button
                variant="outline"
                onClick={() =>
                  fireConfetti({
                    origin: [0.5, 0.9],
                    spread: 90,
                  })
                }
                className="px-8 py-4"
              >
                Custom Hook Confetti
              </Button>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <Button
                variant="ghost"
                onClick={() =>
                  confettiRef.current?.fire({
                    count: 200,
                    spread: 360,
                    origin: [0.5, 0.5],
                  })
                }
                className="px-8 py-4"
              >
                360 Spread
              </Button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Magnetic Hover Section */}
      <section className="py-20 px-4 bg-white dark:bg-[var(--color-gray-800)]">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-heading-2 text-center mb-12">Magnetic Hover Effect</h2>
          </ScrollReveal>

          <MagneticField className="flex flex-col items-center gap-12">
            {/* Magnetic Buttons */}
            <ScrollReveal>
              <div className="flex flex-wrap justify-center gap-6">
                <MagneticButton variant="default" size="lg">
                  Primary Action
                </MagneticButton>
                <MagneticButton variant="outline" size="lg">
                  Secondary Action
                </MagneticButton>
                <MagneticButton variant="ghost" size="lg">
                  Ghost Button
                </MagneticButton>
              </div>
            </ScrollReveal>

            {/* Magnetic Icons */}
            <ScrollReveal delay={0.2}>
              <div className="flex gap-8">
                <MagneticIcon iconSize={32} hoverScale={1.3}>
                  <Heart className="w-full h-full" />
                </MagneticIcon>
                <MagneticIcon iconSize={32} hoverScale={1.3}>
                  <Star className="w-full h-full" />
                </MagneticIcon>
                <MagneticIcon iconSize={32} hoverScale={1.3}>
                  <Send className="w-full h-full" />
                </MagneticIcon>
                <MagneticIcon iconSize={32} hoverScale={1.3}>
                  <Github className="w-full h-full" />
                </MagneticIcon>
                <MagneticIcon iconSize={32} hoverScale={1.3}>
                  <Twitter className="w-full h-full" />
                </MagneticIcon>
              </div>
            </ScrollReveal>

            {/* Standalone Magnetic Hover */}
            <ScrollReveal delay={0.3}>
              <MagneticHover strength={0.5} hoverScale={1.1}>
                <div className="px-12 py-8 rounded-2xl bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)] text-white">
                  <p className="text-heading-4 text-center">
                    Hover anywhere to feel the magnetic pull
                  </p>
                </div>
              </MagneticHover>
            </ScrollReveal>
          </MagneticField>
        </div>
      </section>

      {/* Scroll Reveal Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-heading-2 text-center mb-12">Scroll Reveal Animations</h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollReveal direction="up" distance={80}>
              <Card3DTilt maxTilt={8}>
                <Card3DTiltContent className="text-center py-12">
                  <p className="text-body-1 font-medium">From Bottom</p>
                </Card3DTiltContent>
              </Card3DTilt>
            </ScrollReveal>

            <ScrollReveal direction="down" distance={80}>
              <Card3DTilt maxTilt={8}>
                <Card3DTiltContent className="text-center py-12">
                  <p className="text-body-1 font-medium">From Top</p>
                </Card3DTiltContent>
              </Card3DTilt>
            </ScrollReveal>

            <ScrollReveal direction="left" distance={80}>
              <Card3DTilt maxTilt={8}>
                <Card3DTiltContent className="text-center py-12">
                  <p className="text-body-1 font-medium">From Right</p>
                </Card3DTiltContent>
              </Card3DTilt>
            </ScrollReveal>

            <ScrollReveal direction="right" distance={80}>
              <Card3DTilt maxTilt={8}>
                <Card3DTiltContent className="text-center py-12">
                  <p className="text-body-1 font-medium">From Left</p>
                </Card3DTiltContent>
              </Card3DTilt>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[var(--color-gray-100)] dark:bg-[var(--color-gray-900)]">
        <div className="max-w-6xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-body-2 text-[var(--color-gray-500)]">
              Built with Motion and React
            </p>
          </ScrollReveal>
        </div>
      </footer>
    </div>
  );
}
