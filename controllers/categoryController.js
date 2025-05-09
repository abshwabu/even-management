import Category from '../models/Category.js';
import { ValidationError, UniqueConstraintError } from 'sequelize';

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// Get single category
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category', error: error.message });
    }
};

// Create category
export const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
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
            message: 'Error creating category',
            error: error.message
        });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.update(req.body);
        res.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
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
            message: 'Error updating category',
            error: error.message
        });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await category.destroy();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
}; 