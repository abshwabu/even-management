import Applicant from '../models/Applicant.js';
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

// Get all applicants for an opportunity
export const getOpportunityApplicants = async (req, res) => {
    try {
        const { opportunityId } = req.params;
        const { limit, offset } = req.pagination;
        
        // Check if opportunity exists
        const opportunity = await Opportunity.findByPk(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }
        
        // Check if user is authorized (opportunity author or admin)
        if (opportunity.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view applicants for this opportunity' });
        }
        
        const { count, rows: applicants } = await Applicant.findAndCountAll({
            where: { opportunityId },
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'role']
                }
            ]
        });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        
        res.status(200).json({
            applicants,
            pagination: {
                total: count,
                totalPages,
                currentPage,
                perPage: limit,
                hasMore: currentPage < totalPages
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applicants', error: error.message });
    }
};

// Get applicant by ID
export const getApplicantById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const applicant = await Applicant.findByPk(id, {
            include: [
                {
                    model: Opportunity,
                    as: 'opportunity',
                    attributes: ['id', 'title', 'authorId']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'role']
                }
            ]
        });
        
        if (!applicant) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
        
        // Check if user is authorized (opportunity author, applicant, or admin)
        if (applicant.opportunity.authorId !== req.user.id && 
            applicant.userId !== req.user.id && 
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this application' });
        }
        
        res.status(200).json(applicant);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applicant', error: error.message });
    }
};

// Apply for an opportunity
export const applyForOpportunity = async (req, res) => {
    try {
        const { opportunityId } = req.params;
        
        // Check if opportunity exists
        const opportunity = await Opportunity.findByPk(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }
        
        // Check if opportunity is open
        if (opportunity.status !== 'open') {
            return res.status(400).json({ message: 'This opportunity is not open for applications' });
        }
        
        // Validate required fields
        const { name, email, phone } = req.body;
        const validationErrors = [];
        
        if (!name || name.trim() === '') {
            validationErrors.push('Name is required');
        }
        
        if (!email || email.trim() === '') {
            validationErrors.push('Email is required');
        } else {
            // Simple email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                validationErrors.push('Invalid email format');
            }
        }
        
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: validationErrors 
            });
        }
        
        // Check if the email has already been used to apply for this opportunity
        const existingApplication = await Applicant.findOne({
            where: {
                opportunityId,
                email
            }
        });
        
        if (existingApplication) {
            return res.status(400).json({ message: 'An application with this email already exists for this opportunity' });
        }
        
        const applicationData = {
            ...req.body,
            opportunityId,
            userId: req.user ? req.user.id : null,
            resume: req.file ? `/uploads/resumes/${req.file.filename}` : null
        };
        
        const applicant = await Applicant.create(applicationData);
        res.status(201).json(applicant);
    } catch (error) {
        res.status(400).json({ message: 'Error applying for opportunity', error: error.message });
    }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const applicant = await Applicant.findByPk(id, {
            include: [
                {
                    model: Opportunity,
                    as: 'opportunity',
                    attributes: ['id', 'title', 'authorId']
                }
            ]
        });
        
        if (!applicant) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        // Check if user is authorized (opportunity author or admin)
        if (applicant.opportunity.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this application' });
        }
        
        // Validate status
        const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        
        await applicant.update({ status });
        res.status(200).json(applicant);
    } catch (error) {
        res.status(400).json({ message: 'Error updating application', error: error.message });
    }
};

// Delete application
export const deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        
        const applicant = await Applicant.findByPk(id, {
            include: [
                {
                    model: Opportunity,
                    as: 'opportunity',
                    attributes: ['id', 'authorId']
                }
            ]
        });
        
        if (!applicant) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        // Check if user is authorized (opportunity author, applicant, or admin)
        if (applicant.opportunity.authorId !== req.user.id && 
            applicant.userId !== req.user.id && 
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this application' });
        }
        
        await applicant.destroy();
        res.status(200).json({ message: 'Application deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting application', error: error.message });
    }
};

// Get all applicants with optional stats
export const getAllApplicants = async (req, res) => {
    try {
        const { status, category, includeStats } = req.query;
        const { limit, offset } = req.pagination || { limit: 10, offset: 0 };
        
        // Build filter conditions
        const where = {};
        if (status) {
            where.status = status;
        }
        
        // Add category filter if provided (this requires joining with Opportunity)
        const include = [{
            model: Opportunity,
            as: 'opportunity',
            attributes: ['id', 'title', 'category', 'deadline']
        }];
        
        if (category) {
            include[0].where = { category };
        }
        
        // Get applicants with pagination
        const { count, rows: applicants } = await Applicant.findAndCountAll({
            where,
            order: [['applicationDate', 'DESC']],
            limit,
            offset,
            include
        });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        
        // Prepare response
        let response = {
            applicants,
            pagination: {
                total: count,
                totalPages,
                currentPage,
                perPage: limit,
                hasMore: currentPage < totalPages
            }
        };
        
        // Include stats if requested
        if (includeStats === 'true') {
            // Get total applicants count
            const totalApplicants = await Applicant.count();
            
            // Get applicants by status
            const applicantsByStatus = await Applicant.findAll({
                attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['status']
            });
            
            // Get applicants by category (requires joining with Opportunity)
            const applicantsByCategory = await Applicant.findAll({
                attributes: [
                    [sequelize.col('opportunity.category'), 'category'],
                    [sequelize.fn('COUNT', sequelize.col('Applicant.id')), 'count']
                ],
                include: [{
                    model: Opportunity,
                    as: 'opportunity',
                    attributes: []
                }],
                group: [sequelize.col('opportunity.category')]
            });
            
            // Get recent applicants (last 7 days)
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            
            const recentApplicantsCount = await Applicant.count({
                where: {
                    applicationDate: {
                        [Op.gte]: lastWeek
                    }
                }
            });
            
            // Add stats to response
            response.stats = {
                totalApplicants,
                byStatus: applicantsByStatus,
                byCategory: applicantsByCategory,
                recentApplicantsCount
            };
        }
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({
            message: 'Error fetching applicants',
            error: error.message
        });
    }
}; 