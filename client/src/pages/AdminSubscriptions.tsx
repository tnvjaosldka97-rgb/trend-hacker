import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, Calendar, Ban, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSubscriptions() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: subscriptions, isLoading, refetch } = trpc.admin.listSubscriptions.useQuery();
  const updateSubscriptionMutation = trpc.admin.updateSubscription.useMutation({
    onSuccess: () => {
      toast.success("구독 정보가 업데이트되었습니다");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "업데이트에 실패했습니다");
    },
  });

  const filteredSubscriptions = subscriptions?.filter((sub) =>
    sub.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdatePlan = (userId: number, plan: string) => {
    updateSubscriptionMutation.mutate({ userId, plan: plan as "free" | "pro" | "premium" });
  };

  const handleUpdateStatus = (userId: number, status: string) => {
    updateSubscriptionMutation.mutate({ userId, status: status as "active" | "cancelled" | "expired" });
  };

  const handleExtendTrial = (userId: number, days: number) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    updateSubscriptionMutation.mutate({ userId, expiresAt });
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "premium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "pro":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/50";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/50";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/50";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">구독 관리</h1>
                <p className="text-slate-400 text-sm">슈퍼어드민 대시보드</p>
              </div>
            </div>
            <a
              href="/"
              className="text-slate-400 hover:text-cyan-300 transition-colors"
            >
              ← 홈으로
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Search Bar */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="이메일 또는 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Subscriptions Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="mt-4 text-slate-400">로딩 중...</p>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300">사용자</TableHead>
                  <TableHead className="text-slate-300">이메일</TableHead>
                  <TableHead className="text-slate-300">플랜</TableHead>
                  <TableHead className="text-slate-300">상태</TableHead>
                  <TableHead className="text-slate-300">만료일</TableHead>
                  <TableHead className="text-slate-300">온디맨드</TableHead>
                  <TableHead className="text-slate-300 text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions?.map((sub) => (
                  <TableRow key={sub.id} className="border-slate-800 hover:bg-slate-800/30">
                    <TableCell className="font-medium text-white">
                      {sub.user.name || "이름 없음"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {sub.user.email || "이메일 없음"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={sub.plan}
                        onValueChange={(value) => handleUpdatePlan(sub.userId, value)}
                      >
                        <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={sub.status}
                        onValueChange={(value) => handleUpdateStatus(sub.userId, value)}
                      >
                        <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {sub.expiresAt
                        ? new Date(sub.expiresAt).toLocaleDateString("ko-KR")
                        : "무제한"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {sub.plan === "premium"
                        ? "무제한"
                        : sub.plan === "pro"
                        ? `${sub.onDemandUsed}/3`
                        : "0/0"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExtendTrial(sub.userId, 7)}
                          className="bg-slate-800 hover:bg-slate-700 border-slate-700"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          +7일
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExtendTrial(sub.userId, 30)}
                          className="bg-slate-800 hover:bg-slate-700 border-slate-700"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          +30일
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">전체 사용자</div>
            <div className="text-3xl font-bold text-white">
              {subscriptions?.length || 0}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Free 플랜</div>
            <div className="text-3xl font-bold text-slate-300">
              {subscriptions?.filter((s) => s.plan === "free").length || 0}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Pro 플랜</div>
            <div className="text-3xl font-bold text-cyan-400">
              {subscriptions?.filter((s) => s.plan === "pro").length || 0}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">Premium 플랜</div>
            <div className="text-3xl font-bold text-yellow-400">
              {subscriptions?.filter((s) => s.plan === "premium").length || 0}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
