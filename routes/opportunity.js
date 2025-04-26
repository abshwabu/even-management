import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
    getAllOpportunities,
    getOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
} from '../controllers/opportunityController.js';
import pagination from '../middleware/pagination.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Opportunity:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - deadline
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id
 *         title:
 *           type: string
 *           description: The opportunity title
 *         description:
 *           type: string
 *           description: Detailed description
 *         requirements:
 *           type: string
 *           description: Requirements for the opportunity
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: Application deadline
 *         image:
 *           type: string
 *           description: URL to the opportunity image
 *         status:
 *           type: string
 *           enum: [open, closed, draft]
 *           default: draft
 *           description: Current status
 *         type:
 *           type: string
 *           enum: [job, internship, volunteer, other]
 *           default: other
 *         location:
 *           type: string
 *         isRemote:
 *           type: boolean
 *           default: false
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
 *   name: Opportunities
 *   description: Opportunity management endpoints
 */

/**
 * @swagger
 * /api/opportunities:
 *   get:
 *     summary: Get all opportunities
 *     tags: [Opportunities]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed, draft]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [job, internship, volunteer, other]
 *         description: Filter by type
 *       - in: query
 *         name: isRemote
 *         schema:
 *           type: boolean
 *         description: Filter by remote status
 *     responses:
 *       200:
 *         description: List of opportunities
 */
router.get('/', pagination, getAllOpportunities);

/**
 * @swagger
 * /api/opportunities/{id}:
 *   get:
 *     summary: Get an opportunity by ID
 *     tags: [Opportunities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Opportunity details
 *       404:
 *         description: Opportunity not found
 */
router.get('/:id', getOpportunityById);

/**
 * @swagger
 * /api/opportunities:
 *   post:
 *     summary: Create a new opportunity
 *     tags: [Opportunities]
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
 *               - description
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [job, internship, volunteer, other]
 *               status:
 *                 type: string
 *                 enum: [open, closed, draft]
 *               location:
 *                 type: string
 *               isRemote:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Opportunity created successfully
 */

// 1) accept JSON or URL-encoded bodies
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// 2) only run multer on multipart/form-data
function optionalMulter(req, res, next) {
  const ct = req.headers['content-type'] || '';
  if (ct.startsWith('multipart/form-data')) {
    return upload.single('image')(req, res, next);
  }
  next();
}

router.post('/', auth, optionalMulter, createOpportunity);

/**
 * @swagger
 * /api/opportunities/{id}:
 *   put:
 *     summary: Update an opportunity
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: string
 *                 format: binary
 *               status:
 *                 type: string
 *                 enum: [open, closed, draft]
 *               type:
 *                 type: string
 *                 enum: [job, internship, volunteer, other]
 *               location:
 *                 type: string
 *               isRemote:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Opportunity updated successfully
 */
router.put('/:id', auth, optionalMulter, updateOpportunity);

/**
 * @swagger
 * /api/opportunities/{id}:
 *   delete:
 *     summary: Delete an opportunity
 *     tags: [Opportunities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Opportunity deleted successfully
 */
router.delete('/:id', auth, deleteOpportunity);

export default router; 