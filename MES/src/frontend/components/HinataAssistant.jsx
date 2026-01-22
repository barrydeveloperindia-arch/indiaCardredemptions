import { Bot, Mic, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HinataAssistant = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi, I'm Hinata. How can I help you manage the factory today?" }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    // -- Voice Synthesis --
    const speak = (text) => {
        if (!window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        // Try to find a female voice
        const voices = window.speechSynthesis.getVoices();
        const specificVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google US English') || v.name.includes('Zira'));
        if (specificVoice) utterance.voice = specificVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.1; // Slightly higher pitch for "Hinata"
        window.speechSynthesis.speak(utterance);
    };

    // -- Voice Recognition --
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };

        recognition.start();
    };

    // -- Navigation Logic --
    const handleCommand = async (text) => {
        const lower = text.toLowerCase();
        let response = "";



        // Standard Navigation commands (Simulated local logic)
        if (lower.includes('dispatch') || lower.includes('dashboard')) {
            navigate('/');
            response = "Navigating to Dispatch Board.";
        } else if (lower.includes('scheduler') || lower.includes('gantt') || lower.includes('schedule')) {
            navigate('/scheduler');
            response = "Opening Agile Scheduler.";
        } else if (lower.includes('catalog') || lower.includes('parts')) {
            navigate('/catalog');
            response = "Going to Part Catalog.";
        } else if (lower.includes('plm') || lower.includes('analysis') || lower.includes('geometric')) {
            navigate('/plm');
            response = "Opening PLM Analysis.";
        } else if (lower.includes('shop') || lower.includes('floor') || lower.includes('printer')) {
            navigate('/shop-floor');
            response = "Taking you to Shop Floor Live.";
        } else if (lower.includes('inventory') || lower.includes('stock')) {
            navigate('/inventory');
            response = "Opening Inventory Management.";
        } else if (lower.includes('financial') || lower.includes('invoice') || lower.includes('ledger') || lower.includes('money')) {
            navigate('/financials');
            response = "Navigating to Financial Ledger.";

            // --- Desktop App Extensions ---
        } else if (lower.includes('open fusion') || lower.includes('fusion 360')) {
            window.location.href = "fusion360://";
            response = "Launching Autodesk Fusion 360...";
        } else if (lower.includes('open excel')) {
            window.location.href = "ms-excel:";
            response = "Opening Microsoft Excel...";
        } else if (lower.includes('open blender')) {
            response = "Launching Blender (via Desktop Bridge)...";
            // In real app: call backend -> which notifies local agent
        } else if (lower.includes('open ideamaker')) {
            response = "Launching IdeaMaker (via Desktop Bridge)...";

            // --- System Commands ---
        } else if (lower.includes('reset')) {
            return "RESET_ACTION";
        } else if (lower.includes('refresh')) {
            window.location.reload();
            return "Refreshing..."
        } else {
            // General Query -> Fallback to Gemini AI
            try {
                const res = await fetch(`${API_BASE_URL}/api/ai/ask`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, provider: 'gemini' })
                });
                const data = await res.json();
                response = data.response;
            } catch (err) {
                console.error("AI Fetch Error", err);
                response = `Communication Error: ${err.message}. Ensure Backend is running.`;
            }
        }
        return response;
    };

    const handleSend = async (textOverride = null) => {
        const text = textOverride || input;
        if (!text.trim()) return;

        // User Message
        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInput('');

        const processReply = async () => {
            // Check for RESET first to avoid appending to history
            if (text.toLowerCase().includes('reset')) {
                const reply = await handleCommand(text);
                if (reply === "RESET_ACTION") {
                    setMessages([{ role: 'assistant', content: "Chat reset. How can I help you manage the factory today?" }]);
                    speak("Chat reset.");
                    return;
                }
            }

            const reply = await handleCommand(text);
            if (reply === "RESET_ACTION") {
                setMessages([{ role: 'assistant', content: "Chat reset. How can I help you manage the factory today?" }]);
                speak("Chat reset.");
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
                speak(reply);
            }
        };

        // No delay needed for simulated thinking if we want snappy AI, but small delay feels natural
        // Since we await API if needed, let's just run it
        await processReply();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-englabs-primary text-white rounded-full shadow-lg hover:bg-blue-600 transition-all z-50 flex items-center justify-center animate-bounce-slow"
                title="Ask Hinata"
            >
                <Bot className="w-8 h-8" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-englabs-primary p-4 flex justify-between items-center text-white">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Hinata</h3>
                        <div className="text-xs text-blue-100 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Online
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded transition">
                    <X className="w-5 h-5" />
                </button>
            </div>



            {/* Chat Area */}
            <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user'
                                ? 'bg-englabs-primary text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-englabs-primary/20 focus-within:border-englabs-primary transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isListening ? "Listening..." : "Ask Hinata..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400"
                    />

                    <button
                        onClick={startListening}
                        className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-englabs-primary hover:bg-blue-50'
                            }`}
                        title="Voice Search"
                    >
                        <Mic className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => handleSend()}
                        className="p-1.5 text-englabs-primary hover:bg-blue-50 rounded-full transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-[10px] text-center text-gray-400 mt-2">
                    Powered by Gemini AI • System Integrated
                </div>
            </div>
        </div>
    );
};

export default HinataAssistant;
