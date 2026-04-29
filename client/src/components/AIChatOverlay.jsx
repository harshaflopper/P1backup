import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AIChatOverlay = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('ai_chat_history');
        if (saved) return JSON.parse(saved);
        return [{ role: 'ai', text: 'Hi! I am your AI System Administrator. I can schedule, query the database, filter faculty, and download PDFs. What do you need?' }];
    });

    const [position, setPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 550 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const chatEndRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        localStorage.setItem('ai_chat_history', JSON.stringify(messages));
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragOffset.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragOffset.current.x,
            y: e.clientY - dragOffset.current.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Your browser does not support voice input.');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
    };

    const processAction = async (actionObj) => {
        setMessages(prev => [...prev, { role: 'ai', text: actionObj.reply || 'Executing...' }]);

        if (actionObj.action === 'AUTO_WORKFLOW') {
            navigate('/exam-allotment', { state: { aiMacro: actionObj.payload } });
            await new Promise(r => setTimeout(r, 800)); // Delay for effect and navigation
        } else if (actionObj.action === 'DOWNLOAD_PDF') {
            navigate('/room-allotment');
            await new Promise(r => setTimeout(r, 600)); // Wait for render
            window.dispatchEvent(new CustomEvent('ai-download-pdf', { detail: actionObj.payload }));
        } else if (actionObj.action === 'NAVIGATE_FILTER') {
            navigate(actionObj.payload.page, { state: { aiFilter: actionObj.payload.filter } });
            await new Promise(r => setTimeout(r, 600));
        }
        // DATA_QUERY and NONE require no frontend navigation
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const res = await axios.post('/api/chat/agent', { prompt: userMsg });
            const data = res.data;

            // Normalize to array for chained execution
            const actions = Array.isArray(data) ? data : [data];

            for (const actionObj of actions) {
                await processAction(actionObj);
                await new Promise(r => setTimeout(r, 500)); // Minor pause between chain links
            }
            
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered a critical error processing that command.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="font-sans z-[9999]" style={isOpen ? { position: 'fixed', left: position.x, top: position.y } : { position: 'fixed', bottom: 24, right: 24 }}>
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 rounded-full bg-retro-blue text-white shadow-paper border-2 border-retro-dark flex items-center justify-center text-3xl hover:bg-retro-blue/90 hover:scale-105 transition-all animate-bounce"
                >
                    <i className="bi bi-robot"></i>
                </button>
            )}

            {isOpen && (
                <div 
                    className="w-[360px] bg-retro-white shadow-paper border-2 border-retro-dark flex flex-col h-[500px]"
                    style={{ borderRadius: '12px', overflow: 'hidden' }}
                >
                    <div 
                        onMouseDown={handleMouseDown}
                        className="bg-retro-dark px-4 py-3 border-b-2 border-retro-dark flex justify-between items-center text-white cursor-move select-none"
                    >
                        <div className="flex items-center gap-2">
                            <i className="bi bi-cpu-fill text-xl text-retro-blue"></i>
                            <div>
                                <h3 className="font-black tracking-widest text-sm uppercase">Admin Agent</h3>
                                <p className="text-[9px] opacity-70 tracking-widest uppercase truncate max-w-[150px]">
                                    Context: {location.pathname}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setMessages([{ role: 'ai', text: 'Chat cleared. How can I help?' }])} className="hover:text-retro-blue transition-colors text-xs" title="Clear Chat">
                                <i className="bi bi-trash-fill"></i>
                            </button>
                            <button onClick={() => setIsOpen(false)} className="hover:text-retro-red transition-colors text-sm">
                                <i className="bi bi-x-lg font-bold"></i>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa] flex flex-col relative" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg px-4 py-3 border-2 border-retro-dark text-sm font-bold shadow-sm ${
                                    m.role === 'user' ? 'bg-retro-blue text-white rounded-br-none' : 'bg-white text-retro-dark rounded-bl-none'
                                }`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-lg rounded-bl-none px-4 py-3 border-2 border-retro-dark bg-white text-retro-dark shadow-sm flex items-center gap-2">
                                    <i className="bi bi-gear-wide-connected animate-spin text-retro-blue"></i>
                                    <span className="text-xs font-bold opacity-70">Computing...</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="border-t-2 border-retro-dark p-3 bg-white flex items-center gap-2">
                        <button 
                            type="button" 
                            onClick={startListening}
                            className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-retro-dark transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-retro-dark hover:bg-gray-200'}`}
                            title="Voice Input"
                        >
                            <i className={isListening ? "bi bi-mic-fill" : "bi bi-mic"}></i>
                        </button>
                        <input 
                            type="text" 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-1 px-3 py-2 rounded-md border-2 border-retro-dark outline-none focus:border-retro-blue text-sm font-bold bg-gray-50"
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-retro-dark text-white rounded-md border-2 border-retro-dark hover:bg-retro-blue transition-colors disabled:opacity-50">
                            <i className="bi bi-send-fill text-sm"></i>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIChatOverlay;
