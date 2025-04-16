/**
 * Pagination middleware
 * Extracts pagination parameters from request query and adds them to req object
 * Default page is 1, default limit is 10
 */
const pagination = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Add pagination parameters to request object
    req.pagination = {
        page,
        limit,
        offset
    };
    
    next();
};

export default pagination; 