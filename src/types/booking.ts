/**
 * 예약 시스템 타입 정의
 */

// 예약 가능한 시간 슬롯
export interface TimeSlot {
  id: string;
  startTime: string; // ISO 8601 형식
  endTime: string;   // ISO 8601 형식
  available: boolean;
}

// 예약 요청 데이터
export interface BookingRequest {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
  startTime: string;
  endTime: string;
}

// 예약 결과
export interface BookingResult {
  success: boolean;
  eventId?: string;
  htmlLink?: string;
  error?: string;
}

// API 응답 타입
export interface BookingSlotsResponse {
  success: true;
  slots: TimeSlot[];
}

export interface BookingDatesResponse {
  success: true;
  dates: string[];
}

export interface BookingSuccessResponse {
  success: true;
  eventId?: string;
  meetLink?: string;
  inquiryId?: string;
}

export interface BookingErrorResponse {
  success: false;
  error: string;
}

export type BookingApiResponse =
  | BookingSlotsResponse
  | BookingDatesResponse
  | BookingSuccessResponse
  | BookingErrorResponse;

// 캘린더 설정 타입
export interface CalendarConfig {
  calendarId: string;
  timeZone: string;
  slotDuration: number; // 분
  workingHours: {
    start: number; // 시 (24시간 형식)
    end: number;
  };
  workingDays: number[]; // 0-6 (일-토)
  bufferTime: number; // 분
  bookingWindow: number; // 일
}
