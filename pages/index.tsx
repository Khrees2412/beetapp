import { getTokenFromUrl } from "@/lib/spotify";
import Link from "next/link";
import { useEffect, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { recentlyPlayed } from "@/lib/actions";

const Homepage: React.FC = () => {
    const spotifyApi = new SpotifyWebApi();
    const [spotifyToken, setSpotifyToken] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const _spotifyToken = getTokenFromUrl().access_token;

            window.location.hash = "";
            if (_spotifyToken) {
                setSpotifyToken(_spotifyToken);

                spotifyApi.setAccessToken(_spotifyToken);

                spotifyApi.getMe().then((user) => {
                    console.log("User: ", user);
                });
                recentlyPlayed(spotifyApi, spotifyToken);
            }
        }
    });

    return (
        <>
            <Link href="/auth">Log In Now!</Link>
            {spotifyToken}
        </>
    );
};

export default Homepage;
