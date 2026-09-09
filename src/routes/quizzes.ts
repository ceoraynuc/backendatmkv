import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import Progress from '../models/Progress';

const router = Router();

/**
 * POST /api/quizzes
 * Create Quiz + Questions
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, subjectId, questions } = req.body;

    if (!title || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Title and subjectId are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subjectId',
      });
    }

    // Quiz create
    const quiz = await Quiz.create({
      title,
      subjectId,
    });

    // Questions create
    if (questions && questions.length > 0) {
      const questionsWithQuizId = questions.map((question: any) => ({
        ...question,
        quizId: quiz._id,
      }));

      await Question.insertMany(questionsWithQuizId);
    }

    // Created questions fetch
    const createdQuestions = await Question.find({
      quizId: quiz._id,
    });

    res.status(201).json({
      success: true,
      data: {
        ...quiz.toObject(),
        questions: createdQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error,
    });
  }
});


/**
 * GET /api/quizzes
 * Get all quizzes
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.query;

    const filter = subjectId
      ? { subjectId: subjectId }
      : {};

    const quizzes = await Quiz.find(filter).lean();

    const quizzesWithQuestions = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions = await Question.find(
          { quizId: quiz._id },
          '-correctOption -explanation'
        ).lean();

        return {
          ...quiz,
          questions,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: quizzesWithQuestions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error,
    });
  }
});

/**
 * GET /api/quizzes/:id
 * Get single quiz with questions
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    const quiz = await Quiz.findById(id).lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const questions = await Question.find(
      { quizId: quiz._id },
      '-correctOption -explanation'
    ).lean();

    res.status(200).json({
      success: true,
      data: {
        ...quiz,
        questions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error,
    });
  }
});


/**
 * POST /api/quizzes/:id/submit
 * Submit quiz and calculate score
 */
router.post('/:id/submit', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID',
      });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Answers are required',
      });
    }

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    const questions = await Question.find({
      quizId: quiz._id,
    });

    const totalQuestions = questions.length;
    let score = 0;

    const detailedResults = questions.map((question) => {
      const questionId = question._id.toString();

      const userAnswer = answers[questionId];

      const isCorrect =
        userAnswer !== undefined &&
        Number(userAnswer) === question.correctOption;

      if (isCorrect) {
        score++;
      }

      return {
        questionId,
        questionText: question.questionText,
        userAnswer:
          userAnswer !== undefined ? Number(userAnswer) : null,
        correctOption: question.correctOption,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const percentage =
      totalQuestions > 0
        ? (score / totalQuestions) * 100
        : 0;

        // --- User progress update--- //
    const userId = req.body.userId; 
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      await Progress.findOneAndUpdate(
        { userId },
        { 
          $push: { 
            quizScores: { 
              quizId: quiz._id, 
              score, 
              totalQuestions, 
              submittedAt: new Date() 
            } 
          },
          $set: { lastActiveDate: new Date() }
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        score,
        totalQuestions,
        percentage,
        passed: percentage >= 50,
        detailedResults,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error,
    });
  }
});

export default router;