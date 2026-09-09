import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Question from '../models/Question';
import Quiz from '../models/Quiz';

const router = Router();


/**
 * POST /api/questions
 * Create a question for a quiz
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      quizId,
      questionText,
      options,
      correctOption,
      explanation,
    } = req.body;

    if (
      !quizId ||
      !questionText ||
      !options ||
      correctOption === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'quizId, questionText, options and correctOption are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quizId',
      });
    }

    // Check quiz exists
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found',
      });
    }

    // Validate correct option index
    if (
      correctOption < 0 ||
      correctOption >= options.length
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid correctOption index',
      });
    }

    const question = await Question.create({
      quizId,
      questionText,
      options,
      correctOption,
      explanation,
    });

    res.status(201).json({
      success: true,
      data: question,
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
 * GET /api/questions?quizId=...
 * Get questions of a quiz
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { quizId } = req.query;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'quizId is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(quizId as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quizId',
      });
    }

    const questions = await Question.find(
      { quizId },
      '-correctOption -explanation'
    );

    res.status(200).json({
      success: true,
      data: questions,
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
 * GET /api/questions/:id
 * Get single question
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID',
      });
    }

    const question = await Question.findById(
      id,
      '-correctOption -explanation'
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      data: question,
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