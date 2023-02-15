import axios from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useEffect } from "react";

const UserProfile: React.FC = () => {
    const { query } = useRouter();
    const { username } = query;

    const [user, setUser] = useState<any>({});

    const getUserFromDB = async () => {
        try {
            const user = await axios.post("/api/connect/spotify", {
                action: "get",
                username: username,
            });
            setUser(user.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getUserFromDB();
    }, [username]);

    return (
        <>
            <p className="text-white">Hi {username}</p>
            <p className="text-white">{user.username} wow!!</p>
        </>
    );
};

export default UserProfile;
