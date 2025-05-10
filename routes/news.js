import express from 'express';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    getNewsByCategory
} from '../controllers/newsController.js';
import pagination from '../middleware/pagination.js';
import multer from 'multer';

const router = express.Router();

// 1) make sure JSON bodies get parsed
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// 2) only run multer if it's a multipart request
function optionalMulter(req, res, next) {
  const ct = req.headers['content-type'] || '';
  if (ct.startsWith('multipart/form-data')) {
    return upload.single('image')(req, res, next);
  }
  next();
}

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
 *         categoryId:
 *           type: integer
 *           description: Reference to the category
 *         category:
 *           $ref: '#/components/schemas/Category'
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
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: includeStats
 *         schema:
 *           type: boolean
 *         description: Include statistics in the response
 *     responses:
 *       200:
 *         description: List of news articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 news:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalNews:
 *                       type: integer
 *                     byCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           categoryId:
 *                             type: integer
 *                           count:
 *                             type: integer
 *                           Category:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                     byMonth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     recentNewsCount:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/', pagination, getAllNews);

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     tags: [News]
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

/**
 * @swagger
 * /api/news/category/{categoryName}:
 *   get:
 *     tags: [News]
 *     summary: Get news articles by category name
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of news articles in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 news:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/category/:categoryName', pagination, getNewsByCategory);

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
 *               categoryId:
 *                 type: integer
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: News article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       401:
 *         description: Authentication required
 *       400:
 *         description: Invalid input
 */
router.post('/', optionalMulter, createNews);

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
 *               categoryId:
 *                 type: integer
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: News article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
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