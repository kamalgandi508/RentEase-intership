import React, { useState, useEffect, useRef, useContext } from 'react';
import { UserContext } from '../../App';
import axios from 'axios';

const ChatWindow = () => {
  const user = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const authHeaders = {
    headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` }
  };

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Poll for new messages when a conversation is selected
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(selectedUser._id, true);
      }, 5000);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedUser]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get('http://localhost:8001/api/chat/conversations', authHeaders);
      setConversations(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchMessages = async (otherUserId, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await axios.get(`http://localhost:8001/api/chat/messages/${otherUserId}`, authHeaders);
      setMessages(res.data.data || []);
      if (!silent) setLoading(false);
      // Refresh conversations to update unread counts
      if (silent) fetchConversations();
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setSendingMessage(true);
    try {
      await axios.post('http://localhost:8001/api/chat/send', {
        receiverId: selectedUser._id,
        message: newMessage.trim(),
      }, authHeaders);

      setNewMessage('');
      fetchMessages(selectedUser._id, true);
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message');
    }
    setSendingMessage(false);
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const currentUserId = user?.userData?._id;

  return (
    <div style={styles.container}>
      {/* Conversations Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h5 style={{ margin: 0 }}>Chats</h5>
        </div>
        <div style={styles.conversationList}>
          {conversations.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                No conversations yet. Start chatting with a property owner or renter!
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.user._id}
                style={{
                  ...styles.conversationItem,
                  backgroundColor: selectedUser?._id === conv.user._id ? '#e3f2fd' : '#fff',
                }}
                onClick={() => setSelectedUser(conv.user)}
              >
                <div style={styles.avatar}>
                  {conv.user.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.conversationInfo}>
                  <div style={styles.conversationTop}>
                    <span style={styles.userName}>{conv.user.name}</span>
                    <span style={styles.timeStamp}>
                      {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  <div style={styles.conversationBottom}>
                    <span style={styles.lastMessage}>
                      {conv.lastMessage
                        ? (conv.lastMessage.senderId === currentUserId ? 'You: ' : '') +
                          (conv.lastMessage.message.length > 30
                            ? conv.lastMessage.message.substring(0, 30) + '...'
                            : conv.lastMessage.message)
                        : 'No messages yet'}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span style={styles.unreadBadge}>{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div style={styles.chatHeader}>
              <div style={styles.avatar}>
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h6 style={{ margin: 0 }}>{selectedUser.name}</h6>
                <small style={{ color: '#888' }}>
                  {selectedUser.type === 'owner' ? 'Property Owner' : 'Renter'}
                </small>
              </div>
            </div>

            {/* Messages */}
            <div style={styles.messagesContainer}>
              {loading ? (
                <div style={styles.loadingState}>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div style={styles.emptyMessages}>
                  <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg._id}
                      style={{
                        ...styles.messageRow,
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          ...styles.messageBubble,
                          backgroundColor: isMine ? '#007bff' : '#e9ecef',
                          color: isMine ? '#fff' : '#333',
                          borderBottomRightRadius: isMine ? '4px' : '18px',
                          borderBottomLeftRadius: isMine ? '18px' : '4px',
                        }}
                      >
                        <p style={styles.messageText}>{msg.message}</p>
                        <span
                          style={{
                            ...styles.messageTime,
                            color: isMine ? 'rgba(255,255,255,0.7)' : '#999',
                          }}
                        >
                          {formatTime(msg.createdAt)}
                          {isMine && (
                            <span style={{ marginLeft: '4px' }}>
                              {msg.isRead ? '✓✓' : '✓'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} style={styles.inputArea}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={styles.input}
                disabled={sendingMessage}
              />
              <button
                type="submit"
                style={{
                  ...styles.sendButton,
                  opacity: sendingMessage || !newMessage.trim() ? 0.6 : 1,
                }}
                disabled={sendingMessage || !newMessage.trim()}
              >
                {sendingMessage ? '...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div style={styles.noChat}>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ color: '#888' }}>Select a conversation</h4>
              <p style={{ color: '#aaa' }}>
                Choose a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '75vh',
    border: '1px solid #ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  sidebar: {
    width: '320px',
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafafa',
  },
  sidebarHeader: {
    padding: '16px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#fff',
  },
  conversationList: {
    flex: 1,
    overflowY: 'auto',
  },
  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#007bff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    marginRight: '12px',
    flexShrink: 0,
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversationTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontWeight: '600',
    fontSize: '15px',
  },
  timeStamp: {
    fontSize: '12px',
    color: '#999',
  },
  conversationBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  lastMessage: {
    fontSize: '13px',
    color: '#777',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '180px',
  },
  unreadBadge: {
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '50%',
    minWidth: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 'bold',
    padding: '0 6px',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#fff',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    backgroundColor: '#f5f5f5',
  },
  messageRow: {
    display: 'flex',
    marginBottom: '8px',
  },
  messageBubble: {
    maxWidth: '65%',
    padding: '10px 14px',
    borderRadius: '18px',
    wordWrap: 'break-word',
  },
  messageText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4',
  },
  messageTime: {
    fontSize: '11px',
    display: 'block',
    textAlign: 'right',
    marginTop: '4px',
  },
  inputArea: {
    display: 'flex',
    padding: '12px',
    borderTop: '1px solid #ddd',
    backgroundColor: '#fff',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '24px',
    border: '1px solid #ddd',
    outline: 'none',
    fontSize: '14px',
  },
  sendButton: {
    padding: '10px 24px',
    borderRadius: '24px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  noChat: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px',
    color: '#888',
  },
  emptyMessages: {
    textAlign: 'center',
    padding: '40px',
    color: '#888',
  },
  emptyState: {},
};

export default ChatWindow;
