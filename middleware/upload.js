import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Debug logging
        console.log('Upload request details:');
        console.log('- Original URL:', req.originalUrl);
        console.log('- Base URL:', req.baseUrl);
        console.log('- Path:', req.path);
        console.log('- Method:', req.method);
        console.log('- Content-Type:', req.headers['content-type']);
        console.log('- File field name:', file.fieldname);
        console.log('- File original name:', file.originalname);
        
        // Determine the upload directory based on the route
        const url = req.originalUrl.toLowerCase();
        let uploadDir = 'uploads/news';

        // More specific checks first
        if (url.includes('/guests/') || url.includes('guests')) {
            uploadDir = 'uploads/guests';
            console.log('Detected GUEST upload');
        } else if (url.includes('/events/') || url.includes('events')) {
            uploadDir = 'uploads/events';
            console.log('Detected EVENT upload');
        } else if (url.includes('/opportunities/') || url.includes('opportunities')) {
            uploadDir = 'uploads/opportunities';
            console.log('Detected OPPORTUNITY upload');
        } else if (url.includes('apply')) {
            uploadDir = 'uploads/resumes';
            console.log('Detected RESUME upload');
        } else {
            console.log('No specific upload type detected, using news');
        }

        // Make sure the directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        console.log('Selected upload directory:', uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const url = req.originalUrl.toLowerCase();
        let prefix = 'news';
        
        // More specific checks first
        if (url.includes('/guests/') || url.includes('guests')) {
            prefix = 'guest';
        } else if (url.includes('/events/') || url.includes('events')) {
            prefix = 'event';
        } else if (url.includes('/opportunities/') || url.includes('opportunities')) {
            prefix = 'opportunity';
        } else if (url.includes('apply')) {
            prefix = 'resume';
        }
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`;
        console.log('Generated filename:', filename);
        cb(null, filename);
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