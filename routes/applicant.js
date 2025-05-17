import express from 'express';
import { auth, restrictTo, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
    getOpportunityApplicants,
    getApplicantById,
    updateApplicationStatus,
    deleteApplication
} from '../controllers/applicantController.js';
import pagination from '../middleware/pagination.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Applicants
 *   description: Opportunity application management endpoints
 */

/**
 * @swagger
 * /api/opportunities/{opportunityId}/applicants:
 *   get:
 *     summary: Get all applicants for an opportunity
 *     tags: [Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: opportunityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Opportunity ID
 *     responses:
 *       200:
 *         description: List of applicants
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Opportunity not found
 *       500:
 *         description: Server error
 */
router.get('/opportunities/:opportunityId/applicants', auth, pagination, getOpportunityApplicants);

/**
 * @swagger
 * /api/applicants/{id}:
 *   get:
 *     summary: Get an applicant by ID
 *     tags: [Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Applicant ID
 *     responses:
 *       200:
 *         description: Applicant details
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Applicant not found
 *       500:
 *         description: Server error
 */
router.get('/applicants/:id', auth, getApplicantById);

/**
 * @swagger
 * /api/applicants/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Applicant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, shortlisted, rejected, hired]
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *       400:
 *         description: Invalid status
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Application not found
 */
router.patch('/applicants/:id/status', auth, updateApplicationStatus);

/**
 * @swagger
 * /api/applicants/{id}:
 *   delete:
 *     summary: Delete an application
 *     tags: [Applicants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Applicant ID
 *     responses:
 *       200:
 *         description: Application deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Application not found
 */
router.delete('/applicants/:id', auth, deleteApplication);

export default router; 