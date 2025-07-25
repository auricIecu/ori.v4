import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import './fonts.css';
import customLogo from './assets/Logo1.png';
import iconoNueva from './assets/Signo mas.png';
import iconoPeerToPeer from './assets/Mensajes peer to peer.png';
import iconoHistorial from './assets/Signo historial.png';
import iconoEnviar from './assets/Signo enviar.png';
import iconoBuscar from './assets/Signo buscar.png';
import iconoInventario from './assets/Signo inventario.png';
import iconoImportaciones from './assets/Signo importaciones.png';
import iconoAdjuntar from './assets/Signo adjuntar.png';
import ConversationHistory from './ConversationHistory';
import HistoryPanel from './HistoryPanel';

const App = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatActive, setIsChatActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [conversationId, setConversationId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const chatContainerRef = useRef(null);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!conversationId) {
      setConversationId(Date.now().toString());
    }
  }, [conversationId]);
  
  // Función para cargar los mensajes de una conversación seleccionada del historial
  const loadConversation = async (selectedConversationId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/conversations/${selectedConversationId}/messages`);
      
      if (!response.ok) {
        throw new Error('Error loading conversation');
      }
      
      const messages = await response.json();
      
      // Transformar los mensajes al formato utilizado en el chatHistory
      const formattedMessages = messages.map(msg => ({
        sender: msg.role,
        text: msg.content,
        id: msg.id
      }));
      
      setChatHistory(formattedMessages);
      setConversationId(selectedConversationId);
      
      // Asegurarse de que se muestre la vista de chat activo, no la de bienvenida
      if (isFirstInteraction) {
        setIsFirstInteraction(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    if (message.trim() === '') return;

    setLoading(true);
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { sender: 'user', text: message },
    ]);

    try {
      const response = await fetch(`http://localhost:8000/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          role: 'user',
          conversation_id: conversationId, // Send the conversation_id with the message
        }),
      });

      if (!response.ok) {
        throw new Error('Error with API request');
      }

      const data = await response.json();
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: 'ai', text: data.response, id: data.message_id },
      ]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  
  // Función para iniciar una nueva conversación sin borrar la actual
  const startNewConversation = () => {
    // Generamos un nuevo ID basado en la marca de tiempo actual
    const newConversationId = Date.now().toString();
    setConversationId(newConversationId);
    setChatHistory([]);
  };
  
  // Función para volver a la pantalla principal/inicio
  const goToHomePage = () => {
    // Iniciar nueva conversación
    const newConversationId = Date.now().toString();
    setConversationId(newConversationId);
    setChatHistory([]);
    
    // Restablecer el estado de primera interacción para mostrar la pantalla de bienvenida
    setIsFirstInteraction(true);
  };

  // Función para enviar feedback sobre una respuesta
  const sendFeedback = async (message, isPositive) => {
    try {
      // Verificar si el mensaje tiene un ID (necesario para mensajes cargados del historial)
      if (!message.id) {
        console.error('No message ID available for feedback');
        return;
      }
      
      const response = await fetch(`http://localhost:8000/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message_id: message.id,
          is_positive: isPositive,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error sending feedback');
      }
      
      // Actualizar el estado local para mostrar que se ha enviado feedback
      setChatHistory((prevHistory) => {
        return prevHistory.map(msg => {
          if (msg === message) {
            return {
              ...msg,
              feedback: isPositive ? 'positive' : 'negative',
            };
          }
          return msg;
        });
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };




  return (
    <div className="bg-[#262624] fixed inset-0 flex">
      {/* Contenedor principal que contiene la barra lateral y el panel de historial */}
      <div className="flex h-full">
        {/* Barra lateral izquierda */}
        <div className="bg-[#262624] w-10 sm:w-20 flex flex-col items-center sm:items-start p-2 border-r border-gray-600 h-full">
          {/* Logo */}
          <div className="mb-8 flex justify-center w-full">
            <img 
              src={customLogo} 
              alt="Logo" 
              className="h-16 w-auto cursor-pointer" 
              onClick={goToHomePage}
              title="Ir al inicio"
            />
          </div>

          {/* Estructura flexible que permite empujar el historial al fondo */}
          <div className="flex flex-col h-full w-full">
            {/* Parte superior con botones */}
            <div className="flex flex-col space-y-4 w-full items-center sm:items-stretch">
              {/* Nueva */}
              <button
                onClick={startNewConversation}
                className="bg-transparent border-none text-black py-2 px-2 text-sm hover:opacity-80 transition-colors w-full flex justify-center items-center"
                title="Nueva conversación"
              >
                <img src={iconoNueva} alt="Nueva" className="h-11 w-auto" />
              </button>

              {/* Mensajes peer to peer (sin funcionalidad por ahora) */}
              <button
                className="bg-transparent border-none text-black py-2 px-2 text-sm hover:opacity-80 transition-colors w-full flex justify-center items-center"
                title="Mensajes peer to peer"
              >
                <img src={iconoPeerToPeer} alt="Mensajes peer to peer" className="h-11 w-auto" />
              </button>
            </div>
            
            {/* Espacio flexible */}
            <div className="flex-grow"></div>
            
            {/* Historial de conversaciones (al fondo) */}
            <div className="w-full mt-auto">
              <ConversationHistory 
                onSelectConversation={loadConversation} 
                currentConversationId={conversationId}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
              />
            </div>
          </div>
        </div>
        
        {/* Panel de historial (aparece como extensión lateral) */}
        {showHistory && (
          <div className="w-64 h-full">
            <HistoryPanel
              onSelectConversation={loadConversation}
              currentConversationId={conversationId}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
            />
          </div>
        )}
      </div>

      {/* Área principal de chat */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden max-w-3xl mx-auto">



        <div
          ref={chatContainerRef}
          className="overflow-y-auto flex-grow space-y-4 mb-4 p-2 sm:p-4"
          style={{ height: isFirstInteraction ? 'calc(30vh)' : 'calc(100vh - 140px)' }}
        >
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-xs sm:max-w-sm md:max-w-md ${msg.sender === 'user' ? 'p-4 bg-[#3a3a3a] rounded-full' : ''} text-white`}>
                {msg.text}
              </div>
              {msg.sender === 'ai' && (
                <div className="flex mt-1 space-x-2">
                  <button
                    onClick={() => sendFeedback(msg, true)}
                    className={`text-lg bg-transparent border-none ${msg.feedback === 'positive' ? 'opacity-100' : 'opacity-60'}`}
                    title="Me gusta esta respuesta"
                    disabled={msg.feedback}
                  >
                    👍
                  </button>
                  <button
                    onClick={() => sendFeedback(msg, false)}
                    className={`text-lg bg-transparent border-none ${msg.feedback === 'negative' ? 'opacity-100' : 'opacity-60'}`}
                    title="No me gusta esta respuesta"
                    disabled={msg.feedback}
                  >
                    👎
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-xs p-4 bg-gray-900 text-white animate-pulse rounded-2xl rounded-tl-none">
                Escribiendo...
              </div>
            </div>
          )}
        </div>


        {isChatActive && (
          <div className={`flex flex-col items-center ${isFirstInteraction ? 'h-full' : ''}`} style={isFirstInteraction ? {justifyContent: 'center', transform: 'translateY(-10%)'} : {}}>
            {isFirstInteraction && (
              <h1 className="text-6xl font-bold mb-6 orito-title" style={{ color: '#f7c61a' }}>
                Orito
              </h1>
            )}
            {isFirstInteraction ? (
              <form 
                onSubmit={(e) => {
                  setIsFirstInteraction(false);
                  sendMessage(e);
                }} 
                className="w-2/3 mx-auto"
              >
                <div className="bg-[#303030] rounded-xl overflow-hidden h-40 flex flex-col relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-full p-4 pb-16 focus:outline-none bg-transparent text-white text-sm sm:text-base resize-none"
                    placeholder="Pregúntame lo que quieras sobre Fermagri..."
                    autoFocus
                    style={{overflowY: 'auto'}}
                  />
                  <div className="absolute left-3 bottom-3 flex items-center space-x-3">
                    <button
                      type="button"
                      className="bg-transparent border-0 outline-none flex items-center justify-center p-0 hover:opacity-80 transition-opacity"
                      style={{boxShadow: 'none'}}
                    >
                      <img src={iconoBuscar} alt="Search" style={{width: '36px', height: '36px', aspectRatio: '1/1', objectFit: 'contain'}} />
                    </button>
                    <button
                      type="button"
                      className="bg-transparent border-0 outline-none flex items-center justify-center p-0 hover:opacity-80 transition-opacity"
                      style={{boxShadow: 'none'}}
                    >
                      <img src={iconoInventario} alt="Inventory" style={{width: '36px', height: '36px', aspectRatio: '1/1', objectFit: 'contain'}} />
                    </button>
                    <button
                      type="button"
                      className="bg-transparent border-0 outline-none flex items-center justify-center p-0 hover:opacity-80 transition-opacity"
                      style={{boxShadow: 'none'}}
                    >
                      <img src={iconoImportaciones} alt="Imports" style={{width: '36px', height: '36px', aspectRatio: '1/1', objectFit: 'contain'}} />
                    </button>
                  </div>
                  <div className="absolute right-3 bottom-3 flex items-center space-x-3">
                    <button
                      type="button"
                      className="bg-transparent border-0 outline-none flex items-center justify-center p-0 hover:opacity-80 transition-opacity"
                      style={{boxShadow: 'none'}}
                    >
                      <img src={iconoAdjuntar} alt="Attach" style={{width: '36px', height: '36px', aspectRatio: '1/1', objectFit: 'contain'}} />
                    </button>
                    <button
                      type="submit"
                      className="bg-transparent border-0 outline-none flex items-center justify-center p-0 disabled:opacity-50 hover:opacity-80 transition-opacity"
                      disabled={loading || !message.trim()}
                      style={{boxShadow: 'none'}}
                    >
                      <img src={iconoEnviar} alt="Send" style={{width: '40px', height: '40px', aspectRatio: '1/1', objectFit: 'contain'}} />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form 
                onSubmit={sendMessage} 
                className="sticky bottom-0 w-full bg-[#262624] py-3 mt-auto"
              >
                <div className="bg-[#303030] rounded-xl overflow-hidden h-40 flex flex-col relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-full p-4 pb-16 focus:outline-none bg-transparent text-white text-sm sm:text-base resize-none"
                    placeholder="Pregúntame lo que quieras sobre Fermagri..."
                    style={{overflowY: 'auto'}}
                  />
                  <div className="absolute left-3 bottom-3 flex items-center space-x-3">
                    <button
                      type="button"
                      className="bg-transparent border-0 outline-none flex items-center justify-center p-0 hover:opacity-80 transition-opacity"
                      style={{boxShadow: 'none'}}
                    >
                      <img src={iconoBuscar} alt="Search" style={{width: '36px', height: '36px', aspectRatio: '1/1', objectFit: 'contain'}} />
                    </button>
                    <button
                      type="button"
                      className="bg-transparent border-0 outline-none flex items-center justify-center p-0 hover:opacity-80 transition-opacity"
                      style={{boxShadow: 'none'}}
                    >
                      <img src={iconoInventario} alt="Inventory" style={{width: '36px', height: '36px', aspectRatio: '1/1', objectFit: 'contain'}} />
                    </button>
                    <button
                      type="button"
                      className="bg-transparent border-0 outline-none flex items-center justify-center p-0 hover:opacity-80 transition-opacity"
                      style={{boxShadow: 'none'}}
                    >
                      <img src={iconoImportaciones} alt="Imports" style={{width: '36px', height: '36px', aspectRatio: '1/1', objectFit: 'contain'}} />
                    </button>
                  </div>
                  <div className="absolute right-3 bottom-3 flex items-center space-x-3">
                    <button
                      type="button"
                      className="bg-transparent border-0 outline-none flex items-center justify-center p-0 hover:opacity-80 transition-opacity"
                      style={{boxShadow: 'none'}}
                    >
                      <img src={iconoAdjuntar} alt="Attach" style={{width: '36px', height: '36px', aspectRatio: '1/1', objectFit: 'contain'}} />
                    </button>
                    <button
                      type="submit"
                      className="bg-transparent border-0 outline-none flex items-center justify-center p-0 disabled:opacity-50 hover:opacity-80 transition-opacity"
                      disabled={loading || !message.trim()}
                      style={{boxShadow: 'none'}}
                    >
                      <img src={iconoEnviar} alt="Send" style={{width: '40px', height: '40px', aspectRatio: '1/1', objectFit: 'contain'}} />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;