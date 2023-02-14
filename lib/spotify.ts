import { supabase } from "./supabase";

const spotifyBaseUrl = "https://accounts.spotify.com/authorize";
const redirectURI =
    process.env.NODE_ENV === "production"
        ? "https://beetapp.vercel.app/profile"
        : "http://localhost:3000/profile";
const scopes = [
    "user-read-playback-position",
    "user-read-currently-playing",
    "user-read-recently-played",
    "user-top-read",
    "playlist-read-collaborative",
    "user-library-read",
    "user-follow-read",
    "user-read-playback-position",
    "playlist-modify-public",
    "user-follow-modify",
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

const getSupabaseUser = async () => {
    try {
        const { data, error } = await supabase.auth.getUser();
        if (data.user) {
            return getUser(data.user.id);
        }
        if (error) throw error;
    } catch (error) {
        console.error(error);
    }
};
const getUser = async (id: string) => {
    const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("auth_id", id);
    if (error) throw error;
    data.map((user) => {
        return { name: user.name, id: user.auth_id };
    });
};
