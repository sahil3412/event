const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Create Event
router.post('/', auth, upload.single('image'), async (req, res) => {
    const { title, description, date, location, maxAttendees } = req.body;
    const newEvent = new Event({
        title,
        description,
        date,
        location,
        maxAttendees,
        image: req.file.path,
        creator: req.user.id,
    });
    await newEvent.save();
    res.status(201).json(newEvent);
});

// Get Events
router.get('/', async (req, res) => {
    const events = await Event.find().populate('creator', 'username');
    res.json(events);
});

// Edit Event
router.put('/:id', auth, async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event || event.creator.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Event not found or unauthorized' });
    }
    Object.assign(event, req.body);
    await event.save();
    res.json(event);
});

// Delete Event
router.delete('/:id', auth, async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event || event.creator.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Event not found or unauthorized' });
    }
    await event.remove();
    res.json({ message: 'Event deleted' });
});

module.exports = router;
