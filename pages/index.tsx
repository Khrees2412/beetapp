import Image from "next/image";
import { motion } from "framer-motion";
import { Globe2, Users, Music, Play, ArrowRight } from "lucide-react";
import spotify from "../public/assets/spotify.png";
import deezer from "../public/assets/deezer.png";
import { spotifyLoginUrl } from "@/lib/spotify";
import { deezerLoginUrl } from "@/lib/deezer";

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
        },
    },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

const Homepage: React.FC = () => {
    return (
        <main className="min-h-screen relative overflow-hidden bg-pearl text-primary">
            <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/5 blur-[120px] -z-10" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-custom-blue/5 blur-[100px] -z-10" />

            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="fixed top-0 w-full z-50 px-6 py-4"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between glassmorphism rounded-full px-6 py-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-pearl font-display font-bold text-lg">b.</span>
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight">BEET</span>
                    </div>
                    <a href="#about" className="text-sm font-medium hover:text-secondary transition-colors inline-block text-primary/70">
                        About
                    </a>
                </div>
            </motion.nav>

            <div className="max-w-7xl mx-auto px-6 pt-40 pb-20">
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col items-center text-center space-y-8"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-black/5">
                        <Play size={14} className="text-secondary" fill="currentColor" />
                        <span className="text-xs font-semibold tracking-wider uppercase text-primary/60">Music makes us one</span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="font-display font-medium text-6xl md:text-8xl tracking-[-0.04em] leading-[0.95] text-balance">
                        Connect through <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/40 italic">the rhythm.</span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="max-w-xl text-lg text-primary/60 text-balance leading-relaxed">
                        Discover new friends, sync your playlists, and explore a universe of sound with people who share your exquisite taste in music.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 pt-8">
                        <a href="#connect" className="group flex items-center justify-center space-x-2 bg-primary text-pearl px-8 py-4 rounded-full font-medium hover:bg-primary/90 transition-all w-full sm:w-auto shadow-xl shadow-black/10">
                            <span>Get Started</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                    </motion.div>
                </motion.section>

                <motion.section
                    id="about"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="py-32 grid md:grid-cols-3 gap-8"
                >
                    {[
                        { icon: Globe2, title: "Global Audience", desc: "Break geographical boundaries and find your audio-twin anywhere in the world." },
                        { icon: Users, title: "Similar Taste", desc: "Our algorithm matches you with people who vibe to the exact same frequencies." },
                        { icon: Music, title: "New Discoveries", desc: "Expand your library with curated tracks from your new global community." }
                    ].map((feature, i) => (
                        <motion.div key={i} variants={fadeInUp} className="p-8 rounded-[2rem] bg-white border border-black/5 hover:border-black/10 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group">
                            <div className="w-14 h-14 rounded-full bg-pearl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <feature.icon size={24} className="text-primary/70" />
                            </div>
                            <h3 className="font-display text-2xl font-medium tracking-tight mb-3">{feature.title}</h3>
                            <p className="text-primary/60 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.section>

                <motion.section
                    id="connect"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="max-w-4xl mx-auto rounded-[3rem] bg-primary text-pearl p-10 md:p-20 text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-custom-blue/20 opacity-50"></div>
                    <div className="relative z-10 hidden md:block absolute top-[10%] left-[10%] w-64 h-64 bg-secondary/30 blur-[100px] rounded-full mix-blend-screen" />

                    <motion.div variants={fadeInUp} className="relative z-10">
                        <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight mb-4">Ready to sync?</h2>
                        <p className="text-pearl/70 mb-12 max-w-md mx-auto">Link your music streaming account to start discovering.</p>
                        <p className="text-xs text-secondary mb-8 bg-secondary/10 inline-block px-4 py-2 rounded-full border border-secondary/20">
                            VPN may be required for unsupported regions.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a href={spotifyLoginUrl} className="group relative w-full sm:w-auto glassmorphism border-white/40 hover:bg-white/90 transition-all rounded-full px-8 py-4 flex items-center justify-center space-x-4 overflow-hidden text-primary">
                                <div className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                <Image src={spotify} alt="Spotify" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                                <span className="font-medium text-sm tracking-wide">Continue with Spotify</span>
                            </a>

                            <a href={deezerLoginUrl} className="group relative w-full sm:w-auto glassmorphism border-white/40 hover:bg-white/90 transition-all rounded-full px-8 py-4 flex items-center justify-center space-x-4 overflow-hidden text-primary">
                                <div className="absolute inset-0 bg-custom-blue opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                <Image src={deezer} alt="Deezer" width={24} height={24} className="group-hover:scale-110 transition-transform" />
                                <span className="font-medium text-sm tracking-wide">Continue with Deezer</span>
                            </a>
                        </div>
                    </motion.div>
                </motion.section>
            </div>

            <footer className="text-center py-10 text-primary/40 text-sm">
                <p>&copy; {new Date().getFullYear()} BEET. All rights reserved.</p>
            </footer>
        </main>
    );
};

export default Homepage;
