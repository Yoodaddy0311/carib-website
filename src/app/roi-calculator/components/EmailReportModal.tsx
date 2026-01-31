'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { X, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import type { TaskEntry, ROICalculationResult } from '../page';

interface EmailReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskEntry[];
  result: ROICalculationResult | null;
  hourlyRate: number;
  taskTypes: readonly { value: string; label: string; automationRate: number }[];
  frequencyOptions: readonly { value: string; label: string; multiplier: number }[];
}

type SendStatus = 'idle' | 'sending' | 'success' | 'error';

export function EmailReportModal({
  isOpen,
  onClose,
  tasks,
  result,
  hourlyRate,
  taskTypes,
  frequencyOptions,
}: EmailReportModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; name?: string } = {};

    if (!email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요';
    }

    if (!name) {
      newErrors.name = '이름을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !result) return;

    setSendStatus('sending');

    try {
      // Prepare email content
      const emailData = {
        to: email,
        name,
        company,
        message,
        roiResult: {
          savedHoursPerYear: result.savedHoursPerYear,
          savingsPerYear: result.savingsPerYear,
          paybackPeriodMonths: result.paybackPeriodMonths,
          threeYearROI: result.threeYearROI,
          tasks: tasks.map((task) => ({
            type: taskTypes.find((t) => t.value === task.taskType)?.label || task.taskType,
            hoursPerWeek: task.hoursPerWeek,
            frequency: frequencyOptions.find((f) => f.value === task.frequency)?.label || task.frequency,
            staffCount: task.staffCount,
          })),
          hourlyRate,
        },
      };

      // Call API to send email
      const response = await fetch('/api/roi-report/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setSendStatus('success');

      // Reset form after success
      setTimeout(() => {
        setSendStatus('idle');
        setEmail('');
        setName('');
        setCompany('');
        setMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSendStatus('error');

      // Reset status after showing error
      setTimeout(() => {
        setSendStatus('idle');
      }, 3000);
    }
  };

  const handleClose = () => {
    if (sendStatus === 'sending') return; // Prevent closing while sending
    setSendStatus('idle');
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className="bg-white dark:bg-[var(--color-gray-100)] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-gray-200)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-500)]/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[var(--color-primary-600)]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">
                      이메일로 리포트 발송
                    </h2>
                    <p className="text-sm text-[var(--color-gray-500)]">
                      ROI 분석 결과를 이메일로 받아보세요
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-[var(--color-gray-100)] transition-colors"
                  aria-label="닫기"
                  disabled={sendStatus === 'sending'}
                >
                  <X className="w-5 h-5 text-[var(--color-gray-500)]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {sendStatus === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-[var(--color-success)]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">발송 완료!</h3>
                    <p className="text-[var(--color-gray-500)]">
                      입력하신 이메일로 ROI 분석 리포트가 발송되었습니다.
                    </p>
                  </motion.div>
                ) : sendStatus === 'error' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-[var(--color-error)]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">발송 실패</h3>
                    <p className="text-[var(--color-gray-500)]">
                      이메일 발송 중 오류가 발생했습니다. 다시 시도해주세요.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email" required>
                        이메일
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@company.com"
                        error={errors.email}
                        leftIcon={<Mail className="w-4 h-4" />}
                      />
                    </div>

                    <div>
                      <Label htmlFor="name" required>
                        이름
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="홍길동"
                        error={errors.name}
                      />
                    </div>

                    <div>
                      <Label htmlFor="company">
                        회사명 (선택)
                      </Label>
                      <Input
                        id="company"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="ABC 주식회사"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">
                        추가 메시지 (선택)
                      </Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="추가적인 문의 사항이나 요청 사항을 입력해주세요"
                        rows={3}
                      />
                    </div>

                    {/* Summary preview */}
                    {result && (
                      <div className="p-4 rounded-xl bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-200)]">
                        <p className="text-sm text-[var(--color-gray-600)] mb-2">리포트 미리보기</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-[var(--color-gray-500)]">연간 절감액:</span>{' '}
                            <strong>{Math.round(result.savingsPerYear / 10000).toLocaleString()}만원</strong>
                          </div>
                          <div>
                            <span className="text-[var(--color-gray-500)]">절감 시간:</span>{' '}
                            <strong>{Math.round(result.savedHoursPerYear).toLocaleString()}시간</strong>
                          </div>
                          <div>
                            <span className="text-[var(--color-gray-500)]">투자 회수:</span>{' '}
                            <strong>{result.paybackPeriodMonths}개월</strong>
                          </div>
                          <div>
                            <span className="text-[var(--color-gray-500)]">3년 ROI:</span>{' '}
                            <strong>{Math.round(result.threeYearROI)}%</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={sendStatus === 'sending'}
                        className="flex-1"
                      >
                        취소
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        isLoading={sendStatus === 'sending'}
                        leftIcon={<Send className="w-4 h-4" />}
                        className="flex-1"
                      >
                        리포트 발송
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
