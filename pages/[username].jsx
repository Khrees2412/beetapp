import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { useEffect } from "react";

export default function UserProfile() {
    const { query } = useRouter();
    const { username } = query;

    const [user, setUser] = useState({});

    useEffect(() => {
        getUserFromDB();
    });

    const getUserFromDB = async () => {
        const user = await axios.post(
            `/api/connect/spotify?username=${username}&action=get`
        );
        setUser(user.data);
    };

    return (
        <div>
            <h1 className="text-white">Hi {user.username}</h1>
        </div>
    );
}
