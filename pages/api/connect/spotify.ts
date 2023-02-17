import SpotifyApi from "spotify-web-api-node";
import type {
    IAlbum,
    IPlaylist,
    IRecentlyPlayed,
    ITopArtist,
    ITrack,
} from "@/lib/interfaces";

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { Queue, Worker } from "bullmq";

const queue = new Queue("spotifyQueue", {
    connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
    },
    defaultJobOptions: {
        attempts: 1, // no of attempts for failed jobs
        backoff: {
            // retry after every 2^n times where n=1, 2, 3,...
            type: "exponential",
            delay: 1000, // 1 sec
        },
        removeOnFail: true,
    },
});

const worker = new Worker(
    "spotifyDataJobs",
    async (job) => {
        const { spotify, auth_id } = job.data;
        await storeRecentlyPlayed(spotify, auth_id);
        await storeAlbums(spotify, auth_id);
        await storePlaylists(spotify, auth_id);
        await storeTopArtists(spotify, auth_id);
        await storeTopTracks(spotify, auth_id);
        await storeCurrentPlayback(spotify, auth_id);
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASSWORD,
        },
    }
);

type Data = {
    success: boolean;
    message: string;
    data?: any;
};
const spotify = new SpotifyApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
    const { token, action, username } = req.body;

    if (action === "auth") {
        try {
            spotify.setAccessToken(token);
            console.log(token);
            const me = await spotify.getMe();
            const current_playback = spotify.getMyCurrentPlayingTrack();
            console.log(
                "currently-playing: ",
                (await current_playback).body.item?.name
            );
            const user = await prisma.user.create({
                data: {
                    auth_id: me.body.id,
                    username: me.body.display_name,
                    email: me.body.email,
                    avatar: me.body.images && me.body.images[0].url,
                },
            });
            const runSpotifyJobs = async () => {
                queue.add("spotifyDataJobs", {
                    spotify,
                    auth_id: user?.auth_id!,
                });
            };
            runSpotifyJobs();
            res.json({
                success: true,
                message: "Successfully created user",
                data: me.body.display_name,
            });
        } catch (error) {
            res.json({
                success: false,
                message: "Error while creating user or storing data",
                data: error,
            });
        }
    } else if (action === "update") {
        spotify.setAccessToken(token);
        const me = await spotify.getMe();

        const current_playback = spotify.getMyCurrentPlayingTrack();
        console.log((await current_playback).body.item?.name);
        try {
            const user = await prisma.user.findUnique({
                where: {
                    auth_id: me.body.id,
                },
            });

            const runSpotifyJobs = async () => {
                queue.add("spotifyDataJobs", {
                    spotify,
                    auth_id: user?.auth_id!,
                });
            };
            runSpotifyJobs();

            res.json({
                success: true,
                message: "Updated user history",
            });
        } catch (error) {
            res.json({
                success: false,
                message: "Error while updating user or storing data",
                data: error,
            });
        }
    } else if (action === "get") {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    username: username,
                },
                include: {
                    recently_played: true,
                    top_artists: true,
                    top_tracks: true,
                    playlist: true,
                    followed_artists: true,
                    album: true,
                    current_playback: true,
                    top_genres: true,
                },
            });
            console.log(user?.username);
            res.json({
                success: true,
                message: "Successfully fetched user",
                data: user,
            });
        } catch (error) {
            res.json({
                success: false,
                message: "Error while fetching user data",
                data: error,
            });
        }
    } else {
        res.status(404).json({
            success: true,
            message: "Invalid action, try one of (get, auth, update)",
        });
    }

    worker.run();
}

const storeRecentlyPlayed = async (spotify: SpotifyApi, auth_id: string) => {
    try {
        const tracks = await spotify.getMyRecentlyPlayedTracks({
            limit: 20,
        });

        const list: IRecentlyPlayed[] = [];
        tracks.body.items.forEach(async (item, _) => {
            const { track, played_at } = item;

            const a = track.artists.map((artist) => {
                const _artist = {
                    name: artist.name,
                    url: artist.href,
                };
                return _artist;
            });

            const song: IRecentlyPlayed = {
                name: track.name,
                id: track.id,
                url: track.external_urls.spotify,
                artists: a,
                duration_ms: track.duration_ms,
                preview_url: track.preview_url!,
                played_at: played_at,
            };
            list.push(song);
        });

        for (let i = 0; i < list.length; i++) {
            const song = list[i];
            await prisma.recently_played.create({
                data: {
                    auth_id: auth_id,
                    name: song.name,
                    url: song.url,
                    id: song.id,
                    artists: {
                        create: song.artists,
                    },
                    duration_ms: song.duration_ms,
                    preview_url: song.preview_url!,
                    played_at: song.played_at,
                    user: {
                        connect: {
                            auth_id: auth_id,
                        },
                    },
                },
            });
        }
    } catch (error) {
        throw new Error("Error");
    }
};

const storeAlbums = async (spotify: SpotifyApi, auth_id: string) => {
    try {
        const albums = await spotify.getMySavedAlbums({
            limit: 10,
        });
        const data: IAlbum[] = [];

        albums.body.items.forEach((item) => {
            const _a = item.album.artists.map((artist) => {
                const _artist = {
                    name: artist.name,
                    url: artist.href,
                };
                return _artist;
            });

            const a: IAlbum = {
                name: item.album.name,
                url: item.album.external_urls.spotify,
                id: item.album.id,
                label: item.album.label,
                artist: _a,
                total_tracks: item.album.total_tracks,
                image: item.album.images[0].url,
                genres: item.album.genres,
                popularity: item.album.popularity,
            };
            data.push(a);
        });
        for (let i = 0; i < data.length; i++) {
            const album = data[i];
            await prisma.album.create({
                data: {
                    auth_id: auth_id,
                    name: album.name,
                    url: album.url,
                    id: album.id,
                    label: album.label,
                    artist: {
                        create: album.artist,
                    },
                    total_tracks: album.total_tracks,
                    image: album.image,
                    genres: {
                        create: album.genres.map((genre: string) => {
                            return { name: genre };
                        }),
                    },
                    popularity: String(album.popularity),
                    user: {
                        connect: {
                            auth_id: auth_id,
                        },
                    },
                },
            });
        }
    } catch (error) {
        return error;
    }
};

const storePlaylists = async (spotify: SpotifyApi, auth_id: string) => {
    try {
        const playlists = await spotify.getUserPlaylists({
            limit: 10,
        });
        const list: IPlaylist[] = [];
        playlists.body.items.map((playlist) => {
            const data: IPlaylist = {
                name: playlist.name,
                url: playlist.external_urls.spotify,
                description: playlist.description!,
                owner: playlist.owner.display_name!,
                total_tracks: playlist.tracks.total,
                image_url: playlist.images[0].url,
            };
            list.push(data);
        });
        for (let i = 0; i < list.length; i++) {
            const playlist = list[i];
            await prisma.playlist.create({
                data: {
                    auth_id: auth_id,
                    name: playlist.name,
                    url: playlist.url,
                    description: playlist.description,
                    owner: playlist.owner,
                    total_tracks: playlist.total_tracks,
                    image: playlist.image_url,
                    user: {
                        connect: {
                            auth_id: auth_id,
                        },
                    },
                },
            });
        }
    } catch (error) {
        return error;
    }
};

// const storeFollowedArtists = async (spotify: SpotifyApi, auth_id: string) => {
//     try {
//         const followedArtists = await spotify.getFollowedArtists();
//         const list = [];
//         followedArtists.body.artists.items.forEach((item) => {
//             const artist = {
//                 name: item.name,
//                 id: item.id,
//                 url: item.external_urls.spotify,
//                 followers: item.followers.total,
//                 genres: item.genres,
//                 image: item.images[0].url,
//             };
//             list.push(artist);
//         });
//         for (let i = 0; i < list.length; i++) {
//             const artist = list[i];
//             await prisma.followed_artist.create({
//                 data: {
//                     auth_id: auth_id,
//                     name: artist.name,
//                     url: artist.url,
//                     id: artist.id,
//                     followers: artist.followers,
//                     genres: {
//                         create: artist.genres.map((genre: string) => {
//                             return { name: genre };
//                         }),
//                     },
//                     image: artist.image,
//                     user: {
//                         connect: {
//                             auth_id: auth_id,
//                         },
//                     },
//                 },
//             });
//         }
//     } catch (error) {
//         return error;
//     }
// };

const storeTopArtists = async (spotify: SpotifyApi, auth_id: string) => {
    try {
        const topArtists = await spotify.getMyTopArtists({
            limit: 20,
        });
        const list: ITopArtist[] = [];
        topArtists.body.items.forEach((item) => {
            const artist: ITopArtist = {
                name: item.name,
                id: item.id,
                url: item.external_urls.spotify,
                followers: item.followers.total,
                genres: item.genres,
                image: item.images[0].url,
                popularity: item.popularity,
            };
            list.push(artist);
        });
        for (let i = 0; i < list.length; i++) {
            const artist = list[i];
            await prisma.top_artists.create({
                data: {
                    auth_id: auth_id,
                    name: artist.name,
                    url: artist.url,
                    id: artist.id,
                    genres: {
                        create: artist.genres.map((genre: string) => {
                            return { name: genre };
                        }),
                    },
                    popularity: String(artist.popularity),
                    image: artist.image,
                    user: {
                        connect: {
                            auth_id: auth_id,
                        },
                    },
                },
            });
        }
    } catch (error) {
        return error;
    }
};

const storeTopTracks = async (spotify: SpotifyApi, auth_id: string) => {
    try {
        const topTracks = await spotify.getMyTopTracks({
            limit: 20,
        });
        const list: ITrack[] = [];
        topTracks.body.items.forEach((item) => {
            const a = item.artists.map((artist) => {
                const _artist = {
                    name: artist.name,
                    url: artist.href,
                };
                return _artist;
            });

            const track: ITrack = {
                name: item.name,
                id: item.id,
                url: item.external_urls.spotify,
                image: item.album.images[0].url,
                artists: a,
                preview_url: item.preview_url!,
                duration: item.duration_ms,
                popularity: item.popularity,
            };
            list.push(track);
        });
        for (let i = 0; i < list.length; i++) {
            const track = list[i];
            await prisma.top_tracks.create({
                data: {
                    auth_id: auth_id,
                    name: track.name,
                    url: track.url,
                    id: track.id,
                    // @ts-ignore
                    image: track.image,
                    artists: {
                        create: track.artists.map(
                            (artist: { name: string; url: string }) => {
                                return {
                                    name: artist.name,
                                    url: artist.url,
                                };
                            }
                        ),
                    },
                    preview_url: track.preview_url,
                    duration: track.duration,
                    popularity: String(track.popularity),
                    user: {
                        connect: {
                            auth_id: auth_id,
                        },
                    },
                },
            });
        }
    } catch (error) {
        return error;
    }
};

// const storeCurrentlyPlaying = async (spotify: SpotifyApi, auth_id: string) => {
//     try {
//         const data = await spotify.getMyCurrentPlayingTrack();
//         const track = {
//             url: data.body.item?.external_urls.spotify,
//             name: data.body.item?.name,
//             id: data.body.item?.id,
//             type: data.body.currently_playing_type,
//             current_time: data.body.timestamp,
//             progress: data.body.progress_ms,
//             is_playing: data.body.is_playing,
//             // @ts-ignore
//             popularity: data.body.item?.popularity,
//             // @ts-ignore
//             artists: data.body.item?.artists,
//             duration: data.body.item?.duration_ms,
//             // @ts-ignore
//             preview_url: data.body.item?.preview_url,
//             // @ts-ignore
//             description: data.body.item?.description,
//             // @ts-ignore
//             image: data.body.item?.album.images[0].url,
//         };

//     } catch (error) {
//         return error;
//     }
// };

const storeCurrentPlayback = async (spotify: SpotifyApi, auth_id: string) => {
    try {
        const data = await spotify.getMyCurrentPlaybackState();
        const track = {
            url: data.body.item?.external_urls.spotify,
            name: data.body.item?.name,
            id: data.body.item?.id,
            type: data.body.currently_playing_type,
            current_time: data.body.timestamp,
            progress: data.body.progress_ms,
            is_playing: data.body.is_playing,
            // @ts-ignore
            artists: data.body.item?.artists,
            duration: data.body.item?.duration_ms,
            // @ts-ignore
            preview_url: data.body.item?.preview_url,
            // @ts-ignore
            description: data.body.item?.description,
            // @ts-ignore
            image: data.body.item?.album.images[0].url,
            // @ts-ignore
            popularity: data.body.item?.popularity,
        };
        await prisma.current_playback.create({
            data: {
                auth_id: auth_id,
                name: track.name!,
                url: track.url!,
                id: track.id!,
                type: track.type,
                current_time: track.current_time,
                progress: track.progress!,
                is_playing: track.is_playing!,
                // @ts-ignore
                popularity: track.popularity,
                artists: {
                    create: track.artists.map(
                        (artist: { name: string; url: string }) => {
                            return {
                                name: artist.name,
                                url: artist.url,
                            };
                        }
                    ),
                },
                duration: track.duration!,
                // @ts-ignore
                preview_url: track.preview_url,
                // @ts-ignore
                description: track.description,
                // @ts-ignore
                image: track.image,

                user: {
                    connect: {
                        auth_id: auth_id,
                    },
                },
            },
        });
        return track;
    } catch (error) {
        return error;
    }
};

const addToAlbums = async (spotify: SpotifyApi, albumID: string[]) => {
    try {
        return await spotify.addToMySavedAlbums(albumID);
    } catch (error) {
        return error;
    }
};

const addToTracks = async (spotify: SpotifyApi, trackIDs: string[]) => {
    try {
        return await spotify.addToMySavedTracks(trackIDs);
    } catch (error) {
        return error;
    }
};

const followPlaylist = async (spotify: SpotifyApi, playlistID: string) => {
    try {
        return await spotify.followPlaylist(playlistID);
    } catch (error) {
        return error;
    }
};
