import React from "react";
import Image from "next/image";
import spotify from "../public/assets/spotify.png";
import apple from "../public/assets/apple.png";
import deezer from "../public/assets/deezer.png";
import { spotifyLoginUrl } from "@/lib/spotify";

const Connect: React.FC = () => {
    return (
        <div>
            <h1 className="text-4xl font-bold text-center">Connect</h1>
            <p className="text-center">
                Connect your streaming platform to continue
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
                <a href="">
                    <Image
                        src={apple}
                        alt="Apple Music"
                        width={100}
                        height={100}
                    />
                </a>
                <a href="">
                    <Image src={deezer} alt="Deezer" width={100} height={100} />
                </a>
            </div>
        </div>
    );
};

export default Connect;
