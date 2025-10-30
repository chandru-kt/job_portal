import { useState, useEffect } from 'react';
import { supabase, Message } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquare, Send, Mail, MailOpen } from 'lucide-react';

export function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    setMessages(data || []);
    setLoading(false);
  }

  async function markAsRead(messageId: string) {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    await loadMessages();
  }

  function handleSelectMessage(message: Message) {
    setSelectedMessage(message);
    if (!message.is_read && message.receiver_id === user?.id) {
      markAsRead(message.id);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Loading messages...</p>
      </div>
    );
  }

  const receivedMessages = messages.filter((m) => m.receiver_id === user?.id);
  const sentMessages = messages.filter((m) => m.sender_id === user?.id);
  const unreadCount = receivedMessages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          {unreadCount > 0 && (
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Inbox</h3>
            {receivedMessages.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No messages</p>
              </div>
            ) : (
              <div className="space-y-2">
                {receivedMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedMessage?.id === message.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${!message.is_read ? 'bg-blue-50 border-blue-200' : ''}`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {message.is_read ? (
                        <MailOpen className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                      ) : (
                        <Mail className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm truncate ${
                            message.is_read ? 'text-gray-900' : 'text-gray-900 font-semibold'
                          }`}
                        >
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedMessage.subject}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a message to view its contents</p>
              </div>
            )}
          </div>
        </div>

        {sentMessages.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Sent Messages</h3>
            <div className="space-y-2">
              {sentMessages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <p className="font-medium text-gray-900 mb-1">{message.subject}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(message.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
