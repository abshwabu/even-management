import News from '../models/News.js';

// Get all news with pagination
export const getAllNews = async (req, res) => {
    try {
        const { status, category } = req.query;
        const { limit, offset } = req.pagination;
        const filters = {};

        if (status) filters.status = status;
        if (category) filters.category = category;

        const { count, rows: news } = await News.findAndCountAll({
            where: filters,
            order: [['publishedAt', 'DESC']],
            limit,
            offset
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const currentPage = Math.floor(offset / limit) + 1;
        
        res.status(200).json({
            news,
            pagination: {
                total: count,
                totalPages,
                currentPage,
                perPage: limit,
                hasMore: currentPage < totalPages
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching news', error: error.message });
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