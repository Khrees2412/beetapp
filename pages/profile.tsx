import { getTokenFromUrl } from "@/lib/spotify";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { motion } from "framer-motion";

const Profile: React.FC = () => {
    const [username, setUsername] = useState("");
    const { push } = useRouter();

    const getUser = async (token?: string, code?: string) => {
        try {
            const res = await axios.post("/api/connect/spotify", {
                action: "auth",
                token,
                code,
            });
            setUsername(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URL(window.location.href).searchParams;
            const code = urlParams.get("code");
            const spotifyToken = getTokenFromUrl().access_token;
            window.location.hash = "";

            if (code) {
                // Clear code from URL for cleaner UI
                window.history.replaceState({}, document.title, window.location.pathname);
                getUser(undefined, code);
            } else if (spotifyToken) {
                getUser(spotifyToken, undefined);
            }
            
            // Still transitioning after 2 seconds of being on this page
            if (username) {
                setTimeout(() => {
                    push(`/${username}`);
                }, 2000);
            } else {
                 // Fallback if there is an error but token was valid
                 setTimeout(() => {
                     if (username) push(`/${username}`);
                     else push("/");
                }, 3000);
            }
        }
    }, [username, push]);

    return (
        <div className="min-h-screen bg-pearl flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Background Gradient Glows */}
            <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-secondary/5 blur-[100px]" />
            <div className="absolute bottom-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] rounded-full bg-custom-blue/5 blur-[80px]" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Minimalist Pulsing Indicator */}
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-16 h-16 border rounded-full border-black/10 flex items-center justify-center mb-8 bg-white shadow-xl shadow-black/5"
                >
                    <span className="font-display font-bold text-xl tracking-tight text-primary">b.</span>
                </motion.div>

                {username ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <p className="text-primary/50 text-sm uppercase tracking-widest font-medium mb-2">Syncing complete</p>
                        <h1 className="font-display text-4xl text-primary font-medium">Hello, {username}</h1>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <p className="text-primary/50 text-sm uppercase tracking-widest font-medium mb-2">Authenticating</p>
                        <h1 className="font-display text-2xl text-primary/80 font-medium tracking-tight">Tuning your frequencies...</h1>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Profile;
