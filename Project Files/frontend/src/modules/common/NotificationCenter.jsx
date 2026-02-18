import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Card, Badge, ListGroup, Button, Modal, Form } from 'react-bootstrap';
import { Bell, Check, X, MessageSquare, Home, Users, Calendar, Star } from 'lucide-react';
import { UserContext } from '../../App';
import axios from 'axios';

const NotificationCenter = () => {
  const user = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user?.userData?._id) return;
    try {
      const response = await axios.get('http://localhost:8001/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refresh when modal is opened
  useEffect(() => {
    if (showModal) fetchNotifications();
  }, [showModal, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:8001/api/notifications/read/${id}`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });
      setNotifications(prev =>
        prev.map(notif => notif._id === id ? { ...notif, isRead: true } : notif)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('http://localhost:8001/api/notifications/readall', {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const wasUnread = notifications.find(n => n._id === id)?.isRead === false;
      await axios.delete(`http://localhost:8001/api/notifications/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
      });
      setNotifications(prev => prev.filter(notif => notif._id !== id));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return { Icon: Users, color: 'primary' };
      case 'property': return { Icon: Home, color: 'success' };
      case 'booking_status': return { Icon: Calendar, color: 'warning' };
      case 'review': return { Icon: Star, color: 'info' };
      default: return { Icon: Bell, color: 'secondary' };
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const NotificationItem = ({ notification }) => {
    const { Icon, color } = getIcon(notification.type);
    
    return (
      <ListGroup.Item 
        className={`border-0 ${!notification.isRead ? 'bg-light' : ''}`}
        style={{ borderLeft: `4px solid var(--bs-${color})` }}
      >
        <div className="d-flex align-items-start">
          <div className={`p-2 rounded-circle bg-${color} bg-opacity-10 me-3`}>
            <Icon size={16} className={`text-${color}`} />
          </div>
          
          <div className="flex-grow-1 min-w-0">
            <div className="d-flex justify-content-between align-items-start">
              <h6 className="mb-1 fw-semibold">
                {notification.title}
                {!notification.isRead && (
                  <Badge bg="primary" className="ms-2 small">New</Badge>
                )}
              </h6>
              <div className="d-flex gap-1">
                {!notification.isRead && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-success"
                    onClick={() => markAsRead(notification._id)}
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </Button>
                )}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-danger"
                  onClick={() => deleteNotification(notification._id)}
                  title="Delete"
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
            <p className="mb-1 small text-muted">{notification.message}</p>
            <small className="text-muted">{formatTime(notification.createdAt)}</small>
          </div>
        </div>
      </ListGroup.Item>
    );
  };

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="position-relative">
        <Button
          variant="link"
          className="position-relative p-2 text-dark"
          onClick={() => setShowModal(true)}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge 
              bg="danger" 
              className="position-absolute top-0 start-100 translate-middle rounded-circle"
              style={{ fontSize: '0.7rem', minWidth: '1.2rem', height: '1.2rem' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notifications Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center">
            <Bell size={20} className="me-2" />
            Notifications
            {unreadCount > 0 && (
              <Badge bg="primary" className="ms-2">
                {unreadCount} new
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="px-0">
          {notifications.length > 0 ? (
            <>
              {unreadCount > 0 && (
                <div className="px-3 pb-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                </div>
              )}
              
              <ListGroup className="list-group-flush">
                {notifications.map(notification => (
                  <NotificationItem key={notification._id} notification={notification} />
                ))}
              </ListGroup>
            </>
          ) : (
            <div className="text-center py-5">
              <Bell size={48} className="text-muted mb-3" />
              <h6>No notifications</h6>
              <p className="text-muted">You're all caught up!</p>
            </div>
          )}
        </Modal.Body>

        {notifications.length > 0 && (
          <Modal.Footer className="border-0 pt-0">
            <small className="text-muted">
              You have {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
            </small>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
};

export default NotificationCenter;