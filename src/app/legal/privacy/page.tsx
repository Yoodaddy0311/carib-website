import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'Carib의 개인정보처리방침입니다. 개인정보의 수집, 이용, 보관 및 보호에 대한 정책을 안내합니다.',
};

export default function PrivacyPolicyPage() {
  return (
    <article className="legal-content">
      {/* Header */}
      <header className="mb-10 pb-8 border-b border-[var(--color-gray-200)]">
        <h1 className="text-display-3 md:text-display-2 font-bold text-[var(--color-gray-900)] mb-4">
          개인정보처리방침
        </h1>
        <p className="text-body-2 text-[var(--color-gray-500)]">
          최종 수정일: 2025년 1월 31일
        </p>
      </header>

      {/* Introduction */}
      <div className="mb-10">
        <p className="text-body-1 text-[var(--color-gray-700)] leading-relaxed">
          Carib(이하 &quot;회사&quot;)는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다.
          회사는 본 개인정보처리방침을 통해 이용자의 개인정보가 어떠한 목적과 방식으로 수집, 이용, 보관되며,
          어떠한 조치를 통해 보호되고 있는지 안내드립니다.
        </p>
      </div>

      {/* Section 1 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          1. 수집하는 개인정보 항목
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집할 수 있습니다.</p>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              필수 수집 항목
            </h3>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-gray-600)]">
              <li>이름, 이메일 주소</li>
              <li>연락처 (전화번호)</li>
              <li>회사명 및 직책 (비즈니스 문의 시)</li>
            </ul>
          </div>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              선택 수집 항목
            </h3>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-gray-600)]">
              <li>프로젝트 관련 정보 및 요구사항</li>
              <li>서비스 이용 기록, 접속 로그, 쿠키</li>
              <li>기기 정보 (OS, 브라우저 종류)</li>
            </ul>
          </div>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              자동 수집 항목
            </h3>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-gray-600)]">
              <li>IP 주소, 방문 일시</li>
              <li>서비스 이용 기록 및 행태 정보</li>
              <li>쿠키를 통한 사이트 이용 정보</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          2. 개인정보의 수집 및 이용 목적
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>회사는 수집한 개인정보를 다음의 목적으로 이용합니다.</p>
          <ul className="list-decimal list-inside space-y-3 ml-2">
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">서비스 제공 및 운영</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                커피챗 예약, 프로젝트 문의 접수 및 상담, 맞춤형 AI 솔루션 제안
              </p>
            </li>
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">계약 이행 및 고객 관리</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                서비스 계약의 체결 및 이행, 고객 문의 응대, 서비스 관련 안내 및 공지
              </p>
            </li>
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">마케팅 및 서비스 개선</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                신규 서비스 안내 (동의 시), 이벤트 정보 제공, 서비스 이용 통계 분석 및 개선
              </p>
            </li>
            <li>
              <span className="font-medium text-[var(--color-gray-800)]">법적 의무 준수</span>
              <p className="ml-6 mt-1 text-[var(--color-gray-600)]">
                관련 법령에 따른 의무 이행 및 분쟁 해결
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          3. 개인정보의 보유 및 이용 기간
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>
            회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
            단, 관련 법령에 따라 보존이 필요한 경우에는 아래 기간 동안 보관합니다.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[var(--color-gray-100)]">
                  <th className="border border-[var(--color-gray-200)] px-4 py-3 text-left font-semibold text-[var(--color-gray-800)]">
                    보존 항목
                  </th>
                  <th className="border border-[var(--color-gray-200)] px-4 py-3 text-left font-semibold text-[var(--color-gray-800)]">
                    보존 기간
                  </th>
                  <th className="border border-[var(--color-gray-200)] px-4 py-3 text-left font-semibold text-[var(--color-gray-800)]">
                    관련 법령
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">계약 또는 청약철회 기록</td>
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">5년</td>
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">전자상거래법</td>
                </tr>
                <tr className="bg-[var(--color-gray-50)]">
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">대금결제 및 재화 공급 기록</td>
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">5년</td>
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">전자상거래법</td>
                </tr>
                <tr>
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">소비자 불만 또는 분쟁처리 기록</td>
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">3년</td>
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">전자상거래법</td>
                </tr>
                <tr className="bg-[var(--color-gray-50)]">
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">웹사이트 방문 기록</td>
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">3개월</td>
                  <td className="border border-[var(--color-gray-200)] px-4 py-3">통신비밀보호법</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 4 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          4. 개인정보의 제3자 제공
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>
            회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            <li>서비스 제공에 따른 요금 정산을 위해 필요한 경우</li>
          </ul>
          <p className="mt-4 p-4 bg-[var(--color-primary-50)] rounded-lg text-[var(--color-primary-800)]">
            현재 회사는 개인정보를 제3자에게 제공하고 있지 않습니다.
            향후 제3자 제공이 필요한 경우, 이용자에게 사전 고지 및 동의를 받겠습니다.
          </p>
        </div>
      </section>

      {/* Section 5 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          5. 개인정보의 파기
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>
            회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는
            지체 없이 해당 개인정보를 파기합니다.
          </p>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              파기 절차
            </h3>
            <p className="text-[var(--color-gray-600)]">
              이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류)
              내부 방침 및 기타 관련 법령에 따라 일정 기간 저장된 후 혹은 즉시 파기됩니다.
            </p>
          </div>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              파기 방법
            </h3>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-gray-600)]">
              <li>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
              <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 6 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          6. 이용자의 권리
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>이용자는 개인정보 주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리 정지 요구</li>
          </ul>
          <p className="mt-4">
            위 권리 행사는 회사에 대해 서면, 전화, 이메일 등을 통하여 하실 수 있으며,
            회사는 이에 대해 지체 없이 조치하겠습니다.
          </p>
          <p>
            이용자가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는
            회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.
          </p>
        </div>
      </section>

      {/* Section 7 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          7. 쿠키 사용
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>
            회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 이용 정보를 저장하고
            수시로 불러오는 &apos;쿠키(cookie)&apos;를 사용합니다.
          </p>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              쿠키의 사용 목적
            </h3>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-gray-600)]">
              <li>이용자의 접속 빈도나 방문 시간 등을 분석하여 서비스 개선</li>
              <li>이용자의 관심 분야를 파악하여 맞춤형 정보 제공</li>
              <li>웹사이트 이용 통계 분석</li>
            </ul>
          </div>

          <div className="bg-[var(--color-gray-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-gray-800)] mb-3">
              쿠키 설정 거부 방법
            </h3>
            <p className="text-[var(--color-gray-600)] mb-2">
              이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다.
              웹 브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나,
              쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
            </p>
            <p className="text-[var(--color-gray-500)] text-caption">
              설정 방법: 브라우저 상단의 도구 &gt; 인터넷 옵션 &gt; 개인정보 &gt; 쿠키 설정
            </p>
          </div>
        </div>
      </section>

      {/* Section 8 */}
      <section className="mb-10">
        <h2 className="text-heading-1 font-semibold text-[var(--color-gray-900)] mb-4">
          8. 개인정보 보호책임자
        </h2>
        <div className="space-y-4 text-body-2 text-[var(--color-gray-700)]">
          <p>
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
            개인정보 처리와 관련한 이용자의 불만 처리 및 피해 구제 등을 위하여
            아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>

          <div className="bg-[var(--color-primary-50)] rounded-xl p-6">
            <h3 className="text-heading-3 font-medium text-[var(--color-primary-800)] mb-4">
              개인정보 보호책임자
            </h3>
            <ul className="space-y-2 text-[var(--color-primary-700)]">
              <li><span className="font-medium">팀명:</span> Carib</li>
              <li><span className="font-medium">이메일:</span> privacy@carib.team</li>
              <li><span className="font-medium">연락처:</span> 웹사이트 문의 양식 이용</li>
            </ul>
          </div>

          <p className="mt-4">
            기타 개인정보 침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2 text-[var(--color-gray-600)]">
            <li>개인정보침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
            <li>대검찰청 사이버수사과 (www.spo.go.kr / 국번없이 1301)</li>
            <li>경찰청 사이버안전국 (cyberbureau.police.go.kr / 국번없이 182)</li>
          </ul>
        </div>
      </section>

      {/* Footer Notice */}
      <footer className="mt-12 pt-8 border-t border-[var(--color-gray-200)]">
        <p className="text-body-2 text-[var(--color-gray-600)]">
          본 개인정보처리방침은 2025년 1월 31일부터 적용됩니다.
          개인정보처리방침 내용에 변경이 있을 경우 개정 최소 7일 전에 웹사이트를 통해 공지하겠습니다.
        </p>
      </footer>
    </article>
  );
}
