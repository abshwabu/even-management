import express from 'express';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
} from '../controllers/newsController.js';
import pagination from '../middleware/pagination.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id
 *         title:
 *           type: string
 *           description: News title
 *         content:
 *           type: string
 *           description: News content
 *         image:
 *           type: string
 *           description: URL to the news image
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: draft
 *         category:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: News
 *   description: News management API
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     tags: [News]
 *     summary: Returns a list of news articles
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/News'
 *       500:
 *         description: Server error
 */
router.get('/', pagination, getAllNews);

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: Get a news item by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News ID
 *     responses:
 *       200:
 *         description: News details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       404:
 *         description: News not found
 */
router.get('/:id', getNewsById);

// Protected routes
router.use(auth);

/**
 * @swagger
 * /api/news:
 *   post:
 *     tags: [News]
 *     summary: Create a new news article
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: News article created successfully
 *       401:
 *         description: Authentication required
 *       400:
 *         description: Invalid input
 */
router.post('/', upload.single('image'), createNews);

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     summary: Update a news article
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: News article updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 */
router.put('/:id', upload.single('image'), updateNews);

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     summary: Delete a news article
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: News article ID
 *     responses:
 *       200:
 *         description: News article deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to delete this news article
 *       404:
 *         description: News article not found
 */
router.delete('/:id', deleteNews);

export default router; 