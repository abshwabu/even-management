import Applicant from '../models/Applicant.js';
import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';

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
        
        // Check if user has already applied
        if (req.user) {
            const existingApplication = await Applicant.findOne({
                where: {
                    opportunityId,
                    userId: req.user.id
                }
            });
            
            if (existingApplication) {
                return res.status(400).json({ message: 'You have already applied for this opportunity' });
            }
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