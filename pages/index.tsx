import Image from "next/image";
import spotify from "../public/assets/spotify.png";
import deezer from "../public/assets/deezer.png";
import global from "../public/assets/global.svg";
import social from "../public/assets/social.svg";
import connect from "../public/assets/connect.svg";
import logo from "../public/favicon-32x32.png";
import { spotifyLoginUrl } from "@/lib/spotify";
import { deezerLoginUrl } from "@/lib/deezer";

const Homepage: React.FC = () => {
    return (
        <main className="text-secondary">
            <nav className="text-xl p-5 text-black bg-secondary">
                <ul className="flex justify-around text-center">
                    <li className="text-2xl font-extrabold flex">
                        <Image src={logo} alt="logo" />
                        <p className="ml-4">BEET</p>
                    </li>
                    <li>
                        <a href="/" className="hover:underline">
                            About
                        </a>
                    </li>
                </ul>
            </nav>
            <section className="my-20">
                <h1 className="text-4xl font-bold text-center my-10">
                    Let&apos;s Connect Through Music!
                </h1>
                <div className="flex flex-col lg:flex-row items-center justify-center space-x-10 text-sm p-10">
                    <h1>Connect with a global audience</h1>
                    <Image src={global} alt="globe" width={200} height={200} />
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center space-x-10 text-sm">
                    <h1>Meet new people based on similar taste in music</h1>
                    <Image src={connect} alt="globe" width={250} height={300} />
                </div>

                <div className="flex flex-col lg:flex-row items-center justify-center space-x-10 text-sm">
                    <h1>Find new songs and playlists</h1>
                    <Image src={social} alt="globe" width={250} height={300} />
                </div>

                <div>
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
            </section>
        </main>
    );
};

export default Homepage;
