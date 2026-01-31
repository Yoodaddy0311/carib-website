'use client';

import Script from 'next/script';

// Main StructuredData component for global schema
export function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Carib',
    url: 'https://carib.team',
    logo: 'https://carib.team/logo.png',
    description: 'AI 업무 자동화 전문 FDE 팀. 반복되는 업무는 AI에게, 창의적인 일은 사람에게.',
    email: 'hello@carib.team',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hello@carib.team',
      availableLanguage: ['Korean', 'English'],
    },
    sameAs: [
      'https://twitter.com/carib_team',
      'https://linkedin.com/company/carib',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Carib',
    url: 'https://carib.team',
    description: 'AI 업무 자동화 전문 FDE 팀',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

// Organization Schema Component
interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  email?: string;
  sameAs?: string[];
}

export function OrganizationSchema({
  name = 'Carib',
  url = 'https://carib.team',
  logo = 'https://carib.team/logo.png',
  description = 'AI 업무 자동화 전문 FDE 팀. 반복되는 업무는 AI에게, 창의적인 일은 사람에게.',
  email = 'contact@carib.team',
  sameAs = [],
}: OrganizationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    email,
    sameAs,
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email,
      availableLanguage: ['Korean', 'English'],
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema Component
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Service Schema Component
interface ServiceSchemaProps {
  name: string;
  description: string;
  provider?: string;
  providerUrl?: string;
}

export function ServiceSchema({
  name,
  description,
  provider = 'Carib',
  providerUrl = 'https://carib.team',
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
      url: providerUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'South Korea',
    },
  };

  return (
    <Script
      id={`service-schema-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebSite Schema Component
interface WebSiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
}

export function WebSiteSchema({
  name = 'Carib',
  url = 'https://carib.team',
  description = 'AI 업무 자동화 전문 FDE 팀',
}: WebSiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// BreadcrumbList Schema Component
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Article Schema Component (for blog posts or threads)
interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  publisherName?: string;
  publisherLogo?: string;
}

export function ArticleSchema({
  headline,
  description,
  image = 'https://carib.team/og-image.png',
  datePublished,
  dateModified,
  authorName = 'Carib Team',
  publisherName = 'Carib',
  publisherLogo = 'https://carib.team/logo.png',
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo,
      },
    },
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// SoftwareApplication Schema Component (for ROI Calculator)
interface SoftwareApplicationSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  applicationCategory?: string;
  operatingSystem?: string;
}

export function SoftwareApplicationSchema({
  name = 'ROI 계산기',
  description = 'AI 업무 자동화 투자수익률 분석 도구. 반복 업무를 AI로 자동화했을 때 예상되는 비용 절감액과 투자 회수 기간을 계산합니다.',
  url = 'https://carib.team/roi-calculator',
  applicationCategory = 'BusinessApplication',
  operatingSystem = 'Web Browser',
}: SoftwareApplicationSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    provider: {
      '@type': 'Organization',
      name: 'Carib',
      url: 'https://carib.team',
    },
  };

  return (
    <Script
      id="software-application-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// LocalBusiness Schema Component
interface LocalBusinessSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  email?: string;
  priceRange?: string;
}

export function LocalBusinessSchema({
  name = 'Carib',
  description = 'AI 업무 자동화 전문 FDE 팀. 반복되는 업무는 AI에게, 창의적인 일은 사람에게.',
  url = 'https://carib.team',
  email = 'contact@carib.team',
  priceRange = '$$',
}: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name,
    description,
    url,
    email,
    priceRange,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '37.5665',
      longitude: '126.9780',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  };

  return (
    <Script
      id="local-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
