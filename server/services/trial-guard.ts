import { getDb } from "../db";
import { freeTrialTracking, subscriptions } from "../../drizzle/schema";
import { eq, and, or } from "drizzle-orm";
import crypto from "crypto";

/**
 * 무료 체험 추적 및 제한 서비스
 * IP + 디바이스 핑거프린트로 중복 체험 방지
 */

export interface TrialCheckResult {
  allowed: boolean;
  reason?: string;
  expiresAt?: Date;
  daysRemaining?: number;
}

/**
 * 디바이스 핑거프린트 생성
 * User-Agent + IP를 조합하여 고유 식별자 생성
 */
export function generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
  const data = `${userAgent}|${ipAddress}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * 무료 체험 가능 여부 확인
 */
export async function checkTrialEligibility(
  userId: number | null,
  ipAddress: string,
  userAgent: string
): Promise<TrialCheckResult> {
  const db = await getDb();
  if (!db) {
    return { allowed: false, reason: "데이터베이스 연결 실패" };
  }

  const deviceFingerprint = generateDeviceFingerprint(userAgent, ipAddress);

  // 1. 기존 구독 확인
  if (userId) {
    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (subscription.length > 0) {
      const sub = subscription[0];
      
      // 유료 플랜 사용자는 무제한 접근
      if (sub.plan !== "free") {
        return { allowed: true };
      }

      // Free 플랜이지만 만료되지 않은 경우
      if (sub.expiresAt && sub.expiresAt > new Date()) {
        const daysRemaining = Math.ceil(
          (sub.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return {
          allowed: true,
          expiresAt: sub.expiresAt,
          daysRemaining,
        };
      }
    }
  }

  // 2. IP 또는 디바이스 핑거프린트로 기존 체험 기록 확인
  const existingTrial = await db
    .select()
    .from(freeTrialTracking)
    .where(
      or(
        eq(freeTrialTracking.ipAddress, ipAddress),
        eq(freeTrialTracking.deviceFingerprint, deviceFingerprint)
      )
    )
    .limit(1);

  if (existingTrial.length > 0) {
    const trial = existingTrial[0];

    // 차단된 경우
    if (trial.isBlocked === 1) {
      return {
        allowed: false,
        reason: "무료 체험 기간이 종료되었습니다. 구독을 통해 계속 이용하실 수 있습니다.",
      };
    }

    // 체험 기간이 남아있는 경우
    if (trial.trialExpiresAt > new Date()) {
      const daysRemaining = Math.ceil(
        (trial.trialExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return {
        allowed: true,
        expiresAt: trial.trialExpiresAt,
        daysRemaining,
      };
    }

    // 체험 기간 만료 - 차단 처리
    await db
      .update(freeTrialTracking)
      .set({ isBlocked: 1 })
      .where(eq(freeTrialTracking.id, trial.id));

    return {
      allowed: false,
      reason: "무료 체험 기간이 종료되었습니다. 구독을 통해 계속 이용하실 수 있습니다.",
    };
  }

  // 3. 신규 사용자 - 2일 체험 시작
  const trialExpiresAt = new Date();
  trialExpiresAt.setDate(trialExpiresAt.getDate() + 2);

  await db.insert(freeTrialTracking).values({
    userId: userId || null,
    ipAddress,
    deviceFingerprint,
    userAgent,
    trialStartedAt: new Date(),
    trialExpiresAt,
    isBlocked: 0,
    createdAt: new Date(),
  });

  return {
    allowed: true,
    expiresAt: trialExpiresAt,
    daysRemaining: 2,
  };
}

/**
 * 관리자가 특정 IP/디바이스 차단 해제
 */
export async function unblockTrial(ipAddress: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(freeTrialTracking)
    .set({ isBlocked: 0 })
    .where(eq(freeTrialTracking.ipAddress, ipAddress));

  return true;
}
