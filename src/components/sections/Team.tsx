'use client';

import { motion } from 'motion/react';
import { Twitter, Linkedin, Github } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Team member data type
 */
interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
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
 * Animation variants for container
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Animation variants for individual cards
 */
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.19, 1, 0.22, 1] as [number, number, number, number], // ease-out-expo
    },
  },
};

/**
 * Team member card component
 */
function TeamMemberCard({ member, index }: { member: TeamMember; index: number }) {
  const t = useTranslations('team');

  return (
    <motion.article
      variants={cardVariants}
      className="group relative"
      aria-label={`${member.name} - ${member.role}`}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl',
          'bg-white border border-[#e8eaed]',
          'transition-all duration-200',
          'group-hover:border-[#dadce0] group-hover:shadow-[0_2px_6px_rgba(60,64,67,0.15)]',
          'group-hover:-translate-y-1'
        )}
      >
        {/* Avatar Section */}
        <div className="relative h-48 bg-gradient-to-br from-[#e8f0fe] to-[#d2e3fc] overflow-hidden">
          {/* Avatar Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                'w-24 h-24 rounded-full',
                'bg-[#202124]',
                'flex items-center justify-center',
                'text-white text-3xl font-medium'
              )}
            >
              {member.name.charAt(0)}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/30" />
          <div className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-white/20" />
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-[#202124] mb-1">
            {member.name}
          </h3>
          <p className="text-sm font-medium text-[#1a73e8] mb-3">
            {member.role}
          </p>
          <p className="text-sm text-[#5f6368] leading-relaxed">
            {member.bio}
          </p>

          {/* Social Links */}
          <div
            className={cn(
              'flex items-center gap-3 mt-5 pt-5',
              'border-t border-[#e8eaed]',
              'opacity-0 translate-y-2',
              'transition-all duration-200',
              'group-hover:opacity-100 group-hover:translate-y-0'
            )}
          >
            {member.socials.twitter && (
              <a
                href={member.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'p-2 rounded-lg',
                  'text-[#9aa0a6]',
                  'hover:text-[#1a73e8]',
                  'hover:bg-[#e8f0fe]',
                  'transition-colors duration-200'
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
                  'p-2 rounded-lg',
                  'text-[#9aa0a6]',
                  'hover:text-[#1a73e8]',
                  'hover:bg-[#e8f0fe]',
                  'transition-colors duration-200'
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
                  'p-2 rounded-lg',
                  'text-[#9aa0a6]',
                  'hover:text-[#1a73e8]',
                  'hover:bg-[#e8f0fe]',
                  'transition-colors duration-200'
                )}
                aria-label={t('socialLabel', { name: member.name, platform: 'GitHub' })}
              >
                <Github className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * Team Section Component
 * Displays the team members in a responsive grid layout with stagger animations
 */
export function Team({ className }: TeamSectionProps) {
  const t = useTranslations('team');

  // Generate team members from translations
  const teamMembers: TeamMember[] = teamMemberKeys.map((key, index) => ({
    id: String(index + 1),
    name: t(`members.${key}.name`),
    role: t(`members.${key}.role`),
    bio: t(`members.${key}.bio`),
    socials: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  }));

  return (
    <section
      id="team"
      className={cn('section-padding bg-white', className)}
      aria-labelledby="team-heading"
    >
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-[#5f6368] bg-[#f1f3f4] rounded-full">
            {t('badge')}
          </span>
          <h2 id="team-heading" className="text-3xl md:text-4xl font-medium text-[#202124] mb-4">
            {t('sectionTitle')}
          </h2>
          <p className="text-lg text-[#5f6368] max-w-2xl mx-auto">
            {t('sectionSubtitle')}
            <br className="hidden sm:block" />
            {t('sectionSubtitleLine2')}
          </p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className={cn(
            'grid gap-6 md:gap-8',
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          )}
        >
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={member.id} member={member} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Team;
