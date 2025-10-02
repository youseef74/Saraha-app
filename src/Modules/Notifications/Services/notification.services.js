import Notification from "../../../DB/Models/notification.model.js";


// ================= CREATE NOTIFICATION =================

export const createNotificationService = async (userId, message) =>{
    const notification = new Notification({
        userId,
        message
    })
    await notification.save();
}

// ================= GET NOTIFICATIONS =================

export const getNotificationsService = async (req, res) => {
    try {
        const { user:{_id} } = req.loggedInUser;
        const notifications = await Notification.find({ userId: _id }).sort({ createdAt: -1 });
        return res.status(200).json({ message: "Notifications fetched successfully", notifications });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching notifications", error });
    }
};

// ================= MARK NOTIFICATION AS READ =================

export const markNotificationAsReadService = async (req, res) => {
    try {
        const { notificationId } = req.params;
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        return res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        return res.status(500).json({ message: "Error marking notification as read", error });
    }
}