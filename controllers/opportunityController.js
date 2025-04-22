import Opportunity from '../models/Opportunity.js';
import Applicant from '../models/Applicant.js';
import { Op } from 'sequelize';

// Get all opportunities with optional stats
export const getAllOpportunities = async (req, res) => {
    try {
        const { category, status, includeStats } = req.query;
        const { limit, offset } = req.pagination || { limit: 10, offset: 0 };
        
        // Build filter conditions
        const where = {};
        if (category) {
            where.category = category;
        }
        if (status) {
            where.status = status;
        }
        
        // Get opportunities with pagination
        const { count, rows: opportunities } = await Opportunity.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            include: [
                {
                    model: Applicant,
                    as: 'applicants',
                    attributes: ['id']
                }
            ]
        });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        
        // Prepare response
        let response = {
            opportunities,
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
            const now = new Date();
            
            // Get total opportunities count
            const totalOpportunities = await Opportunity.count();
            
            // Get active opportunities (status = Active and deadline > now)
            const activeOpportunities = await Opportunity.count({
                where: {
                    status: 'Active',
                    deadline: {
                        [Op.gt]: now
                    }
                }
            });
            
            // Get opportunities by category
            const opportunitiesByCategory = await Opportunity.findAll({
                attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['category']
            });
            
            // Get opportunities by status
            const opportunitiesByStatus = await Opportunity.findAll({
                attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['status']
            });
            
            // Get opportunities with most applicants (top 5)
            const popularOpportunities = await Opportunity.findAll({
                attributes: [
                    'id',
                    'title',
                    [sequelize.fn('COUNT', sequelize.col('applicants.id')), 'applicantCount']
                ],
                include: [
                    {
                        model: Applicant,
                        as: 'applicants',
                        attributes: []
                    }
                ],
                group: ['Opportunity.id'],
                order: [[sequelize.fn('COUNT', sequelize.col('applicants.id')), 'DESC']],
                limit: 5
            });
            
            // Add stats to response
            response.stats = {
                totalOpportunities,
                activeOpportunities,
                byCategory: opportunitiesByCategory,
                byStatus: opportunitiesByStatus,
                popularOpportunities
            };
        }
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        res.status(500).json({
            message: 'Error fetching opportunities',
            error: error.message
        });
    }
};

// Get single opportunity
export const getOpportunityById = async (req, res) => {
    try {
        const opportunity = await Opportunity.findByPk(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }
        res.json(opportunity);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching opportunity', error: error.message });
    }
};

// Create opportunity
export const createOpportunity = async (req, res) => {
    try {
        const opportunityData = {
            ...req.body,
            authorId: req.user.id,
            image: req.file ? `/uploads/opportunities/${req.file.filename}` : null
        };
        
        const opportunity = await Opportunity.create(opportunityData);
        res.status(201).json(opportunity);
    } catch (error) {
        res.status(400).json({ message: 'Error creating opportunity', error: error.message });
    }
};

// Update opportunity
export const updateOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findByPk(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        // Check if user is the author or has admin role
        if (opportunity.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to edit this opportunity' });
        }

        // Prevent changing the author
        const { authorId, ...updateData } = req.body;
        
        // Handle image update if a new file is uploaded
        if (req.file) {
            updateData.image = `/uploads/opportunities/${req.file.filename}`;
        }
        
        await opportunity.update(updateData);
        res.json(opportunity);
    } catch (error) {
        res.status(400).json({ message: 'Error updating opportunity', error: error.message });
    }
};

// Delete opportunity
export const deleteOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findByPk(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }

        // Check if user is the author or has admin role
        if (opportunity.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this opportunity' });
        }

        await opportunity.destroy();
        res.json({ message: 'Opportunity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting opportunity', error: error.message });
    }
}; 