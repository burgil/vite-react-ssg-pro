
import { Suspense, useState } from 'react';
import { m as motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * SuspenseExample - Demonstrates React Suspense patterns
 * 
 * This example page is already added to the router at /suspense-example
 * It shows real working components with Framer Motion animations
 * 
 * This component shows:
 * 1. Multiple Suspense boundaries with different fallbacks
 * 2. Conditional lazy-loading (modal only loads when opened)
 * 3. Sized fallbacks to prevent layout shift
 */
export default function SuspenseExample() {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl pt-36">
            <h1 className="text-4xl font-bold mb-8">React Suspense Example</h1>

            {/* Example 1: Chart with sized fallback */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">📊 Chart Component</h2>
                <p className="text-gray-400 mb-6">
                    In a real app, you'd lazy-load this chart. The fallback has the same size to prevent layout shift.
                </p>

                <Suspense
                    fallback={
                        <div className="h-64 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2" />
                                <p className="text-gray-400">Loading chart...</p>
                            </div>
                        </div>
                    }
                >
                    <HeavyChartComponent />
                </Suspense>
            </section>

            {/* Example 2: Data table with grid skeleton */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">📋 Data Table</h2>
                <p className="text-gray-400 mb-6">
                    This table shows a grid skeleton that matches the final layout.
                </p>

                <div className="w-full overflow-hidden">
                    <Suspense
                        fallback={
                            <div className="w-full">
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-12 bg-gray-800 rounded animate-pulse"
                                            style={{ animationDelay: `${i * 100}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        }
                    >
                        <DataTableComponent />
                    </Suspense>
                </div>
            </section>

            {/* Example 3: Conditional modal */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">⚙️ Conditionally Loaded Modal</h2>
                <p className="text-gray-400 mb-6">
                    In a real app, lazy-load this modal so it only loads when clicked - reducing initial bundle size.
                </p>

                <motion.button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Open Settings Modal
                </motion.button>

                {showModal && (
                    <Suspense
                        fallback={
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
                                    <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
                                    <p className="text-center mt-4 text-gray-400">Loading settings...</p>
                                </div>
                            </div>
                        }
                    >
                        <SettingsModalComponent onClose={() => setShowModal(false)} />
                    </Suspense>
                )}
            </section>

            {/* Example 4: Best practices summary */}
            <section className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">✅ Best Practices</h2>
                <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Use <strong>sized fallbacks</strong> to prevent layout shift</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Lazy-load <strong>below-the-fold</strong> components</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>Conditionally load <strong>modals and overlays</strong></span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>Don't lazy-load <strong>above-the-fold</strong> content</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-red-500 mr-2">✗</span>
                        <span>Don't use empty fallbacks (causes layout shift)</span>
                    </li>
                </ul>
            </section>
        </div>
    );
}

// Real working components demonstrating Suspense patterns with actual animations
const HeavyChartComponent = () => {
    const data = [65, 59, 80, 81, 56, 55, 40];
    const max = Math.max(...data);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-64 bg-gray-800 rounded-lg p-6"
        >
            <h3 className="text-lg font-semibold mb-4">Weekly Performance</h3>
            <div className="h-40 flex items-end justify-between gap-2">
                {data.map((value, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${(value / max) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                        className="flex-1 bg-blue-500 rounded-t hover:bg-blue-400 transition-colors relative group"
                    >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            {value}
                        </span>
                    </motion.div>
                ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <span key={day}>{day}</span>
                ))}
            </div>
        </motion.div>
    );
};

const DataTableComponent = () => {
    const data = [
        { id: 1, name: 'Alice Johnson', role: 'Developer', status: 'Active' },
        { id: 2, name: 'Bob Smith', role: 'Designer', status: 'Active' },
        { id: 3, name: 'Carol White', role: 'Manager', status: 'Away' },
        { id: 4, name: 'David Brown', role: 'Developer', status: 'Active' },
        { id: 5, name: 'Eve Davis', role: 'QA Engineer', status: 'Active' },
    ];

    return (
        <motion.table
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full table-fixed"
        >
            <thead>
                <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold w-1/2 truncate">Name</th>
                    <th className="text-left py-3 px-4 font-semibold w-1/3 truncate">Role</th>
                    <th className="text-left py-3 px-4 font-semibold w-1/6 truncate">Status</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                        <td className="py-3 px-4 w-1/2 truncate">{row.name}</td>
                        <td className="py-3 px-4 text-gray-400 w-1/3 truncate">{row.role}</td>
                        <td className="py-3 px-4 w-1/6 truncate">
                            <span className={`px-2 py-1 rounded text-xs ${row.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {row.status}
                            </span>
                        </td>
                    </motion.tr>
                ))}
            </tbody>
        </motion.table>
    );
};

const SettingsModalComponent = ({ onClose }: { onClose: () => void }) => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-lg p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-bold mb-6">⚙️ Settings</h3>

                <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-300">Notifications</span>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-blue-600' : 'bg-gray-600'
                                }`}
                        >
                            <motion.div
                                animate={{ x: notifications ? 24 : 0 }}
                                className="w-6 h-6 bg-white rounded-full"
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-300">Dark Mode</span>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-600'
                                }`}
                        >
                            <motion.div
                                animate={{ x: darkMode ? 24 : 0 }}
                                className="w-6 h-6 bg-white rounded-full"
                            />
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
}
