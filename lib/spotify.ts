export const spotifyBaseUrl = "https://accounts.spotify.com/authorize";

const redirectURI = "http://localhost:3000";
const scopes = [
    "user-read-playback-state",
    "user-read-currently-playing",
    "user-read-recently-played",
    "user-top-read",
    "playlist-read-collaborative",
    "user-library-read",
    "user-follow-read",
    "user-read-playback-position",
];

export const spotifyLoginUrl = `${spotifyBaseUrl}?client_id=${
    process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
}&response_type=token&redirect_uri=${redirectURI}&scope=${scopes.join(
    "%20"
)}&show_dialog=true`;

export const getTokenFromUrl = () => {
    return window.location.hash
        .substring(1)
        .split("&")
        .reduce((initial: any, item) => {
            let parts = item.split("=");
            initial[parts[0]] = decodeURIComponent(parts[1]);

            return initial;
        }, {});
};
