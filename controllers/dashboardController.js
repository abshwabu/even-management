import Event from '../models/Event.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        
        // Get total events count
        const totalEvents = await Event.count();
        
        // Get past events count
        const totalPastEvents = await Event.count({
            where: {
                endDateTime: {
                    [Op.lt]: now
                }
            }
        });
        
        // Get ongoing events count
        const totalOngoingEvents = await Event.count({
            where: {
                startDateTime: {
                    [Op.lte]: now
                },
                endDateTime: {
                    [Op.gte]: now
                }
            }
        });
        
        // Get upcoming events count
        const totalUpcomingEvents = await Event.count({
            where: {
                startDateTime: {
                    [Op.gt]: now
                }
            }
        });
        
        // Get inactive events count
        const inactiveEvents = await Event.count({
            where: {
                isActive: false
            }
        });
        
        // Get recent actions (this would require an activity log table)
        // For now, we'll return the 5 most recently updated events
        const recentActions = await Event.findAll({
            attributes: ['id', 'title', 'updatedAt'],
            order: [['updatedAt', 'DESC']],
            limit: 5
        });
        
        res.status(200).json({
            totalEvents,
            totalPastEvents,
            totalOngoingEvents,
            totalUpcomingEvents,
            inactiveEvents,
            recentActions: recentActions.map(event => ({
                actionType: 'update', // This is a placeholder
                eventTitle: event.title,
                dateAndTime: event.updatedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
}; 