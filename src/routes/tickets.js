const express = require('express');
const multer = require('multer');
const path = require('path');
<<<<<<< HEAD
const { getAllTickets, getTicketById, createTicket, updateTicket, deleteTicket, addComment, uploadAttachment, getTicketStats } = require('../controllers/ticketController');
=======
const { getAllTickets, getTicketById, createTicket, updateTicket, deleteTicket, addComment, uploadAttachment } = require('../controllers/ticketController');
>>>>>>> 0d08f98e399ef9eae05c14c5081ac83d0bde67e7
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/tickets'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ticket-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

router.get('/', authenticate, getAllTickets);
router.get('/:id', authenticate, getTicketById);
<<<<<<< HEAD
router.get('/stats/status', authenticate, getTicketStats);
=======
>>>>>>> 0d08f98e399ef9eae05c14c5081ac83d0bde67e7
router.post('/', authenticate, createTicket);
router.put('/:id', authenticate, updateTicket);
router.delete('/:id', authenticate, deleteTicket);
router.post('/:id/comments', authenticate, addComment);
router.post('/:id/attachments', authenticate, upload.single('file'), uploadAttachment);

module.exports = router;