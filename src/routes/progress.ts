import { Router, Response } from 'express';
import Progress from '../models/Progress';

const router = Router();

// GET /api/user/progress 
router.get('/', async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.query.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized, user ID missing' });
    }

    let progress = await Progress.findOne({ userId }).lean();

    if (!progress) {
      const newProgress = await Progress.create({ userId, completedChapters: [], quizScores: [], streak: 0 });
      progress = newProgress.toObject();
    }

    const quizScores = progress.quizScores || [];
    const totalQuizzesAttempted = quizScores.length;
    let totalScoreSum = 0;

    quizScores.forEach((q: any) => {
      if (q.totalQuestions > 0) {
        totalScoreSum += (q.score / q.totalQuestions) * 100;
      }
    });

    const averagePercentage = totalQuizzesAttempted > 0 ? (totalScoreSum / totalQuizzesAttempted).toFixed(2) : 0;
    const completedChapters = progress.completedChapters || [];

    res.status(200).json({
      success: true,
      data: {
        streak: progress.streak || 0,
        completedChaptersCount: completedChapters.length,
        completedChapters: completedChapters,
        totalQuizzesAttempted,
        averagePercentage: `${averagePercentage}%`,
        quizScores: quizScores
      }
    });
  } catch (error: any) {
    console.error("Progress API Error:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message || error });
  }
});

export default router;