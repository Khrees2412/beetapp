import { PrismaClient } from "@prisma/client";
import SpotifyWebApi from "spotify-web-api-js";
const prisma = new PrismaClient();

const recentlyPlayed = async (
    spotify: SpotifyWebApi.SpotifyWebApiJs,
    user_id: string
) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                auth_id: user_id,
            },
        });
        if (!user) throw new Error("User not found");
        const tracks = await spotify.getMyRecentlyPlayedTracks({
            limit: 10,
        });

        tracks.items.forEach(async (item, _) => {
            const { track, played_at } = item;

            const a = track.artists.map((artist) => {
                const _artist = {
                    name: artist.name,
                    url: artist.href,
                };
                return _artist;
            });
            const song = {
                name: track.name,
                id: track.id,
                url: track.external_urls.spotify,
                artists: a,
                duration_ms: track.duration_ms,
                preview_url: track.preview_url,
                played_at: played_at,
            };

            return await prisma.recently_played.create({
                data: {
                    user_id: user_id,
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
                        connect: {
                            auth_id: user_id,
                        },
                    },
                },
            });

            // const createArtist = await prisma.artist.createMany({
            //     data: [
            //         {
            //             name: song.artists[0].name,
            //             url: song.artists[0].url,
            //         },
            //         {
            //             name: song.artists[1].name,
            //             url: song.artists[1].url,
            //         },
            //     ],
            // });
        });
    } catch (error) {
        throw new Error("Error");
    }
};
// const albums = async (spotify: SpotifyWebApi.SpotifyWebApiJs) => {
//     try {
//         const albums = await spotify.getMySavedAlbums({
//             limit: 10,
//         });
//         const data = [];

//         albums.body.items.forEach((item) => {
//             const _a = item.album.artists.map((artist) => {
//                 const _artist = {
//                     name: artist.name,
//                     url: artist.href,
//                 };
//                 return _artist;
//             });

//             const a = {
//                 name: item.album.name,
//                 url: item.album.external_urls.spotify,
//                 id: item.album.id,
//                 label: item.album.label,
//                 artist: _a,
//                 total_tracks: item.album.total_tracks,
//                 image: item.album.images[0].url,
//                 genres: item.album.genres,
//                 popularity: item.album.popularity,
//             };
//             data.push(a);
//         });
//         res.json({
//             data,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// };

// const playlists = async (spotify: SpotifyWebApi.SpotifyWebApiJs) => {
//     try {
//         const playlists = await spotify.getUserPlaylists({
//             limit: 10,
//         });
//         const data = [];
//         playlists.body.items.map((playlist) => {
//             const list = {
//                 name: playlist.name,
//                 url: playlist.external_urls.spotify,
//                 description: playlist.description,
//                 owner: playlist.owner.display_name,
//                 total_tracks: playlist.tracks.total,
//                 image_url: playlist.images[0].url,
//             };
//             data.push(list);
//         });
//         res.json({
//             data,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// };

// const followedArtists = async (spotify: SpotifyWebApi.SpotifyWebApiJs) => {
//     try {
//         const followedArtists = await spotify.getFollowedArtists();
//         const data = [];
//         followedArtists.body.artists.items.forEach((item) => {
//             const artist = {
//                 name: item.name,
//                 id: item.id,
//                 url: item.external_urls.spotify,
//                 followers: item.followers.total,
//                 genres: item.genres,
//                 image: item.images[0].url,
//             };
//             data.push(artist);
//         });
//         res.json({
//             data,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// };

// const topArtists = async (spotify: SpotifyWebApi.SpotifyWebApiJs) => {
//     try {
//         const topArtists = await spotify.getMyTopArtists({
//             limit: 20,
//         });
//         const data = [];
//         topArtists.body.items.forEach((item) => {
//             const artist = {
//                 name: item.name,
//                 id: item.id,
//                 url: item.external_urls.spotify,
//                 followers: item.followers.total,
//                 genres: item.genres,
//                 image: item.images[0].url,
//             };
//             data.push(artist);
//         });
//         res.json({
//             data,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// };
// const topTracks = async (spotify: SpotifyWebApi.SpotifyWebApiJs) => {
//     try {
//         const topTracks = await spotify.getMyTopTracks({
//             limit: 20,
//         });
//         const data = [];
//         topTracks.body.items.forEach((item) => {
//             const a = item.artists.map((artist) => {
//                 const _artist = {
//                     name: artist.name,
//                     url: artist.href,
//                 };
//                 return _artist;
//             });

//             const track = {
//                 name: item.name,
//                 id: item.id,
//                 url: item.external_urls.spotify,
//                 image: item.album.images[0].url,
//                 artists: a,
//                 preview_url: item.preview_url,
//                 duration: item.duration_ms,
//                 popularity: item.popularity,
//             };
//             data.push(track);
//         });
//         res.json({
//             data,
//             // topTracks,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// };

// const currentlyPlaying = async (spotify: SpotifyWebApi.SpotifyWebApiJs) => {
//     try {
//         const track = await spotify.getMyCurrentPlayingTrack();
//         const song = {
//             url: track.body.item.external_urls.spotify,
//             name: track.body.item.name,
//             id: track.body.item.id,
//             type: track.body.currently_playing_type,
//             current_time: track.body.timestamp,
//             progress: track.body.progress_ms,
//             is_playing: track.body.is_playing,
//             popularity: track.body.item.popularity,
//             artists: track.body.item.artists,
//             duration: track.body.item.duration_ms,
//             preview_url: track.body.item.preview_url,
//             description: track.body.item.description,
//             image: track.body.item.images[0].url,
//         };

//         res.json({
//             data: song,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// };

// const playback = async (spotify: SpotifyWebApi.SpotifyWebApiJs) => {
//     try {
//         const track = await spotify.getMyCurrentPlaybackState();
//         const song = {
//             url: track.body.item.external_urls.spotify,
//             name: track.body.item.name,
//             id: track.body.item.id,
//             type: track.body.currently_playing_type,
//             current_time: track.body.timestamp,
//             progress: track.body.progress_ms,
//             is_playing: track.body.is_playing,
//             artists: track.body.item.artists,
//             duration: track.body.item.duration_ms,
//             preview_url: track.body.item.preview_url,
//             description: track.body.item.description,
//             image: track.body.item.images[0].url,
//             popularity: track.body.item.popularity,
//         };

//         res.json({
//             data: song,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// };

// const addToAlbums = async (spotify: SpotifyWebApi.SpotifyWebApiJs) => {
//     try {
//         const albumID = req.body.albumID;
//         const response = await spotify.addToMySavedAlbums(albumID);
//         res.json({
//             success: true,
//             response,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// };

// const addToTracks = async (spotify: SpotifyWebApi.SpotifyWebApiJs) => {
//     try {
//         const trackID = req.body.trackID;
//         const response = await spotify.addToMySavedTracks(trackID);
//         res.json({
//             success: true,
//             response,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// };

// const followPlaylist = async (spotify: SpotifyWebApi.SpotifyWebApiJs) => {
//     try {
//         const response = await spotify.followPlaylist(playlistID);
//         res.json({
//             success: true,
//             response,
//         });
//     } catch (error) {
//         res.json(error);
//     }
// };
export {
    recentlyPlayed,
    //     albums,
    //     playlists,
    //     followedArtists,
    //     topArtists,
    //     topTracks,
    //     currentlyPlaying,
    //     playback,
    //     addToAlbums,
    //     addToTracks,
    //     followPlaylist,
};