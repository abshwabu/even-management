import Opportunity from '../models/Opportunity.js';

// Get all opportunities with pagination
export const getAllOpportunities = async (req, res) => {
    try {
        const { status, type, isRemote } = req.query;
        const { limit, offset } = req.pagination;
        const filters = {};

        if (status) filters.status = status;
        if (type) filters.type = type;
        if (isRemote) filters.isRemote = isRemote === 'true';

        const { count, rows: opportunities } = await Opportunity.findAndCountAll({
            where: filters,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        
        res.status(200).json({
            opportunities,
            pagination: {
                total: count,
                totalPages,
                currentPage,
                perPage: limit,
                hasMore: currentPage < totalPages
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching opportunities', error: error.message });
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