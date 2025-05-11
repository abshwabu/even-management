import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine the upload directory based on the route
        let uploadDir = 'uploads/';
        if (req.originalUrl.includes('/events/')) {
            uploadDir += 'events/';
        } else if (req.originalUrl.includes('/guests/')) {
            uploadDir += 'guests/';
        } else if (req.originalUrl.includes('/news/')) {
            uploadDir += 'news/';
        } else if (req.originalUrl.includes('/opportunities/')) {
            uploadDir += 'opportunities/';
        }
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { 
        fileSize: 10 * 1024 * 1024, // 10MB limit per file
        files: 11 // max 11 files total (1 main + 10 additional)
    }
});

export default upload; 