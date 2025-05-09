import News from '../models/News.js';
import Category from '../models/Category.js';
import { ValidationError, UniqueConstraintError } from 'sequelize';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// Get all news with optional stats
export const getAllNews = async (req, res) => {
    try {
        const { categoryId, includeStats } = req.query;
        const { limit, offset } = req.pagination || { limit: 10, offset: 0 };
        
        // Build filter conditions
        const where = {};
        if (categoryId) {
            where.categoryId = categoryId;
        }
        
        // Get news with pagination
        const { count, rows: news } = await News.findAndCountAll({
            where,
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'description']
            }],
            order: [['publishedAt', 'DESC']],
            limit,
            offset
        });
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        
        // Prepare response
        let response = {
            news,
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
            // pre-calc date boundaries
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);

            // launch all four queries in parallel
            const totalNewsPromise = News.count();

            const newsByCategoryPromise = News.findAll({
                attributes: ['categoryId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['name']
                }],
                group: ['categoryId', 'category.id', 'category.name']
            });

            const newsByMonthPromise = News.findAll({
                attributes: [
                    [sequelize.fn('date_trunc', 'month', sequelize.col('publishedAt')), 'month'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: { publishedAt: { [Op.gte]: sixMonthsAgo } },
                group: [sequelize.fn('date_trunc', 'month', sequelize.col('publishedAt'))],
                order: [[sequelize.fn('date_trunc', 'month', sequelize.col('publishedAt')), 'ASC']]
            });

            const recentNewsCountPromise = News.count({
                where: { publishedAt: { [Op.gte]: lastWeek } }
            });

            // wait for all of them
            const [
                totalNews,
                byCategory,
                byMonth,
                recentNewsCount
            ] = await Promise.all([
                totalNewsPromise,
                newsByCategoryPromise,
                newsByMonthPromise,
                recentNewsCountPromise
            ]);

            response.stats = {
                totalNews,
                byCategory,
                byMonth,
                recentNewsCount
            };
        }
        
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            message: 'Error fetching news',
            error: error.message
        });
    }
};

// Get single news
export const getNewsById = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'description']
            }]
        });
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching news', error: error.message });
    }
};

// Create news
export const createNews = async (req, res) => {
    try {
        // 1) pull out image & tags (form-data fields are always strings)
        const { image: imageFromBody, tags: tagsRaw, ...restBody } = req.body;

        // 2) parse tags into an array if needed
        let tags;
        if (tagsRaw != null) {
            if (Array.isArray(tagsRaw)) {
                tags = tagsRaw;
            } else if (typeof tagsRaw === 'string' && tagsRaw.trim()) {
                try {
                    tags = JSON.parse(tagsRaw);
                } catch {
                    tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
                }
            }
        }

        // 3) build up the create payload
        const newsData = {
            ...restBody,
            authorId: req.user.id,
            ...(tags && { tags })
        };

        // 4) override image if a file was uploaded
        if (req.file) {
            newsData.image = `/uploads/news/${req.file.filename}`;
        } else if (typeof imageFromBody === 'string' && imageFromBody.trim()) {
            newsData.image = imageFromBody.trim();
        }

        const news = await News.create(newsData);
        
        // Fetch the created news with category data
        const newsWithCategory = await News.findByPk(news.id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'description']
            }]
        });
        
        return res.status(201).json(newsWithCategory);
    } catch (error) {
        console.error('Error creating news:', error);
        // catch any Sequelize validation or unique‐constraint error
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
        // fallback
        return res.status(400).json({
            message: 'Error creating news',
            error: error.message
        });
    }
};

// Update news
export const updateNews = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }
        if (news.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to edit this news article' });
        }

        // pull out image, tags, and block changing authorId
        const {
            authorId: _ignore,
            image: imageFromBody,
            tags: tagsRaw,
            ...restFields
        } = req.body;

        // parse tags again
        let tags;
        if (tagsRaw != null) {
            if (Array.isArray(tagsRaw)) {
                tags = tagsRaw;
            } else if (typeof tagsRaw === 'string' && tagsRaw.trim()) {
                try {
                    tags = JSON.parse(tagsRaw);
                } catch {
                    tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
                }
            }
        }

        const updateData = {
            ...restFields,
            ...(tags && { tags })
        };

        if (req.file) {
            updateData.image = `/uploads/news/${req.file.filename}`;
        } else if (typeof imageFromBody === 'string' && imageFromBody.trim()) {
            updateData.image = imageFromBody.trim();
        }

        await news.update(updateData);
        
        // Fetch the updated news with category data
        const updatedNews = await News.findByPk(news.id, {
            include: [{
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'description']
            }]
        });
        
        return res.json(updatedNews);
    } catch (error) {
        console.error('Error updating news:', error);
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
            message: 'Error updating news',
            error: error.message
        });
    }
};

// Delete news
export const deleteNews = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        // Check if user is the author or has admin role
        if (news.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this news article' });
        }

        await news.destroy();
        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting news', error: error.message });
    }
}; 