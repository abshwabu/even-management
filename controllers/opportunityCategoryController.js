import OpportunityCategory from '../models/OpportunityCategory.js';
import { ValidationError, UniqueConstraintError } from 'sequelize';

// Get all opportunity categories
export const getAllOpportunityCategories = async (req, res) => {
    try {
        const categories = await OpportunityCategory.findAll({
            order: [['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching opportunity categories:', error);
        res.status(500).json({
            message: 'Error fetching opportunity categories',
            error: error.message
        });
    }
};

// Get single opportunity category
export const getOpportunityCategoryById = async (req, res) => {
    try {
        const category = await OpportunityCategory.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Opportunity category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching opportunity category', error: error.message });
    }
};

// Create opportunity category
export const createOpportunityCategory = async (req, res) => {
    try {
        const category = await OpportunityCategory.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating opportunity category:', error);
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
            message: 'Error creating opportunity category',
            error: error.message
        });
    }
};

// Update opportunity category
export const updateOpportunityCategory = async (req, res) => {
    try {
        const category = await OpportunityCategory.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Opportunity category not found' });
        }

        await category.update(req.body);
        res.json(category);
    } catch (error) {
        console.error('Error updating opportunity category:', error);
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
            message: 'Error updating opportunity category',
            error: error.message
        });
    }
};

// Delete opportunity category
export const deleteOpportunityCategory = async (req, res) => {
    try {
        const category = await OpportunityCategory.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Opportunity category not found' });
        }

        await category.destroy();
        res.json({ message: 'Opportunity category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting opportunity category', error: error.message });
    }
}; 