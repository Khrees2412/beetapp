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

const connectionConfig = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD,
};

const spotifyQueue = new Queue("spotifyQueue", {
    connection: connectionConfig,
    defaultJobOptions: {
        attempts: 1,
        removeOnFail: true,
    },
});

const worker = new Worker(
    "spotifyQueue",
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
        connection: connectionConfig,
    }
);

type Data = {
    success: boolean;
    message: string;
    data?: any;
};

const redirectURI = process.env.NODE_ENV === "production"
    ? process.env.SPOTIFY_REDIRECT_URI
    : "https://relations-proposed-rendering-craft.trycloudflare.com/profile";

const spotifyApi = new SpotifyApi({
    clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: redirectURI,
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
        return;
    }

    const { token, code, action, username } = req.body;

    try {
        if (token) spotifyApi.setAccessToken(token);

        if (action === "auth") {
            if (code) {
                const data = await spotifyApi.authorizationCodeGrant(code);
                spotifyApi.setAccessToken(data.body['access_token']);
                spotifyApi.setRefreshToken(data.body['refresh_token']);
            }
            const me = await spotifyApi.getMe();
            const user = await prisma.user.create({
                data: {
                    auth_id: me.body.id,
                    username: me.body.display_name,
                    email: me.body.email,
                    avatar: me.body.images?.[0]?.url,
                },
            });

            spotifyQueue.add("spotifyDataJobs", {
                spotify: spotifyApi,
                auth_id: user.auth_id,
            });

            res.json({
                success: true,
                message: "Successfully created user",
                data: me.body.display_name,
            });
        } else if (action === "update") {
            const me = await spotifyApi.getMe();
            const user = await prisma.user.findUnique({
                where: {
                    auth_id: me.body.id,
                },
            });

            if (user) {
                spotifyQueue.add("spotifyDataJobs", {
                    spotify: spotifyApi,
                    auth_id: user.auth_id,
                });

                res.json({
                    success: true,
                    message: "Updated user history",
                });
            } else {
                throw new Error("User not found");
            }
        } else if (action === "get") {
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

            res.json({
                success: true,
                message: "Successfully fetched user",
                data: user,
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Invalid action, try one of (get, auth, update)",
            });
        }
    } catch (error) {
        res.json({
            success: false,
            message: "Error while processing the request",
            data: error,
        });
    }
}

const storeRecentlyPlayed = async (spotify: SpotifyApi, auth_id: string) => {
    try {
        const tracks = await spotify.getMyRecentlyPlayedTracks({ limit: 20 });
        const list: IRecentlyPlayed[] = tracks.body.items.map((item) => ({
            name: item.track.name,
            id: item.track.id,
            url: item.track.external_urls.spotify,
            artists: item.track.artists.map((artist) => ({
                name: artist.name,
                url: artist.href,
            })),
            duration_ms: item.track.duration_ms,
            preview_url: item.track.preview_url!,
            played_at: item.played_at,
        }));

        for (const song of list) {
            await prisma.recently_played.create({
                data: {
                    auth_id,
                    name: song.name,
                    url: song.url,
                    id: song.id,
                    artists: {
                        create: song.artists,
                    },
                    duration_ms: song.duration_ms,
                    preview_url: song.preview_url,
                    played_at: song.played_at,
                    user: {
                        connect: { auth_id },
                    },
                },
            });
        }
    } catch (error) {
        return error;
    }
};

const storeAlbums = async (spotify: SpotifyApi, auth_id: string) => {
    try {
        const albums = await spotify.getMySavedAlbums({ limit: 10 });
        const data: IAlbum[] = albums.body.items.map((item) => ({
            name: item.album.name,
            url: item.album.external_urls.spotify,
            id: item.album.id,
            label: item.album.label,
            artist: item.album.artists.map((artist) => ({
                name: artist.name,
                url: artist.href,
            })),
            total_tracks: item.album.total_tracks,
            image: item.album.images[0].url,
            genres: item.album.genres,
            popularity: item.album.popularity,
        }));

        for (const album of data) {
            await prisma.album.create({
                data: {
                    auth_id,
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
                        create: album.genres.map((genre: any) => ({
                            name: genre,
                        })),
                    },
                    popularity: String(album.popularity),
                    user: {
                        connect: { auth_id },
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
        const playlists = await spotify.getUserPlaylists({ limit: 10 });
        const list: IPlaylist[] = playlists.body.items.map((playlist) => ({
            name: playlist.name,
            url: playlist.external_urls.spotify,
            description: playlist.description!,
            owner: playlist.owner.display_name!,
            total_tracks: playlist.tracks.total,
            image_url: playlist.images[0].url,
        }));

        for (const playlist of list) {
            await prisma.playlist.create({
                data: {
                    auth_id,
                    name: playlist.name,
                    url: playlist.url,
                    description: playlist.description,
                    owner: playlist.owner,
                    total_tracks: playlist.total_tracks,
                    image: playlist.image_url,
                    user: {
                        connect: { auth_id },
                    },
                },
            });
        }
    } catch (error) {
        return error;
    }
};

const storeTopArtists = async (spotify: SpotifyApi, auth_id: string) => {
    try {
        const topArtists = await spotify.getMyTopArtists({ limit: 20 });
        const list: ITopArtist[] = topArtists.body.items.map((item) => ({
            name: item.name,
            id: item.id,
            url: item.external_urls.spotify,
            followers: item.followers.total,
            genres: item.genres,
            image: item.images[0].url,
            popularity: item.popularity,
        }));

        for (const artist of list) {
            await prisma.top_artists.create({
                data: {
                    auth_id,
                    name: artist.name,
                    url: artist.url,
                    id: artist.id,
                    genres: {
                        create: artist.genres.map((genre: any) => ({
                            name: genre,
                        })),
                    },
                    popularity: String(artist.popularity),
                    image: artist.image,
                    user: {
                        connect: { auth_id },
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
        const topTracks = await spotify.getMyTopTracks({ limit: 20 });
        const list: ITrack[] = topTracks.body.items.map((item) => ({
            name: item.name,
            id: item.id,
            url: item.external_urls.spotify,
            image: item.album.images[0].url,
            artists: item.artists.map((artist) => ({
                name: artist.name,
                url: artist.href,
            })),
            preview_url: item.preview_url!,
            duration: item.duration_ms,
            popularity: item.popularity,
        }));

        // for (const track of list) {
        //     await prisma.top_tracks.create({
        //         data: {
        //             auth_id,
        //             name: track.name,
        //             url: track.url,
        //             id: track.id,
        //             image: track.image,
        //             artists: {
        //                 create: track.artists,
        //             },
        //             preview_url: track.preview_url,
        //             duration: track.duration,
        //             popularity: String(track.popularity),
        //             user: {
        //                 connect: { auth_id },
        //             },
        //         },
        //     });
        // }
    } catch (error) {
        return error;
    }
};

const storeCurrentPlayback = async (spotify: SpotifyApi, auth_id: string) => {
    try {
        const data = await spotify.getMyCurrentPlaybackState();
        // if (data.body.item) {
        //     const current_playback = {
        //         name: data.body.item.name,
        //         id: data.body.item.id,
        //         url: data.body.item.external_urls.spotify,
        //         image: data.body.item.album.images[0].url,
        //         artists: data.body.item.artists.map((artist) => ({
        //             name: artist.name,
        //             url: artist.href,
        //         })),
        //         is_playing: data.body.is_playing,
        //         repeat: data.body.repeat_state,
        //         shuffle: data.body.shuffle_state,
        //         context: data.body.context?.external_urls?.spotify || null,
        //         progress_ms: data.body.progress_ms,
        //         duration_ms: data.body.item.duration_ms,
        //     };

        //     await prisma.current_playback.create({
        //         data: {
        //             auth_id,
        //             name: current_playback.name,
        //             id: current_playback.id,
        //             url: current_playback.url,
        //             image: current_playback.image,
        //             artists: {
        //                 create: current_playback.artists,
        //             },
        //             is_playing: current_playback.is_playing,
        //             repeat: current_playback.repeat,
        //             shuffle: current_playback.shuffle,
        //             context: current_playback.context,
        //             progress_ms: current_playback.progress_ms,
        //             duration_ms: current_playback.duration_ms,
        //             user: {
        //                 connect: { auth_id },
        //             },
        //         },
        //     });
        // }
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
