import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
    getAllOpportunities,
    getOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    getOpportunitiesByCategory
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
 *         - categoryId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id
 *         title:
 *           type: string
 *           description: Opportunity title
 *         description:
 *           type: string
 *           description: Opportunity description
 *         requirements:
 *           type: string
 *           description: Required qualifications and skills
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
 *         categoryId:
 *           type: integer
 *           description: Reference to the opportunity category
 *         category:
 *           $ref: '#/components/schemas/OpportunityCategory'
 *         location:
 *           type: string
 *           description: Location of the opportunity
 *         isRemote:
 *           type: boolean
 *           default: false
 *           description: Whether the opportunity is remote
 *         authorId:
 *           type: integer
 *           description: Reference to the author user
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     OpportunityCategory:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id
 *         name:
 *           type: string
 *           description: Category name
 *         description:
 *           type: string
 *           description: Category description
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
 *   description: Opportunity management API
 */

/**
 * @swagger
 * /api/opportunities:
 *   get:
 *     tags: [Opportunities]
 *     summary: Returns a list of opportunities
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed, draft]
 *         description: Filter by status
 *       - in: query
 *         name: includeStats
 *         schema:
 *           type: boolean
 *         description: Include statistics in the response
 *     responses:
 *       200:
 *         description: List of opportunities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 opportunities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Opportunity'
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
 *                     totalOpportunities:
 *                       type: integer
 *                     activeOpportunities:
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
 *                           category:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                     byStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     popularOpportunities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           applicantCount:
 *                             type: integer
 *                           category:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *       500:
 *         description: Server error
 */
router.get('/', pagination, getAllOpportunities);

/**
 * @swagger
 * /api/opportunities/{id}:
 *   get:
 *     tags: [Opportunities]
 *     summary: Get an opportunity by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Opportunity ID
 *     responses:
 *       200:
 *         description: Opportunity details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opportunity'
 *       404:
 *         description: Opportunity not found
 */
router.get('/:id', getOpportunityById);

/**
 * @swagger
 * /api/opportunities/category/{categoryName}:
 *   get:
 *     tags: [Opportunities]
 *     summary: Get opportunities by category name
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the opportunity category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed, draft]
 *         description: Filter by status
 *       - in: query
 *         name: includeStats
 *         schema:
 *           type: boolean
 *         description: Include statistics in the response
 *     responses:
 *       200:
 *         description: List of opportunities in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 opportunities:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Opportunity'
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
 *                     totalOpportunities:
 *                       type: integer
 *                     activeOpportunities:
 *                       type: integer
 *                     byStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     popularOpportunities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           applicantCount:
 *                             type: integer
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get('/category/:categoryName', pagination, getOpportunitiesByCategory);

// Protected routes
router.use(auth);

/**
 * @swagger
 * /api/opportunities:
 *   post:
 *     tags: [Opportunities]
 *     summary: Create a new opportunity
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
 *               - categoryId
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
 *               categoryId:
 *                 type: integer
 *               location:
 *                 type: string
 *               isRemote:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Opportunity created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opportunity'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication required
 */
router.post('/', upload.single('image'), createOpportunity);

/**
 * @swagger
 * /api/opportunities/{id}:
 *   put:
 *     tags: [Opportunities]
 *     summary: Update an opportunity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Opportunity ID
 *     requestBody:
 *       required: true
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
 *               categoryId:
 *                 type: integer
 *               location:
 *                 type: string
 *               isRemote:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Opportunity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Opportunity'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to edit this opportunity
 *       404:
 *         description: Opportunity not found
 */
router.put('/:id', upload.single('image'), updateOpportunity);

/**
 * @swagger
 * /api/opportunities/{id}:
 *   delete:
 *     tags: [Opportunities]
 *     summary: Delete an opportunity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Opportunity ID
 *     responses:
 *       200:
 *         description: Opportunity deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to delete this opportunity
 *       404:
 *         description: Opportunity not found
 */
router.delete('/:id', deleteOpportunity);

export default router; 