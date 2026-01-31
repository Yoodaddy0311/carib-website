'use client';

import { motion } from 'motion/react';
import { Twitter, Linkedin, Github, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import Image from 'next/image';

/**
 * Team member data type
 */
interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  featured?: boolean;
  socials: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

/**
 * Team section props
 */
interface TeamSectionProps {
  className?: string;
}

/**
 * Team member keys for translation
 */
const teamMemberKeys = ['ceo', 'cto', 'engineer', 'designer'] as const;

/**
 * Avatar images from Unsplash
 */
const avatarImages: Record<string, string> = {
  ceo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
  cto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
  designer: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
  engineer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
};

/**
 * Animation variants for container
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

/**
 * Animation variants for individual cards
 */
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.19, 1, 0.22, 1] as [number, number, number, number],
    },
  },
};

/**
 * Featured team member card (CEO - Large card)
 */
function FeaturedMemberCard({ member }: { member: TeamMember }) {
  const t = useTranslations('team');

  return (
    <motion.article
      variants={cardVariants}
      className="group relative h-full"
      aria-label={`${member.name} - ${member.role}`}
    >
      <div
        className={cn(
          'relative h-full overflow-hidden rounded-2xl',
          'bg-[#fafafa] border border-[#e8eaed]',
          'transition-all duration-500',
          'group-hover:border-[#dadce0] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
        )}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={member.avatar}
            alt={member.name}
            fill
            className={cn(
              'object-cover',
              'transition-transform duration-700 ease-out',
              'group-hover:scale-105'
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase text-white/90 bg-[#1a73e8] rounded-full">
              Featured
            </span>
            <h3 className="text-3xl md:text-4xl font-medium text-white mb-2 tracking-tight">
              {member.name}
            </h3>
            <p className="text-lg font-medium text-[#8ab4f8] mb-4">
              {member.role}
            </p>
            <p className="text-sm text-white/80 leading-relaxed max-w-md">
              {member.bio}
            </p>

            {/* Social Links */}
            <div
              className={cn(
                'flex items-center gap-3 mt-6 pt-6',
                'border-t border-white/20',
                'opacity-0 translate-y-4',
                'transition-all duration-300',
                'group-hover:opacity-100 group-hover:translate-y-0'
              )}
            >
              {member.socials.twitter && (
                <a
                  href={member.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'p-2.5 rounded-full',
                    'text-white/70 bg-white/10',
                    'hover:text-white hover:bg-white/20',
                    'transition-all duration-200'
                  )}
                  aria-label={t('socialLabel', { name: member.name, platform: 'Twitter' })}
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {member.socials.linkedin && (
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'p-2.5 rounded-full',
                    'text-white/70 bg-white/10',
                    'hover:text-white hover:bg-white/20',
                    'transition-all duration-200'
                  )}
                  aria-label={t('socialLabel', { name: member.name, platform: 'LinkedIn' })}
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {member.socials.github && (
                <a
                  href={member.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'p-2.5 rounded-full',
                    'text-white/70 bg-white/10',
                    'hover:text-white hover:bg-white/20',
                    'transition-all duration-200'
                  )}
                  aria-label={t('socialLabel', { name: member.name, platform: 'GitHub' })}
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Regular team member card (Small cards)
 */
function TeamMemberCard({ member }: { member: TeamMember }) {
  const t = useTranslations('team');

  return (
    <motion.article
      variants={cardVariants}
      className="group relative"
      aria-label={`${member.name} - ${member.role}`}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl',
          'bg-white border border-[#e8eaed]',
          'transition-all duration-300',
          'group-hover:border-[#dadce0] group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]',
          'group-hover:-translate-y-1'
        )}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={member.avatar}
            alt={member.name}
            fill
            className={cn(
              'object-cover',
              'transition-transform duration-500 ease-out',
              'group-hover:scale-110'
            )}
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {/* Hover Overlay - Slides up */}
          <div
            className={cn(
              'absolute inset-0',
              'bg-gradient-to-t from-[#202124]/95 via-[#202124]/70 to-transparent',
              'flex flex-col justify-end p-5',
              'translate-y-full opacity-0',
              'transition-all duration-400 ease-out',
              'group-hover:translate-y-0 group-hover:opacity-100'
            )}
          >
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              {member.bio}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {member.socials.twitter && (
                <a
                  href={member.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'p-2 rounded-lg',
                    'text-white/60',
                    'hover:text-white hover:bg-white/10',
                    'transition-colors duration-200'
                  )}
                  aria-label={t('socialLabel', { name: member.name, platform: 'Twitter' })}
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {member.socials.linkedin && (
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'p-2 rounded-lg',
                    'text-white/60',
                    'hover:text-white hover:bg-white/10',
                    'transition-colors duration-200'
                  )}
                  aria-label={t('socialLabel', { name: member.name, platform: 'LinkedIn' })}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {member.socials.github && (
                <a
                  href={member.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'p-2 rounded-lg',
                    'text-white/60',
                    'hover:text-white hover:bg-white/10',
                    'transition-colors duration-200'
                  )}
                  aria-label={t('socialLabel', { name: member.name, platform: 'GitHub' })}
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="text-base font-medium text-[#202124] mb-0.5 group-hover:text-[#1a73e8] transition-colors">
            {member.name}
          </h3>
          <p className="text-sm font-medium text-[#1a73e8]">
            {member.role}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Team Section Component
 * Brandazine editorial style with asymmetric layout
 * Featured member on left (2/3), other members on right (1/3)
 */
export function Team({ className }: TeamSectionProps) {
  const t = useTranslations('team');

  // Generate team members from translations with avatars
  const teamMembers: TeamMember[] = teamMemberKeys.map((key, index) => ({
    id: String(index + 1),
    name: t(`members.${key}.name`),
    role: t(`members.${key}.role`),
    bio: t(`members.${key}.bio`),
    avatar: avatarImages[key],
    featured: key === 'ceo',
    socials: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  }));

  const featuredMember = teamMembers.find(m => m.featured);
  const otherMembers = teamMembers.filter(m => !m.featured);

  return (
    <section
      id="team"
      className={cn('section-padding bg-white', className)}
      aria-labelledby="team-heading"
    >
      <div className="container-custom">
        {/* Section Header - Editorial Style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          className="mb-16 md:mb-20"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-medium tracking-widest uppercase text-[#5f6368] bg-[#f8f9fa] rounded-full border border-[#e8eaed]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8]" />
                {t('badge')}
              </span>
              <h2
                id="team-heading"
                className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#202124] tracking-tight leading-[1.1]"
              >
                {t('sectionTitle')}
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-lg text-[#5f6368] leading-relaxed">
                {t('sectionSubtitle')}
                {' '}
                {t('sectionSubtitleLine2')}
              </p>
            </div>
          </div>

          {/* Decorative Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="h-px bg-gradient-to-r from-[#e8eaed] via-[#dadce0] to-transparent mt-10 origin-left"
          />
        </motion.div>

        {/* Asymmetric Layout: Featured (2/3) + Grid (1/3) */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {/* Featured Member - Takes 2 columns on large screens */}
          {featuredMember && (
            <div className="lg:col-span-2">
              <FeaturedMemberCard member={featuredMember} />
            </div>
          )}

          {/* Other Members - 1 column grid on the right */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6 content-start">
            {otherMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA - Editorial Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 md:mt-20 pt-10 border-t border-[#e8eaed]"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[#5f6368]">
              Interested in joining our team?
            </p>
            <a
              href="#contact"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3',
                'text-sm font-medium text-[#1a73e8]',
                'border border-[#1a73e8] rounded-full',
                'hover:bg-[#1a73e8] hover:text-white',
                'transition-all duration-300',
                'group/link'
              )}
            >
              Get in touch
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Team;
