import Event        from '../models/Event.js';
import Calendar     from '../models/Calendar.js';
import Notification from '../models/Notification.js';
import Guest        from '../models/Guest.js';
import Registration from '../models/Registration.js';
import { Op }       from 'sequelize';
import sequelize    from '../config/database.js';

/**
 * Convert a Sequelize instance into a plain object,
 * remove the nested `location`, and keep top‐level lat/lng.
 */
function serializeEvent(inst) {
  const obj = inst.get({ plain: true });
  delete obj.location;
  return obj;
}

// GET /api/events
export const getAllEvents = async (req, res) => {
  try {
    const { limit = 10, offset = 0, includeStats } = req.query;
    const { count, rows } = await Event.findAndCountAll({
      limit:  parseInt(limit),
      offset: parseInt(offset),
      order:  [['startDateTime', 'ASC']]
    });

    const events = rows.map(serializeEvent);
    const response = { events, pagination: { total: count, limit, offset } };

    // optionally add stats…
    if (includeStats === 'true') {
      const now = new Date();
      response.stats = {
        totalEvents: count,
        pastEvents:  await Event.count({ where: { endDateTime: { [Op.lt]: now } }}),
        // …etc…
      };
    }

    res.json(response);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/events/:id
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(serializeEvent(event));
  } catch (err) {
    console.error('Error getting event by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/events
export const createEvent = async (req, res) => {
  try {
    // 1) Parse location JSON if sent as string
    let location = req.body.location;
    if (typeof location === 'string') {
      location = JSON.parse(location);
    }

    // 2) Build event payload
    const payload = {
      title:            req.body.title,
      description:      req.body.description,
      startDateTime:    req.body.startDateTime,
      endDateTime:      req.body.endDateTime,
      location,
      city:             req.body.city,
      place:            req.body.place,
      capacity:         req.body.capacity || null,
      isPaid:           req.body.isPaid  === 'true' || req.body.isPaid === true,
      price:            req.body.price   || null,
      isRecurring:      req.body.isRecurring === 'true' || false,
      recurrencePattern:req.body.recurrencePattern || 'none',
      category:         req.body.category || null,
      status:           req.body.status   || 'upcoming',
      isActive:         req.body.isActive === 'false' ? false : true,
      organizerId:      req.user.id
    };

    // 3) Handle multer file uploads (if any)
    if (req.files?.mainImage?.length) {
      payload.mainImage = `/uploads/events/${req.files.mainImage[0].filename}`;
    }
    if (req.files?.images?.length) {
      payload.images = req.files.images.map(f => `/uploads/events/${f.filename}`);
    }

    // 4) Create the event
    const event = await Event.create(payload);

    // 5) Optional: also create calendar & notification
    await Calendar.create({
      eventId:         event.id,
      startDate:       event.startDateTime,
      endDate:         event.endDateTime,
      startTime:       new Date(event.startDateTime).toLocaleTimeString('en-US',{hour12:false}),
      endTime:         new Date(event.endDateTime).toLocaleTimeString('en-US',{hour12:false}),
      isRecurring:     event.isRecurring,
      recurrencePattern: event.recurrencePattern
    });
    await Notification.create({
      userId:  event.organizerId,
      message: `New event created: ${event.title}`,
      isRead:  false
    });

    res.status(201).json(serializeEvent(event));
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(400).json({ error: err.message });
  }
};

// (You can add updateEvent / deleteEvent similarly,
// always calling `.get({ plain: true })` and serializing.) 