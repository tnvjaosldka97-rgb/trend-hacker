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
import { Badge } from "@/components/ui/badge";
import { Shield, Search, UserCog, UserX } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: users, isLoading, refetch } = trpc.admin.listAllUsers.useQuery();
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("사용자 권한이 업데이트되었습니다");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "업데이트에 실패했습니다");
    },
  });

  const filteredUsers = users?.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleRole = (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    updateRoleMutation.mutate({ userId, role: newRole as "user" | "admin" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">슈퍼어드민</h1>
                <p className="text-slate-400 text-sm">사용자 권한 관리</p>
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

        {/* Users Table */}
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
                  <TableHead className="text-slate-300">ID</TableHead>
                  <TableHead className="text-slate-300">이름</TableHead>
                  <TableHead className="text-slate-300">이메일</TableHead>
                  <TableHead className="text-slate-300">로그인 방법</TableHead>
                  <TableHead className="text-slate-300">권한</TableHead>
                  <TableHead className="text-slate-300">구독 플랜</TableHead>
                  <TableHead className="text-slate-300">구독 상태</TableHead>
                  <TableHead className="text-slate-300">만료일</TableHead>
                  <TableHead className="text-slate-300">마지막 로그인</TableHead>
                  <TableHead className="text-slate-300">가입일</TableHead>
                  <TableHead className="text-slate-300 text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/30">
                    <TableCell className="font-medium text-white">
                      {user.id}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.name || "이름 없음"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.email || "이메일 없음"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.loginMethod || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.role === "admin"
                            ? "bg-red-500/20 text-red-300 border-red-500/50"
                            : "bg-slate-500/20 text-slate-300 border-slate-500/50"
                        }
                      >
                        {user.role === "admin" ? "관리자" : "일반 사용자"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.subscriptionPlan ? (
                        <Badge
                          className={
                            user.subscriptionPlan === "premium"
                              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
                              : user.subscriptionPlan === "pro"
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                              : "bg-slate-500/20 text-slate-300 border-slate-500/50"
                          }
                        >
                          {user.subscriptionPlan === "premium"
                            ? "Premium"
                            : user.subscriptionPlan === "pro"
                            ? "Pro"
                            : "Free"}
                        </Badge>
                      ) : (
                        <span className="text-slate-500">구독 없음</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.subscriptionStatus ? (
                        <Badge
                          className={
                            user.subscriptionStatus === "active"
                              ? "bg-green-500/20 text-green-300 border-green-500/50"
                              : user.subscriptionStatus === "cancelled"
                              ? "bg-orange-500/20 text-orange-300 border-orange-500/50"
                              : "bg-red-500/20 text-red-300 border-red-500/50"
                          }
                        >
                          {user.subscriptionStatus === "active"
                            ? "활성"
                            : user.subscriptionStatus === "cancelled"
                            ? "취소됨"
                            : "만료됨"}
                        </Badge>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.subscriptionExpiresAt
                        ? new Date(user.subscriptionExpiresAt).toLocaleDateString("ko-KR")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.lastSignedIn
                        ? new Date(user.lastSignedIn).toLocaleString("ko-KR")
                        : "로그인 기록 없음"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={user.role === "admin" ? "destructive" : "default"}
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className={
                          user.role === "admin"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-cyan-600 hover:bg-cyan-700"
                        }
                      >
                        {user.role === "admin" ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            권한 회수
                          </>
                        ) : (
                          <>
                            <UserCog className="w-4 h-4 mr-1" />
                            관리자 지정
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">전체 사용자</div>
            <div className="text-3xl font-bold text-white">
              {users?.length || 0}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">관리자</div>
            <div className="text-3xl font-bold text-red-400">
              {users?.filter((u) => u.role === "admin").length || 0}
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
            <div className="text-slate-400 text-sm mb-2">일반 사용자</div>
            <div className="text-3xl font-bold text-slate-300">
              {users?.filter((u) => u.role === "user").length || 0}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
