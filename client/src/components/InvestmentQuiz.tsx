import { useState, useEffect } from 'react';
import { Quiz, getRandomQuizzes } from '@/data/quizzes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function InvestmentQuiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<Record<number, 'A' | 'B'>>({});
  const [showResult, setShowResult] = useState(false);

  // 컴포넌트 마운트 시 퀴즈 로드
  useEffect(() => {
    const randomQuizzes = getRandomQuizzes(3);
    setQuizzes(randomQuizzes);
    
    // 로컬 스토리지에서 이전 투표 불러오기
    const savedVotes = localStorage.getItem('quiz_votes');
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    }
  }, []);

  // 10초마다 다음 퀴즈로 전환
  useEffect(() => {
    if (quizzes.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quizzes.length);
      setShowResult(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [quizzes.length]);

  const handleVote = (quizId: number, choice: 'A' | 'B') => {
    const newVotes = { ...votes, [quizId]: choice };
    setVotes(newVotes);
    localStorage.setItem('quiz_votes', JSON.stringify(newVotes));
    setShowResult(true);
  };

  if (quizzes.length === 0) {
    return null;
  }

  const currentQuiz = quizzes[currentIndex];
  const userVote = votes[currentQuiz.id];

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-purple-300">
            💭 투자 퀴즈 {currentIndex + 1}/3
          </h3>
          <div className="text-sm text-gray-400">
            {quizzes.map((_, i) => (
              <span
                key={i}
                className={`inline-block w-2 h-2 rounded-full mx-1 ${
                  i === currentIndex ? 'bg-purple-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-xl font-medium text-white">
          {currentQuiz.question}
        </p>

        {!showResult ? (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleVote(currentQuiz.id, 'A')}
              className="h-20 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              {currentQuiz.optionA}
            </Button>
            <Button
              onClick={() => handleVote(currentQuiz.id, 'B')}
              className="h-20 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
            >
              <TrendingDown className="mr-2 h-5 w-5" />
              {currentQuiz.optionB}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-center text-green-400 font-medium">
              ✅ 투표 완료! 당신의 선택: {userVote === 'A' ? currentQuiz.optionA : currentQuiz.optionB}
            </p>
            <div className="text-sm text-gray-400 text-center">
              다음 퀴즈까지 10초...
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          데이터 수집 중 투자 인사이트를 얻어보세요!
        </div>
      </div>
    </Card>
  );
}
