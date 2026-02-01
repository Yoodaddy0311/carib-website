'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';

// --- Data & Content ---
const jobs = [
  {
    id: 'engineer',
    title: 'AX Solution Engineer',
    type: '개발 직군',
    slogan: '"마케터의 상상을 작동하는 현실로 구현합니다."',
    desc: '단순히 지시받은 기능을 개발하는 것이 아닙니다. 마케팅 데이터와 생성형 AI(Generative AI)를 결합하여, 글로벌 캠페인의 효율을 극대화하는 자동화 솔루션과 프로덕트를 주도적으로 설계하고 개발합니다.',
    tasks: [
      {
        title: 'AI Marketing Solution 개발',
        items: [
          'LLM(OpenAI, Claude 등) 기반의 광고 카피라이팅 및 성과 분석 에이전트 개발',
          '이미지/영상 생성 AI 파이프라인(Stable Diffusion, ComfyUI 등) 구축 및 자동화',
        ]
      },
      {
        title: 'Ad-Tech Integration',
        items: [
          '글로벌 광고 매체(Google, Meta, TikTok) API 연동 및 데이터 파이프라인 구축',
        ]
      },
      {
        title: 'Rapid Prototyping',
        items: [
          '클라이언트의 니즈를 검증하기 위한 MVP(Minimum Viable Product)를 빠르게 제작하고 배포',
        ]
      }
    ],
    qualifications: [
      '(신입/경력) Python 기반의 웹 프레임워크(FastAPI, Flask, Django 등) 개발 역량',
      '(신입) 생성형 AI API를 활용하여 실제 서비스를 만들어본 경험',
      '(경력) 복잡한 비즈니스 로직을 안정적인 아키텍처로 설계하고 운영해 본 경험 (3년 이상)',
      '(공통) "이 기술이 비즈니스에 어떤 가치를 주는가?"를 항상 고민하는 엔지니어링 마인드 (FDE Attitude)',
    ],
    preferred: [
      '대용량 트래픽 처리 경험 혹은 클라우드(AWS, GCP) 환경 배포 경험',
      'LangChain, LlamaIndex 등 LLM 프레임워크 활용 능숙자',
      '마케팅/광고 도메인에 대한 이해도가 있거나 관련 프로젝트 경험자',
    ]
  },
  {
    id: 'planner',
    title: 'AX Service Planner',
    type: '기획/PM 직군',
    slogan: '"모호한 문제를 명확한 논리로 정의하고, 해결될 때까지 집요하게 파고듭니다."',
    desc: '화려한 기술 용어를 몰라도 괜찮습니다. 현장의 문제를 날카롭게 정의하고, 개발팀이 헤매지 않도록 논리적인 지도를 그려주실 분을 찾습니다. 코드를 짜는 능력보다, 문제가 해결될 때까지 물고 늘어지는 집요함(Tenacity)을 봅니다.',
    tasks: [
      {
        title: 'Pain Point Discovery (문제 발굴)',
        items: [
          '글로벌 클라이언트와 사내 마케팅 팀의 업무 프로세스를 현미경처럼 들여다보고 진짜 문제를 찾아냅니다.',
          '표면적인 요구사항 뒤에 숨겨진 본질적인 비즈니스 니즈를 정의합니다.',
        ]
      },
      {
        title: 'Logical Spec Design (상세 기획)',
        items: [
          '문제를 해결하기 위한 서비스 정책, User Flow, 상세 기능 명세서(PRD)를 빈틈없이 작성합니다.',
          '개발자가 "이 기능은 왜 필요한가요?"라고 물었을 때, 논리적으로 완벽하게 설득할 수 있어야 합니다.',
        ]
      },
      {
        title: 'Product Quality Management',
        items: [
          '기획 의도대로 구현되었는지 집요하게 테스트하고, 엣지 케이스(Edge Case)를 찾아내어 완성도를 높입니다.',
        ]
      }
    ],
    qualifications: [
      '집요한 문제 해결력: "원래 안 돼요"라는 말에 타협하지 않고, 대안을 찾아낼 때까지 포기하지 않는 끈기',
      '논리적 구조화 능력: 복잡한 상황을 정리하여 타인이 이해하기 쉬운 문서(기획안)로 만드는 능력',
      '커뮤니케이션 스킬: 개발자, 디자이너, 마케터 등 다양한 직군 사이에서 오해 없이 의견을 조율하는 능력',
      '(코딩 능력은 필수 사항이 아닙니다. 기술에 대한 호기심과 학습 의지만 있으면 충분합니다.)',
    ],
    preferred: [
      '에이전시, SI 등 클라이언트 비즈니스 환경에서의 기획 업무 경험',
      '아무도 시키지 않았지만, 불편함을 개선하기 위해 주도적으로 프로젝트를 리딩해 본 경험',
      'Jira, Confluence, Figma 등 협업 툴 사용 능숙자',
    ]
  }
];

const culture = [
  {
    title: 'Growth Portfolio',
    ratio: '60 : 20 : 20',
    desc: '당신의 시간은 회사의 자산인 동시에, 당신의 커리어를 위한 투자 자산입니다.',
    items: [
      { label: 'Core Impact (60%)', text: '팀의 목표와 직결된 메인 프로젝트에 몰입합니다. 클라이언트의 문제를 해결하고 실질적인 성과를 냅니다.' },
      { label: 'Scalable Link (20%)', text: '메인 프로젝트에서 파생된 심화 업무입니다. 일회성 해결에 그치지 않고, 이를 모듈화하거나 자산화하는 방법을 연구합니다.' },
      { label: 'Future Betting (20%)', text: '당장의 업무와 무관해도 좋습니다. 최신 AI 논문 구현, 새로운 툴 학습 등 당신의 호기심을 채우는 데 온전히 사용합니다.' },
    ]
  },
  {
    title: 'Autonomy & Responsibility',
    ratio: '20 : 20 : 60',
    desc: '마이크로 매니지먼트는 없습니다. 보고와 커뮤니케이션은 "자주" 하는 것보다 "확실하게" 하는 것을 선호합니다.',
    items: [
      { label: 'Initial Alignment (20%)', text: '"왜(Why)"와 "무엇을(What)"에 대해 치열하게 합의합니다. 이후의 "어떻게(How)"는 실무자의 권한입니다.' },
      { label: 'Mid-Course Check (20%)', text: '불필요한 보고서 대신, 프로토타입 등을 통해 방향이 맞는지 가볍게 확인하고 궤도를 수정합니다.' },
      { label: 'Final Impact (60%)', text: '우리의 에너지는 마지막 결과물의 퀄리티에 집중됩니다. 최종 산출물은 고객을 설득할 수 있는 완벽한 수준이어야 하며, 이에 대한 책임은 실무자가 집니다.' },
    ]
  },
  {
    title: 'Respect & Logic',
    ratio: 'Field-First',
    desc: '모니터 앞의 데이터보다 현장의 목소리가 정답에 가깝습니다.',
    items: [
      { label: 'Field-First', text: '책상 위 기획보다 작동하는 코드를, 완벽한 문서보다 빠른 실행을 우대합니다.' },
      { label: 'Intellectual Honesty', text: '직급의 권위보다 논리의 타당성을 신뢰합니다. 누구의 의견이든 기술적 합리성과 비즈니스 가치가 입증된다면, 그것이 곧 우리 팀의 전략이 됩니다.' },
    ]
  }
];

// --- Components ---

function CultureAccordionItem({ item, defaultOpen = false }: { item: typeof culture[0], defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="py-8">
      {/* Accordion Header - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-6">
          <span className="text-xs font-mono font-bold text-gray-500 bg-gray-800 px-3 py-1.5 rounded">
            {item.ratio}
          </span>
          <h4 className="text-xl md:text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">
            {item.title}
          </h4>
        </div>
        <ChevronDown 
          className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {/* Accordion Content - Expandable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-8">
              <p className="text-[15px] text-gray-400 leading-relaxed mb-8 max-w-3xl">
                {item.desc}
              </p>
              
              {/* Sub Items Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {item.items.map((sub, i) => (
                  <div key={i} className="border-l-2 border-gray-700 pl-5">
                    <strong className="block text-sm font-bold text-white mb-2">
                      {sub.label}
                    </strong>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      {sub.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const RoleChip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-900 text-xs font-semibold uppercase tracking-wider">
    {children}
  </span>
);

function JobCard({ job }: { job: typeof jobs[0] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="p-8 md:p-12 lg:p-16">
        
        {/* Header: Badge + Title */}
        <div className="flex flex-col gap-4 mb-8 pb-8 border-b border-gray-100">
          <RoleChip>{job.type}</RoleChip>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
            {job.title}
          </h3>
        </div>

        {/* Slogan - Clean and Bold */}
        <p className="text-lg md:text-xl font-medium text-gray-900 mb-6 leading-relaxed">
          {job.slogan}
        </p>

        {/* Description */}
        <p className="text-[15px] md:text-base text-gray-600 leading-[1.8] mb-16">
          {job.desc}
        </p>

        {/* Content Sections - Clean Single Column */}
        <div className="space-y-12">
          
          {/* 주요 업무 */}
          <div>
            <h4 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-6 pb-3 border-b border-gray-900">
              주요 업무
            </h4>
            <div className="space-y-8">
              {job.tasks.map((task, idx) => (
                <div key={idx}>
                  <h5 className="font-semibold text-gray-900 mb-3">{task.title}</h5>
                  <ul className="space-y-2">
                    {task.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-[15px] text-gray-600 leading-[1.7]">
                        <span className="text-gray-400 select-none">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 자격 요건 */}
          <div>
            <h4 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-6 pb-3 border-b border-gray-900">
              자격 요건
            </h4>
            <ul className="space-y-3">
              {job.qualifications.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[15px] text-gray-600 leading-[1.7]">
                  <span className="text-gray-400 select-none">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 우대 사항 */}
          <div>
            <h4 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-6 pb-3 border-b border-gray-900">
              우대 사항
            </h4>
            <ul className="space-y-3">
              {job.preferred.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[15px] text-gray-600 leading-[1.7]">
                  <span className="text-gray-400 select-none">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Apply Button */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-end">
          <button className="group flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-all duration-200">
             지원하기 
             <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Team() {
  return (
    <section id="careers" className="py-24 md:py-32 bg-white relative overflow-hidden">
      <div className="container-custom relative z-10">
        
        {/* 1. HERO HEADER (Matching Services Structure) */}
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
             Careers
           </motion.span>
           
           <h2 className="text-[22px] sm:text-2xl md:text-[28px] font-semibold text-[#1F2937] mb-3 leading-tight tracking-tight uppercase">
             Team Global Marketing AX <span className="text-indigo-600">Careers</span>
           </h2>
           
           <p className="text-[15px] text-[#4B5563] max-w-4xl leading-relaxed font-medium">
             우리는 연구실의 기술이 아닌, 비즈니스 현장에서 &apos;작동하는 기술&apos;을 만듭니다. 
             기존 마케팅의 한계를 넘어 데이터와 기술을 활용하여 비즈니스 혁신을 이끌어갈 
             <strong> FDE(Forward Deployed Engineer & Planner)</strong>를 찾습니다.
           </p>
        </motion.div>

        {/* 2. HERO IMAGE */}
        <div className="mb-32 relative aspect-video md:aspect-21/9 w-full rounded-3xl overflow-hidden bg-gray-100 shadow-sm">
           <Image 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop"
              alt="Team Collaboration"
              fill
              className="object-cover"
              sizes="100vw"
              priority
           />
           <div className="absolute inset-0 bg-black/5" />
        </div>

        {/* 3. Recruitment Cards */}
        <div className="space-y-8 mb-32 max-w-6xl mx-auto">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* 4. Culture (Modus Operandi) - Accordion Style */}
        <div className="mt-16">
          <div className="w-full">
            
            {/* Black Box Container */}
            <div className="bg-[#000000] rounded-[40px] p-10 md:p-16 lg:p-20">
              
              {/* Section Header */}
              <div className="mb-16 max-w-7xl mx-auto">
                <span className="inline-block text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  How We Work
                </span>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
                  AX팀의 일하는 방식
                </h3>
                <p className="text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed">
                  우리는 단순히 열심히 일하는 것이 아니라, &apos;임팩트&apos;와 &apos;개인의 성장&apos;을 동시에 챙기는 황금비율을 지향합니다.
                </p>
              </div>

              {/* Culture Items - Accordion */}
              <div className="max-w-7xl mx-auto divide-y divide-gray-800">
                {culture.map((item, idx) => (
                  <CultureAccordionItem key={idx} item={item} defaultOpen={idx === 0} />
                ))}
              </div>
              
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Team;
