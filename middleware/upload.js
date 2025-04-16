import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine the upload directory based on the route
        const isEvent = req.baseUrl.includes('events');
        const isGuest = req.baseUrl.includes('guests');
        const isOpportunity = req.baseUrl.includes('opportunities');
        const isResume = req.originalUrl.includes('apply');
        
        let uploadDir = 'uploads/news';

        if (isEvent) {
            uploadDir = 'uploads/events';
        } else if (isGuest) {
            uploadDir = 'uploads/guests';
        } else if (isOpportunity) {
            uploadDir = 'uploads/opportunities';
        } else if (isResume) {
            uploadDir = 'uploads/resumes';
        }

        // Make sure the directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        let prefix = 'news';
        if (req.baseUrl.includes('events')) prefix = 'event';
        else if (req.baseUrl.includes('guests')) prefix = 'guest';
        else if (req.baseUrl.includes('opportunities')) prefix = 'opportunity';
        else if (req.originalUrl.includes('apply')) prefix = 'resume';
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (req.originalUrl.includes('apply')) {
        // For resumes, allow PDF, DOC, DOCX
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed for resumes.'), false);
        }
    } else if (file.mimetype.startsWith('image/')) {
        // For images
        cb(null, true);
    } else {
        cb(new Error('Invalid file type.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

export default upload; 