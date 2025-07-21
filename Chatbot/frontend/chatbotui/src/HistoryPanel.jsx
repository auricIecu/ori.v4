import React, { useState, useEffect } from 'react';

const HistoryPanel = ({ onSelectConversation, currentConversationId, showHistory, setShowHistory }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (showHistory) {
      fetchConversations();
    }
  }, [showHistory]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/conversations/');
      if (!response.ok) {
        throw new Error('Error fetching conversations');
      }
      const data = await response.json();
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('No se pudieron cargar las conversaciones. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation(); // Evitar que se seleccione la conversación al eliminarla
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error deleting conversation');
      }
      
      // Actualizar la lista de conversaciones
      setConversations(conversations.filter(conv => conv.conversation_id !== conversationId));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      alert('Error al eliminar la conversación');
    }
  };

  // Formatear fecha para mostrarla más amigable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!showHistory) return null;

  return (
    <div className="bg-zinc-800 h-full overflow-hidden shadow-lg border-l border-zinc-700">
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <h3 className="font-medium text-white">Historial</h3>
        <button 
          onClick={() => setShowHistory(false)}
          className="text-zinc-400 hover:text-white bg-transparent border-none text-lg"
        >
          ✕
        </button>
      </div>
      
      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
        {loading ? (
          <div className="text-center text-white py-6">Cargando...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-6">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-white py-6">No hay conversaciones guardadas</div>
        ) : (
          <ul className="space-y-4">
            {conversations.map((conv) => (
              <li
                key={conv.conversation_id}
                className={`p-4 rounded-md cursor-pointer ${
                  conv.conversation_id === currentConversationId
                    ? 'bg-[#76dd76] text-black'
                    : 'bg-zinc-700 text-white hover:bg-zinc-600'
                }`}
                onClick={() => {
                  onSelectConversation(conv.conversation_id);
                  setShowHistory(false);
                }}
              >
                <div className="flex flex-col mb-2">
                  <span className="font-medium">{conv.title}</span>
                  <span className="text-xs opacity-80">{formatDate(conv.updated_at)}</span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.conversation_id)}
                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
