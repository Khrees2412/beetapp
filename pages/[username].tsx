import axios from "axios";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

const UserProfile: React.FC = () => {
    const { query } = useRouter();
    const { username } = query;
    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState<any>({});

    const getUserFromDB = async () => {
        try {
            setLoading(true);
            const user = await axios.post("/api/connect/spotify", {
                action: "get",
                username: username,
            });
            setUser(user.data.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getUserFromDB();
    });

    return (
        <>
            <div className="text-white text-center my-20">
                {loading ? (
                    <button
                        type="button"
                        className="bg-indigo-500 ..."
                        disabled
                    >
                        <svg
                            className="animate-spin h-5 w-5 mr-3 bg-slate-50"
                            viewBox="0 0 24 24"
                        ></svg>
                        Processing...
                    </button>
                ) : (
                    <div className="">
                        <p className=" text-6xl text-secondary">
                            Welcome {user.username}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default UserProfile;
