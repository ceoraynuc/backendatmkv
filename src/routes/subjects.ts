import { Router, Request, Response } from 'express';
import Subject from '../models/Subject';

const router = Router();

// 1. GET /api/subjects 
router.get('/', async (req: Request, res: Response) => {
  try {
    const subjects = await Subject.find({}, 'name description code');
    res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});


router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, code, chapters } = req.body;

    const subject = await Subject.create({
      name,
      description,
      code,
      chapters: chapters || [],
    });

    res.status(201).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error,
    });
  }
});

// 2. GET /api/subjects/:id/chapters
router.get('/:id/chapters', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id, 'name chapters');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json({ success: true, data: subject.chapters });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

export default router;