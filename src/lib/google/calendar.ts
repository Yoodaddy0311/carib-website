/**
 * Google Calendar API 설정 및 유틸리티
 * Calendly를 대체하는 자체 캘린더 예약 시스템
 */

import { google, calendar_v3 } from 'googleapis';

// Google Calendar API 인증 설정
const getCalendarClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CALENDAR_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
};

// 예약 가능한 시간 슬롯 타입
export interface TimeSlot {
  id: string;
  startTime: string; // ISO 8601 형식
  endTime: string;   // ISO 8601 형식
  available: boolean;
}

// 예약 정보 타입
export interface BookingData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  startTime: string;
  endTime: string;
}

// 예약 결과 타입
export interface BookingResult {
  success: boolean;
  eventId?: string;
  htmlLink?: string;
  error?: string;
}

// 캘린더 설정
const CALENDAR_CONFIG = {
  calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  timeZone: 'Asia/Seoul',
  slotDuration: 30, // 분
  workingHours: {
    start: 10, // 오전 10시
    end: 18,   // 오후 6시
  },
  workingDays: [1, 2, 3, 4, 5], // 월-금 (0=일요일)
  bufferTime: 15, // 예약 간 버퍼 시간 (분)
  bookingWindow: 14, // 예약 가능 기간 (일)
};

/**
 * 특정 날짜의 예약 가능한 슬롯 조회
 */
export async function getAvailableSlots(date: Date): Promise<TimeSlot[]> {
  const calendar = getCalendarClient();

  // 날짜 범위 설정 (해당 날짜의 업무 시간)
  const startOfDay = new Date(date);
  startOfDay.setHours(CALENDAR_CONFIG.workingHours.start, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(CALENDAR_CONFIG.workingHours.end, 0, 0, 0);

  // 주말 체크
  const dayOfWeek = date.getDay();
  if (!CALENDAR_CONFIG.workingDays.includes(dayOfWeek)) {
    return [];
  }

  try {
    // 기존 일정 조회
    const response = await calendar.events.list({
      calendarId: CALENDAR_CONFIG.calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const busySlots = response.data.items || [];

    // 가능한 슬롯 생성
    const slots: TimeSlot[] = [];
    let currentSlot = new Date(startOfDay);

    while (currentSlot < endOfDay) {
      const slotEnd = new Date(currentSlot.getTime() + CALENDAR_CONFIG.slotDuration * 60000);

      // 현재 슬롯이 기존 일정과 겹치는지 확인
      const isAvailable = !busySlots.some((event: calendar_v3.Schema$Event) => {
        const eventStart = new Date(event.start?.dateTime || event.start?.date || '');
        const eventEnd = new Date(event.end?.dateTime || event.end?.date || '');

        // 슬롯과 이벤트가 겹치는지 확인
        return currentSlot < eventEnd && slotEnd > eventStart;
      });

      // 현재 시간 이후인지 확인
      const now = new Date();
      const isInFuture = currentSlot > now;

      slots.push({
        id: `slot-${currentSlot.toISOString()}`,
        startTime: currentSlot.toISOString(),
        endTime: slotEnd.toISOString(),
        available: isAvailable && isInFuture,
      });

      currentSlot = new Date(slotEnd.getTime() + CALENDAR_CONFIG.bufferTime * 60000);
    }

    return slots;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw new Error('캘린더 정보를 가져오는데 실패했습니다.');
  }
}

/**
 * 예약 가능한 날짜 목록 조회 (향후 N일)
 */
export async function getAvailableDates(): Promise<Date[]> {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= CALENDAR_CONFIG.bookingWindow; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // 업무일만 포함
    if (CALENDAR_CONFIG.workingDays.includes(date.getDay())) {
      dates.push(date);
    }
  }

  return dates;
}

/**
 * 커피챗 예약 생성
 */
export async function createBooking(data: BookingData): Promise<BookingResult> {
  const calendar = getCalendarClient();

  const event: calendar_v3.Schema$Event = {
    summary: `[커피챗] ${data.name}님 - Carib`,
    description: `
예약자 정보:
- 이름: ${data.name}
- 이메일: ${data.email}
${data.company ? `- 회사: ${data.company}` : ''}
${data.phone ? `- 연락처: ${data.phone}` : ''}
${data.message ? `\n문의 내용:\n${data.message}` : ''}

---
이 예약은 Carib 웹사이트를 통해 자동으로 생성되었습니다.
    `.trim(),
    start: {
      dateTime: data.startTime,
      timeZone: CALENDAR_CONFIG.timeZone,
    },
    end: {
      dateTime: data.endTime,
      timeZone: CALENDAR_CONFIG.timeZone,
    },
    attendees: [
      { email: data.email, displayName: data.name },
    ],
    conferenceData: {
      createRequest: {
        requestId: `carib-coffee-chat-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: CALENDAR_CONFIG.calendarId,
      requestBody: event,
      conferenceDataVersion: 1, // Google Meet 링크 생성
      sendUpdates: 'all', // 참석자에게 초대장 발송
    });

    return {
      success: true,
      eventId: response.data.id || undefined,
      htmlLink: response.data.htmlLink || undefined,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return {
      success: false,
      error: '예약 생성에 실패했습니다. 다시 시도해주세요.',
    };
  }
}

/**
 * 예약 취소
 */
export async function cancelBooking(eventId: string): Promise<boolean> {
  const calendar = getCalendarClient();

  try {
    await calendar.events.delete({
      calendarId: CALENDAR_CONFIG.calendarId,
      eventId,
      sendUpdates: 'all',
    });
    return true;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return false;
  }
}

export { CALENDAR_CONFIG };
