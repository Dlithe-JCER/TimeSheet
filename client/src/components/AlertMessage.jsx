import { motion } from "framer-motion";

export default function AlertMessage({ type, message, onClose }) {
    if (!message) return null;

    const bgColor =
        type === "success"
            ? "bg-green-600"
            : type === "error"
                ? "bg-red-600"
                : "bg-gray-600";

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
        >
            <div
                className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4`}
            >
                <span className="text-center w-full">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 text-white hover:text-gray-200 font-bold"
                >
                    ✕
                </button>
            </div>
        </motion.div>
    );
}
