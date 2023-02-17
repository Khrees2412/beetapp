import { getTokenFromUrl } from "@/lib/spotify";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const Profile: React.FC = () => {
    const [username, setUsername] = useState("");
    const { push } = useRouter();

    const getUser = async (token: string) => {
        try {
            const res = await axios.post("/api/connect/spotify", {
                action: "auth",
                token,
            });
            console.log("response data: ", res.data.data);
            setUsername(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const spotifyToken = getTokenFromUrl().access_token;
            window.location.hash = "";

            if (spotifyToken) {
                getUser(spotifyToken);
            }
            console.log("username: ", username);
            setTimeout(() => {
                push(`/${username}`);
            }, 2000);
        }
    }, [username]);

    return (
        <>
            <p className="text-white">{username}</p>
        </>
    );
};

export default Profile;
