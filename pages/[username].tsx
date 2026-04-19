import axios from "axios";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Settings, Disc3, Headphones, Heart, LayoutGrid, LogOut } from "lucide-react";

const UserProfile: React.FC = () => {
    const { query } = useRouter();
    const { username } = query;
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>({});
    
    // Prevent infinite loop from original useEffect 
    const isFetched = useRef(false);

    const getUserFromDB = async () => {
        if (!username || isFetched.current) return;
        try {
            setLoading(true);
            isFetched.current = true;
            const res = await axios.post("/api/connect/spotify", {
                action: "get",
                username: username,
            });
            setUser(res.data.data || { username: username }); // Fallback if API fails but page navigated
            setLoading(false);
        } catch (error) {
            console.error(error);
            setUser({ username: username }); // Fallback
            setLoading(false);
        }
    };

    useEffect(() => {
        if (username) {
            getUserFromDB();
        }
    }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

    const staggered = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.6 } }
    };

    return (
        <div className="min-h-screen bg-pearl flex text-primary">
            {/* Sidebar View */}
            <aside className="hidden md:flex flex-col w-64 border-r border-black/5 bg-white/50 backdrop-blur-xl px-6 py-8 h-screen sticky top-0">
                <div className="flex items-center space-x-3 mb-16">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-black/10">
                        <span className="text-pearl font-display font-bold text-lg">b.</span>
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight">BEET</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <p className="text-xs uppercase tracking-wider font-semibold text-primary/40 mb-4 ml-3">Menu</p>
                    {[
                        { icon: LayoutGrid, label: "Overview", active: true },
                        { icon: Disc3, label: "Playlists", active: false },
                        { icon: Heart, label: "Favorites", active: false },
                        { icon: Headphones, label: "Matches", active: false },
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${item.active ? 'bg-primary text-pearl shadow-md shadow-black/5' : 'text-primary/60 hover:bg-black/5 hover:text-primary'}`}>
                            <item.icon size={18} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="mt-auto">
                    <div className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-primary/60 hover:bg-black/5 hover:text-primary cursor-pointer transition-all duration-300 mb-2">
                        <Settings size={18} />
                        <span className="font-medium text-sm">Settings</span>
                    </div>
                    <Link href="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-red-500/70 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-all duration-300">
                        <LogOut size={18} />
                        <span className="font-medium text-sm">Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 px-6 md:px-12 py-8 overflow-y-auto">
                {/* Header */}
                <header className="flex items-center justify-between mb-16">
                    <div className="relative w-full max-w-sm hidden md:block">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" />
                        <input 
                            type="text" 
                            placeholder="Search artists, tracks, or friends..." 
                            className="w-full bg-white/60 border border-black/5 focus:border-black/20 focus:ring-4 ring-black/5 outline-none rounded-full py-2.5 pl-12 pr-4 text-sm transition-all"
                        />
                    </div>

                    <div className="flex items-center space-x-6 ml-auto">
                        <button className="relative text-primary/60 hover:text-primary transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full ring-2 ring-pearl translate-x-1/3 -translate-y-1/3"></span>
                        </button>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-black/5">
                            <span className="text-primary font-medium text-sm">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                    </div>
                </header>

                {/* Dashboard Loading State vs Ready State */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center justify-center h-[60vh]"
                        >
                            <div className="w-12 h-12 border-2 border-primary/10 border-t-secondary rounded-full animate-spin mb-6"></div>
                            <p className="text-primary/50 text-sm tracking-widest uppercase font-medium">Curating your space...</p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="dashboard"
                            variants={staggered}
                            initial="hidden"
                            animate="show"
                            className="space-y-10"
                        >
                            {/* Welcome Banner */}
                            <motion.div variants={fadeUp} className="relative rounded-[2rem] bg-primary text-pearl p-10 overflow-hidden shadow-2xl shadow-black/10">
                                <div className="absolute inset-0 bg-gradient-to-r from-custom-blue/40 to-secondary/20 mix-blend-overlay"></div>
                                <div className="relative z-10 max-w-2xl">
                                    <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight mb-4">
                                        Welcome, {user.username}
                                    </h1>
                                    <p className="text-pearl/70 text-lg">
                                        Your audio frequencies are perfectly tuned. Discover who&apos;s vibing to the same tracks right now.
                                    </p>
                                </div>
                            </motion.div>

                            {/* Placeholders for future data */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { title: "Top Artists", subtitle: "Based on recent streams" },
                                    { title: "New Matches", subtitle: "Similar audio taste" },
                                    { title: "Trending", subtitle: "Global community picks" }
                                ].map((card, i) => (
                                    <motion.div key={i} variants={fadeUp} className="bg-white border border-black/5 rounded-[2rem] p-6 shadow-xl shadow-black/5 flex flex-col h-64 hover:border-black/10 transition-colors">
                                        <h3 className="font-display font-medium text-xl mb-1">{card.title}</h3>
                                        <p className="text-sm text-primary/50 mb-auto">{card.subtitle}</p>
                                        <div className="bg-black/5 rounded-xl flex-1 flex items-center justify-center border border-black/5 border-dashed mt-4">
                                            <span className="text-primary/30 text-xs font-medium uppercase tracking-widest">No data available</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default UserProfile;
