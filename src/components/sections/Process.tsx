'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'motion/react';

// Use same unsplash images
const processStepData = [
  {
    number: 1,
    key: 'discovery',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop'
  },
  {
    number: 2,
    key: 'planning',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop'
  },
  {
    number: 3,
    key: 'execution',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800&auto=format&fit=crop'
  },
  {
    number: 4,
    key: 'delivery',
    image: 'https://images.unsplash.com/photo-1620912189868-30778c187807?q=80&w=800&auto=format&fit=crop'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.33, 1, 0.68, 1] as [number, number, number, number] 
    } 
  }
};

export function Process() {
  const t = useTranslations('process');

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="container-custom relative z-10">
        
        {/* Section Header - Artience Style (Matching Services) */}
        <motion.div
           initial={{ opacity: 0, y: 15 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.3 }}
           className="mb-12 md:mb-16"
        >
           <motion.span
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.2, delay: 0.1 }}
             className="inline-block text-[13px] font-semibold text-[#1F2937] uppercase tracking-wider mb-2"
           >
             {t('badge')}
           </motion.span>
           
           <h2 className="text-[22px] sm:text-2xl md:text-[28px] font-semibold text-[#1F2937] mb-3 leading-tight tracking-tight">
             {t('sectionTitle')}
           </h2>
           
           <p className="text-[15px] text-[#4B5563] max-w-2xl leading-relaxed">
             {t('sectionSubtitle')}
           </p>
        </motion.div>

        {/* DIO Grid Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {processStepData.map((step) => {
            return (
              <motion.div
                key={step.key}
                variants={itemVariants}
                className="flex flex-col gap-6 group"
              >
                {/* Image Card */}
                <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-gray-100 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                  <Image
                    src={step.image}
                    alt={t(`steps.${step.key}.title`)}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />
                  <div className="absolute top-5 left-5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-xs shadow-sm text-gray-900">
                      {step.number}
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex flex-col gap-3 pr-2">
                  {/* Step Title: Adjusted to 20px (Title 1) */}
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-[1.48] group-hover:text-indigo-600 transition-colors">
                    {t(`steps.${step.key}.title`)}
                  </h3>
                  
                  {/* Body: Artience Body 2 (15px) or Body 1 (16px) */}
                  {/* Removed line-clamp to allow full visibility of enriched text */}
                  <p className="text-[15px] text-gray-600 leading-[1.65]">
                     {t(`steps.${step.key}.description`)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}

export default Process;
