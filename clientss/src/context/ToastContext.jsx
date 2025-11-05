import { createContext, useContext, useState } from "react";

const ToastCtx = createContext();
export const useToasts = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function push(message, type = "info") {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-lg shadow-md text-white ${
              t.type === "error"
                ? "bg-red-500"
                : t.type === "success"
                ? "bg-green-500"
                : "bg-blue-500"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
