import { Smartphone, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

/**
 * 무료 플랜 사용자의 모바일 접속을 차단하는 컴포넌트
 */
export default function MobileBlocker({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const subscriptionQuery = trpc.subscription.getCurrent.useQuery();

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'mobile', 'webos', 'blackberry', 'windows phone'];
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isSmallScreen = window.innerWidth < 768; // 768px 미만은 모바일로 간주
      
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const subscription = subscriptionQuery.data;
  const isFreePlan = subscription?.plan === 'free';
  const isExpired = subscription?.status === 'expired';

  // 무료 플랜 + 모바일 접속 시 차단
  if (isMobile && isFreePlan && !isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/50 border-2 border-cyan-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
          {/* Icon */}
          <div className="mb-6 flex justify-center gap-4">
            <div className="relative">
              <Smartphone className="w-16 h-16 text-red-400" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">✕</span>
              </div>
            </div>
            <Monitor className="w-16 h-16 text-cyan-400 animate-pulse" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">
            PC에서 이용해주세요
          </h1>

          {/* Description */}
          <p className="text-slate-300 mb-6 leading-relaxed">
            무료 플랜은 <span className="text-cyan-400 font-bold">PC 전용</span>입니다.
            <br />
            모바일에서 이용하시려면 Pro 또는 Premium 플랜으로 업그레이드해주세요.
          </p>

          {/* Features */}
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
            <div className="text-sm text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Pro 플랜: 모바일 + PC 모두 이용 가능</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Premium 플랜: 모바일 + PC + AI 리포트</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <a
            href="/subscription"
            className="inline-block w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all"
          >
            업그레이드하기
          </a>

          {/* Footer */}
          <p className="text-xs text-slate-500 mt-4">
            PC에서 접속하시면 무료로 이용하실 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // 무료 플랜 만료 시
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/50 border-2 border-red-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-5xl">⏰</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">
            무료 체험 기간 종료
          </h1>

          {/* Description */}
          <p className="text-slate-300 mb-6 leading-relaxed">
            7일 무료 체험 기간이 종료되었습니다.
            <br />
            계속 이용하시려면 유료 플랜으로 업그레이드해주세요.
          </p>

          {/* Expiry Date */}
          {subscription?.expiresAt && (
            <div className="bg-slate-800/50 rounded-lg p-3 mb-6">
              <p className="text-sm text-slate-400">
                만료일: <span className="text-red-400 font-bold">
                  {new Date(subscription.expiresAt).toLocaleDateString('ko-KR')}
                </span>
              </p>
            </div>
          )}

          {/* CTA */}
          <a
            href="/subscription"
            className="inline-block w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all"
          >
            플랜 선택하기
          </a>
        </div>
      </div>
    );
  }

  // 정상 접속
  return <>{children}</>;
}
