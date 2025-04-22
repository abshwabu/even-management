import News from '../models/News.js';
import { Op } from 'sequelize';

// Get all news with optional stats
export const getAllNews = async (req, res) => {
    try {
        const { category, includeStats } = req.query;
        const { limit, offset } = req.pagination || { limit: 10, offset: 0 };
        
        // Build filter conditions
        const where = {};
        if (category) {
            where.category = category;
        }
        
        // Get news with pagination
        const { count, rows: news } = await News.findAndCountAll({
            where,
            order: [['date', 'DESC']],
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
            // Get total news count
            const totalNews = await News.count();
            
            // Get news by category
            const newsByCategory = await News.findAll({
                attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                group: ['category']
            });
            
            // Get news by month (for the last 6 months)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            const newsByMonth = await News.findAll({
                attributes: [
                    [sequelize.fn('date_trunc', 'month', sequelize.col('date')), 'month'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: {
                    date: {
                        [Op.gte]: sixMonthsAgo
                    }
                },
                group: [sequelize.fn('date_trunc', 'month', sequelize.col('date'))],
                order: [[sequelize.fn('date_trunc', 'month', sequelize.col('date')), 'ASC']]
            });
            
            // Get recent news (last 7 days)
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            
            const recentNewsCount = await News.count({
                where: {
                    date: {
                        [Op.gte]: lastWeek
                    }
                }
            });
            
            // Add stats to response
            response.stats = {
                totalNews,
                byCategory: newsByCategory,
                byMonth: newsByMonth,
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
        const news = await News.findByPk(req.params.id);
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
        const newsData = {
            ...req.body,
            authorId: req.user.id,
            image: req.file ? `/uploads/news/${req.file.filename}` : null
        };
        
        const news = await News.create(newsData);
        res.status(201).json(news);
    } catch (error) {
        res.status(400).json({ message: 'Error creating news', error: error.message });
    }
};

// Update news
export const updateNews = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);
        if (!news) {
            return res.status(404).json({ message: 'News not found' });
        }

        // Check if user is the author or has admin role
        if (news.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to edit this news article' });
        }

        // Prevent changing the author
        const { authorId, ...updateData } = req.body;
        if (req.file) {
            updateData.image = `/uploads/news/${req.file.filename}`;
        }
        
        await news.update(updateData);
        res.json(news);
    } catch (error) {
        res.status(400).json({ message: 'Error updating news', error: error.message });
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