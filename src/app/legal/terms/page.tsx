import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관',
  description: 'Carib 서비스 이용약관입니다. 서비스 이용에 관한 조건과 규정을 안내합니다.',
};

export default function TermsOfServicePage() {
  return (
    <article className="legal-content">
      {/* Header */}
      <header className="mb-10 pb-8 border-b border-[var(--color-gray-200)]">
        <h1 className="text-display-3 md:text-display-2 font-bold text-[var(--color-gray-900)] mb-4">
          이용약관
        </h1>
        <p className="text-body-2 text-[var(--color-gray-500)]">
          최종 수정일: 2025년 1월 31일
        </p>
      </header>

      {/* Introduction */}
      <div className="mb-10">
        <p className="text-body-1 text-[var(--color-gray-700)] leading-relaxed">
          본 이용약관(이하 &quot;약관&quot;)은 Carib(이하 &quot;회사&quot;)가 제공하는 AI 업무 자동화 관련 서비스(이하 &quot;서비스&quot;)의
          이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </p>
      </div>

      {/* Section 1 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          1. 서비스 소개
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>회사는 다음과 같은 서비스를 제공합니다.</p>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              주요 서비스
            </h3>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-gray-600)]">
              <li>
                <span className="font-medium text-[var(--color-gray-800)]">AI 자동화 컨설팅:</span>
                업무 프로세스 분석 및 AI 도입 전략 수립
              </li>
              <li>
                <span className="font-medium text-[var(--color-gray-800)]">업무 프로세스 최적화:</span>
                반복 업무 자동화 솔루션 개발 및 구현
              </li>
              <li>
                <span className="font-medium text-[var(--color-gray-800)]">커스텀 AI 솔루션:</span>
                비즈니스 맞춤형 AI 시스템 설계 및 개발
              </li>
              <li>
                <span className="font-medium text-[var(--color-gray-800)]">교육 및 워크샵:</span>
                AI 활용 역량 강화를 위한 실무 중심 교육
              </li>
              <li>
                <span className="font-medium text-[var(--color-gray-800)]">커피챗:</span>
                AI 자동화 관련 무료 상담 서비스
              </li>
            </ul>
          </div>

          <p>
            회사는 서비스의 품질 향상을 위해 서비스 내용을 변경하거나 새로운 서비스를 추가할 수 있으며,
            이 경우 변경 사항을 사전에 공지합니다.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          2. 이용 계약의 성립
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>이용 계약은 다음과 같은 절차로 성립됩니다.</p>

          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">서비스 신청:</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                이용자가 웹사이트를 통해 커피챗 예약, 문의 양식 제출, 또는 서비스 계약을 신청합니다.
              </p>
            </li>
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">약관 동의:</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                이용자가 본 약관 및 개인정보처리방침에 동의함으로써 서비스 이용 의사를 표시합니다.
              </p>
            </li>
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">승낙:</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                회사가 이용자의 신청을 검토한 후 이를 승낙하면 이용 계약이 성립됩니다.
              </p>
            </li>
          </ol>

          <div className="mt-4 p-4 bg-[var(--color-accent-50)] rounded-lg">
            <p className="text-[var(--color-accent-800)]">
              <span className="font-semibold">유의사항:</span> 회사는 다음의 경우 이용 신청을 승낙하지 않거나
              사후에 이용 계약을 해지할 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-accent-700)]">
              <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
              <li>허위의 정보를 기재하거나 필수 정보를 기재하지 않은 경우</li>
              <li>이전에 본 약관을 위반하여 이용 자격을 상실한 경우</li>
              <li>기타 이용 신청 승낙이 부적절하다고 판단되는 경우</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          3. 서비스 이용
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              서비스 이용 시간
            </h3>
            <p className="text-[var(--color-gray-600)]">
              서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
              다만, 시스템 점검, 업데이트 등 회사의 업무상 또는 기술상 필요한 경우
              서비스 이용이 일시적으로 제한될 수 있습니다.
            </p>
          </div>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              유료 서비스
            </h3>
            <p className="text-[var(--color-gray-600)]">
              회사가 제공하는 유료 서비스의 이용 요금, 결제 방법, 환불 정책 등은
              별도의 서비스 계약서에 명시되며, 해당 계약서가 본 약관에 우선합니다.
            </p>
          </div>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              서비스 이용 제한
            </h3>
            <p className="text-[var(--color-gray-600)]">
              회사는 이용자가 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우,
              경고, 일시 정지, 영구 이용 정지 등으로 서비스 이용을 제한할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          4. 서비스 변경 및 중단
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>
            회사는 상당한 이유가 있는 경우 운영상, 기술상의 필요에 따라
            제공하고 있는 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.
          </p>

          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>서비스 변경 시 변경 내용 및 적용일자를 사전에 공지합니다.</li>
            <li>불가피한 사유로 사전 공지가 어려운 경우 사후에 공지할 수 있습니다.</li>
            <li>무료로 제공되는 서비스의 전부 또는 일부를 회사의 정책에 따라 수정, 중단, 변경할 수 있으며,
                이에 대해 별도의 보상을 하지 않습니다.</li>
          </ul>

          <div className="mt-4 p-4 bg-[var(--color-primary-50)] rounded-lg">
            <p className="text-[var(--color-primary-800)]">
              <span className="font-semibold">서비스 중단 사유:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-[var(--color-primary-700)]">
              <li>시스템 정기 점검, 서버 증설 및 교체, 네트워크 불안정 등</li>
              <li>정전, 설비 장애, 서비스 이용량 폭주 등으로 정상적인 서비스 제공이 어려운 경우</li>
              <li>천재지변, 국가비상사태 등 불가항력적 사유가 발생한 경우</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          5. 이용자의 의무
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>이용자는 서비스 이용과 관련하여 다음 각 호의 행위를 하여서는 안 됩니다.</p>

          <ol className="list-decimal list-inside space-y-3 ml-2">
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">허위 정보 제공</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                신청 또는 변경 시 허위 내용을 등록하는 행위
              </p>
            </li>
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">정보 도용</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                타인의 정보를 도용하거나 부정하게 사용하는 행위
              </p>
            </li>
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">명예 훼손</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                회사 또는 제3자의 명예를 손상시키거나 업무를 방해하는 행위
              </p>
            </li>
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">지적재산권 침해</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                회사 또는 제3자의 지적재산권을 침해하는 행위
              </p>
            </li>
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">시스템 방해</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                서비스의 안정적 운영을 방해하거나 시스템에 무단 접근하는 행위
              </p>
            </li>
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">불법 행위</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                법령 또는 본 약관에서 금지하는 행위
              </p>
            </li>
          </ol>

          <p className="mt-4 text-[var(--color-gray-600)]">
            이용자는 관계 법령, 본 약관의 규정, 이용안내 및 서비스와 관련하여
            공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 합니다.
          </p>
        </div>
      </section>

      {/* Section 6 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          6. 지적재산권
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              회사의 지적재산권
            </h3>
            <p className="text-[var(--color-gray-600)]">
              서비스 및 관련 소프트웨어, 디자인, 콘텐츠(텍스트, 이미지, 영상 등),
              상표, 로고 등에 대한 지적재산권은 회사에 귀속됩니다.
              이용자는 회사의 사전 서면 동의 없이 이를 복제, 배포, 전송, 출판,
              방송 등의 방법으로 사용하거나 제3자에게 이용하게 할 수 없습니다.
            </p>
          </div>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              이용자의 콘텐츠
            </h3>
            <p className="text-[var(--color-gray-600)]">
              이용자가 서비스 이용 과정에서 제공한 자료의 지적재산권은 해당 이용자에게 귀속됩니다.
              다만, 회사는 서비스 운영, 개선, 프로모션 등의 목적으로 이용자가 제공한 자료를
              사용할 수 있으며, 이 경우 이용자의 개인정보는 보호됩니다.
            </p>
          </div>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              성과물의 귀속
            </h3>
            <p className="text-[var(--color-gray-600)]">
              유료 서비스를 통해 개발된 맞춤형 솔루션, AI 모델 등 성과물의
              지적재산권 귀속은 별도의 서비스 계약서에서 정하는 바에 따릅니다.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          7. 면책조항
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>회사는 다음 각 호의 경우 책임을 지지 않습니다.</p>

          <ul className="list-disc list-inside space-y-3 ml-2">
            <li>
              천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우
            </li>
            <li>
              이용자의 귀책사유로 인한 서비스 이용 장애
            </li>
            <li>
              이용자가 서비스를 이용하여 기대하는 수익을 얻지 못한 경우
            </li>
            <li>
              이용자가 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용
            </li>
            <li>
              이용자 상호간 또는 이용자와 제3자 간에 서비스를 매개로 발생한 분쟁
            </li>
            <li>
              무료로 제공되는 서비스 이용과 관련하여 발생하는 손해
            </li>
          </ul>

          <div className="mt-4 p-4 bg-[var(--color-accent-50)] rounded-lg">
            <p className="text-[var(--color-accent-800)]">
              <span className="font-semibold">AI 서비스 관련 면책:</span>
              회사가 제공하는 AI 기반 서비스의 결과물은 참고 목적으로 제공되며,
              최종 의사결정은 이용자의 판단과 책임 하에 이루어져야 합니다.
              AI 서비스의 출력 결과를 활용한 행위로 인해 발생하는 손해에 대해서
              회사는 고의 또는 중과실이 없는 한 책임을 지지 않습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Section 8 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          8. 분쟁 해결
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              준거법
            </h3>
            <p className="text-[var(--color-gray-600)]">
              본 약관의 해석 및 서비스 이용에 관한 분쟁은 대한민국 법률을 따릅니다.
            </p>
          </div>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              관할법원
            </h3>
            <p className="text-[var(--color-gray-600)]">
              서비스 이용으로 인해 발생한 분쟁에 대해 소송이 제기되는 경우,
              회사의 본사 소재지를 관할하는 법원을 전속관할법원으로 합니다.
            </p>
          </div>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              분쟁 조정
            </h3>
            <p className="text-[var(--color-gray-600)]">
              분쟁 발생 시 양 당사자는 우선 협의를 통해 원만한 해결을 도모하며,
              필요한 경우 한국인터넷진흥원의 개인정보침해신고센터 또는
              한국소비자원 소비자분쟁조정위원회 등의 분쟁조정기관을 이용할 수 있습니다.
            </p>
          </div>

          <div className="bg-[var(--color-primary-50)] rounded-xl p-6 mt-4">
            <h3 className="text-heading-3 font-medium text-[var(--color-primary-800)] mb-3">
              문의처
            </h3>
            <ul className="space-y-2 text-[var(--color-primary-700)]">
              <li><span className="font-medium">이메일:</span> support@carib.team</li>
              <li><span className="font-medium">웹사이트:</span> carib.team</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Supplementary Provisions */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          부칙
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>본 약관은 2025년 1월 31일부터 시행됩니다.</li>
            <li>본 약관은 회사의 사정에 따라 변경될 수 있으며, 변경된 약관은 웹사이트를 통해 공지합니다.</li>
            <li>변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            <li>변경된 약관 공지 후 7일 이내에 이의를 제기하지 않은 경우 변경에 동의한 것으로 간주합니다.</li>
          </ol>
        </div>
      </section>

      {/* Footer Notice */}
      <footer className="mt-12 pt-8 border-t border-[var(--color-gray-200)]">
        <p className="text-body-2 text-[var(--color-gray-600)]">
          본 이용약관은 2025년 1월 31일부터 적용됩니다.
          이용약관 내용에 변경이 있을 경우 개정 최소 7일 전에 웹사이트를 통해 공지하겠습니다.
        </p>
      </footer>
    </article>
  );
}
