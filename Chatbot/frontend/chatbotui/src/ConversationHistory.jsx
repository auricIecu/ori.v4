import React, { useState, useEffect } from 'react';
import iconoHistorial from './assets/Signo historial.png';

const ConversationHistory = ({ onSelectConversation, currentConversationId, showHistory, setShowHistory }) => {
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

  return (
    <button
      onClick={() => setShowHistory(!showHistory)}
      className="flex items-center justify-center text-black bg-transparent border-none hover:opacity-80 px-3 py-1 text-sm mb-2 transition-colors w-full"
      title="Historial de conversaciones"
    >
      <img src={iconoHistorial} alt="Historial" className="h-11 w-auto" />
    </button>
  );
};

export default ConversationHistory;
