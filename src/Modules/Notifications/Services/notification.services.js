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
        // Validate user is authenticated
        if (!req.loggedInUser || !req.loggedInUser.user || !req.loggedInUser.user._id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const userId = req.loggedInUser.user._id;
        console.log("Fetching notifications for user:", userId);

        const notifications = await Notification.find({ userId: userId }).sort({ createdAt: -1 });

        console.log("Found notifications:", notifications.length);

        return res.status(200).json({
            message: "Notifications fetched successfully",
            notifications,
            count: notifications.length
        });
    } catch (error) {
        console.error("Error in getNotificationsService:", error);
        return res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
};

export const markNotificationAsReadService = async (req, res) => {
    try {
        // Validate user is authenticated
        if (!req.loggedInUser || !req.loggedInUser.user || !req.loggedInUser.user._id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { notificationId } = req.params;
        const userId = req.loggedInUser.user._id;

        console.log("Marking notification as read:", notificationId, "for user:", userId);

        // Find and validate notification belongs to user
        const notification = await Notification.findOne({
            _id: notificationId,
            userId: userId
        });

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found or you don't have permission to access it"
            });
        }

        // Update notification to mark as read
        notification.isRead = true;
        await notification.save();

        console.log("Notification marked as read successfully");

        return res.status(200).json({
            message: "Notification marked as read successfully",
            notification: {
                id: notification._id,
                message: notification.message,
                isRead: notification.isRead,
                createdAt: notification.createdAt
            }
        });
    } catch (error) {
        console.error("Error in markNotificationAsReadService:", error);
        return res.status(500).json({
            message: "Error marking notification as read",
            error: error.message
        });
    }
}