import React from "react";
import Image from "next/image";
import spotify from "../public/assets/spotify.png";
import deezer from "../public/assets/deezer.png";
import { spotifyLoginUrl } from "@/lib/spotify";
import { deezerLoginUrl } from "@/lib/deezer";

const Connect: React.FC = () => {
    return (
        <div>
            <h1 className="text-4xl font-bold text-center">Connect</h1>
            <p className="text-center">
                Connect your streaming platform to continue
            </p>

            <p className="text-lg text-center text-red-400">
                You need a VPN to access this if you&apos;re not in a supported
                country for your platform.
            </p>
            <div className="flex flex-col lg:flex-row items-center justify-center space-x-2">
                <a href={spotifyLoginUrl}>
                    <Image
                        src={spotify}
                        alt="Spotify"
                        width={100}
                        height={100}
                    />
                </a>
                <a href={deezerLoginUrl}>
                    <Image src={deezer} alt="Deezer" width={100} height={100} />
                </a>
            </div>
        </div>
    );
};

export default Connect;
