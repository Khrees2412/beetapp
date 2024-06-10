const deezerBaseUrl = "https://connect.deezer.com/oauth/auth.php";
const redirectURI =
    process.env.NODE_ENV === "production"
        ? "https://beetapp.vercel.app/profile"
        : "http://localhost:3000/profile";

const scopes = [
    "basic_access",
    "email",
    "listening_history",
    "manage_library",
    "offline_access",
    "delete_library",
    "manage_community",
];

const deezerLoginUrl = `${deezerBaseUrl}?app_id=${
    process.env.NEXT_PUBLIC_DEEZER_APP_ID
}&redirect_uri=${redirectURI}&perms=${scopes.join(",")}`;

const getCodeFromUrl = (): string => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.get("code"));
    return urlParams.get("code")!;
};

export { deezerLoginUrl, getCodeFromUrl };
