import express from 'express';
import {
    getAllOpportunityCategories,
    getOpportunityCategoryById,
    createOpportunityCategory,
    updateOpportunityCategory,
    deleteOpportunityCategory
} from '../controllers/opportunityCategoryController.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
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
 *   name: Opportunity Categories
 *   description: Opportunity category management API
 */

/**
 * @swagger
 * /api/opportunity-categories:
 *   get:
 *     tags: [Opportunity Categories]
 *     summary: Returns a list of all opportunity categories
 *     responses:
 *       200:
 *         description: List of opportunity categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OpportunityCategory'
 *       500:
 *         description: Server error
 */
router.get('/', getAllOpportunityCategories);

/**
 * @swagger
 * /api/opportunity-categories/{id}:
 *   get:
 *     tags: [Opportunity Categories]
 *     summary: Get an opportunity category by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Opportunity category ID
 *     responses:
 *       200:
 *         description: Opportunity category details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpportunityCategory'
 *       404:
 *         description: Opportunity category not found
 */
router.get('/:id', getOpportunityCategoryById);

/**
 * @swagger
 * /api/opportunity-categories:
 *   post:
 *     tags: [Opportunity Categories]
 *     summary: Create a new opportunity category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               description:
 *                 type: string
 *                 description: Category description
 *     responses:
 *       201:
 *         description: Opportunity category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpportunityCategory'
 *       400:
 *         description: Invalid input
 */
router.post('/', createOpportunityCategory);

/**
 * @swagger
 * /api/opportunity-categories/{id}:
 *   put:
 *     tags: [Opportunity Categories]
 *     summary: Update an opportunity category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Opportunity category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               description:
 *                 type: string
 *                 description: Category description
 *     responses:
 *       200:
 *         description: Opportunity category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OpportunityCategory'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Opportunity category not found
 */
router.put('/:id', updateOpportunityCategory);

/**
 * @swagger
 * /api/opportunity-categories/{id}:
 *   delete:
 *     tags: [Opportunity Categories]
 *     summary: Delete an opportunity category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Opportunity category ID
 *     responses:
 *       200:
 *         description: Opportunity category deleted successfully
 *       404:
 *         description: Opportunity category not found
 */
router.delete('/:id', deleteOpportunityCategory);

export default router;