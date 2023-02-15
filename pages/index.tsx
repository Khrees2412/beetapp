import Image from "next/image";
import spotify from "../public/assets/spotify.png";
import deezer from "../public/assets/deezer.png";
import { spotifyLoginUrl } from "@/lib/spotify";
import { deezerLoginUrl } from "@/lib/deezer";

const Homepage: React.FC = () => {
    return (
        <>
            <div className="text-center font-bold text-4xl text-secondary my-20">
                <h1 className="text-6xl">Let&apos;s Connect Through Music!</h1>
                <p className="text-center my-10">
                    Connect your streaming platform to continue
                </p>

                <p className="text-lg text-center text-red-400 my-20">
                    You need a VPN to access this if you&apos;re not in a
                    supported country for your platform.
                </p>
                <div className="flex flex-col lg:flex-row items-center justify-center space-x-10 text-sm">
                    <a href={spotifyLoginUrl} className="space-y-2">
                        <Image
                            src={spotify}
                            alt="Spotify"
                            width={100}
                            height={100}
                        />
                        <p>Connect With Spotify</p>
                    </a>
                    <a href={deezerLoginUrl} className="space-y-2">
                        <Image
                            src={deezer}
                            alt="Deezer"
                            width={100}
                            height={100}
                        />
                        <p>Connect With Deezer</p>
                    </a>
                </div>
            </div>
        </>
    );
};

export default Homepage;
