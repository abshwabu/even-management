import Opportunity from '../models/Opportunity.js';
import Applicant from '../models/Applicant.js';
import OpportunityCategory from '../models/OpportunityCategory.js';
import { Op, ValidationError, UniqueConstraintError } from 'sequelize';
import sequelize from '../config/database.js';

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

            // fire off all 5 stats queries in parallel
            const totalOpportunitiesP      = Opportunity.count();
            const activeOpportunitiesP     = Opportunity.count({
                where: { status: 'Active', deadline: { [Op.gt]: now } }
            });
            const byCategoryP              = Opportunity.findAll({
                attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['category']
            });
            const byStatusP                = Opportunity.findAll({
                attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['status']
            });
            const popularOpportunitiesP    = Opportunity.findAll({
                attributes: [
                    'id',
                    'title',
                    [sequelize.fn('COUNT', sequelize.col('applicants.id')), 'applicantCount']
                ],
                include: [{ model: Applicant, as: 'applicants', attributes: [] }],
                group: ['Opportunity.id'],
                order: [[sequelize.fn('COUNT', sequelize.col('applicants.id')), 'DESC']],
                limit: 5
            });

            const [
                totalOpportunities,
                activeOpportunities,
                opportunitiesByCategory,
                opportunitiesByStatus,
                popularOpportunities
            ] = await Promise.all([
                totalOpportunitiesP,
                activeOpportunitiesP,
                byCategoryP,
                byStatusP,
                popularOpportunitiesP
            ]);

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
        // pull out any string‐based image field
        const { image: imageFromBody, ...restBody } = req.body;

        // build payload
        const opportunityData = {
            ...restBody,
            authorId: req.user.id
        };
        // file upload wins—else fallback to string URL
        if (req.file) {
            opportunityData.image = `/uploads/opportunities/${req.file.filename}`;
        } else if (typeof imageFromBody === 'string' && imageFromBody.trim()) {
            opportunityData.image = imageFromBody.trim();
        }

        const opportunity = await Opportunity.create(opportunityData);
        return res.status(201).json(opportunity);
    } catch (error) {
        console.error('Error creating opportunity:', error);
        if (
            error instanceof ValidationError ||
            error instanceof UniqueConstraintError ||
            error.name === 'SequelizeValidationError'
        ) {
            const messages = (error.errors || []).map(e => e.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages.length ? messages : [error.message]
            });
        }
        return res.status(400).json({
            message: 'Error creating opportunity',
            error: error.message
        });
    }
};

// Update opportunity
export const updateOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findByPk(req.params.id);
        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found' });
        }
        if (opportunity.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to edit this opportunity' });
        }

        // pull out any image string, block authorId
        const { authorId: _ignore, image: imageFromBody, ...restFields } = req.body;
        const updateData = { ...restFields };
        if (req.file) {
            updateData.image = `/uploads/opportunities/${req.file.filename}`;
        } else if (typeof imageFromBody === 'string' && imageFromBody.trim()) {
            updateData.image = imageFromBody.trim();
        }

        await opportunity.update(updateData);
        return res.json(opportunity);
    } catch (error) {
        console.error('Error updating opportunity:', error);
        if (
            error instanceof ValidationError ||
            error instanceof UniqueConstraintError ||
            error.name === 'SequelizeValidationError'
        ) {
            const messages = (error.errors || []).map(e => e.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages.length ? messages : [error.message]
            });
        }
        return res.status(400).json({
            message: 'Error updating opportunity',
            error: error.message
        });
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

// Get opportunities by category name
export const getOpportunitiesByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const { status, includeStats } = req.query;
        const { limit, offset } = req.pagination || { limit: 10, offset: 0 };

        // Find the category by name
        const category = await OpportunityCategory.findOne({
            where: {
                name: {
                    [Op.iLike]: categoryName // Case-insensitive search
                }
            }
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Build filter conditions
        const where = { categoryId: category.id };
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
                },
                {
                    model: OpportunityCategory,
                    as: 'category',
                    attributes: ['id', 'name', 'description']
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

            // Get stats for this category
            const [
                totalOpportunities,
                activeOpportunities,
                byStatus,
                popularOpportunities
            ] = await Promise.all([
                Opportunity.count({ where: { categoryId: category.id } }),
                Opportunity.count({
                    where: {
                        categoryId: category.id,
                        status: 'open',
                        deadline: { [Op.gt]: now }
                    }
                }),
                Opportunity.findAll({
                    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                    where: { categoryId: category.id },
                    group: ['status']
                }),
                Opportunity.findAll({
                    attributes: [
                        'id',
                        'title',
                        [sequelize.fn('COUNT', sequelize.col('applicants.id')), 'applicantCount']
                    ],
                    where: { categoryId: category.id },
                    include: [{ model: Applicant, as: 'applicants', attributes: [] }],
                    group: ['Opportunity.id'],
                    order: [[sequelize.fn('COUNT', sequelize.col('applicants.id')), 'DESC']],
                    limit: 5
                })
            ]);

            response.stats = {
                totalOpportunities,
                activeOpportunities,
                byStatus,
                popularOpportunities
            };
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching opportunities by category:', error);
        res.status(500).json({
            message: 'Error fetching opportunities by category',
            error: error.message
        });
    }
}; 