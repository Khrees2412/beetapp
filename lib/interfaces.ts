interface IRecentlyPlayed {
    name: string;
    id: string;
    url: string;
    artists: string[] | any;
    duration_ms: number;
    preview_url: string;
    played_at: string;
}

interface IAlbum {
    name: string;
    url: string;
    id: string;
    label: string;
    artist: string[] | any;
    total_tracks: number;
    image: string;
    genres: string[] | any;
    popularity: number;
}

interface IPlaylist {
    name: string;
    url: string;
    description: string;
    owner: string;
    total_tracks: number;
    image_url: string;
}

interface ITopArtist {
    name: string;
    id: string;
    url: string;
    followers: number;
    genres: string[] | any;
    image: string;
    popularity: number;
}

interface ITrack {
    name: string;
    id: string;
    url: string;
    image: string;
    artists: string[] | any;
    preview_url: string;
    duration: number;
    popularity: number;
}

export type { IRecentlyPlayed, IAlbum, IPlaylist, ITopArtist, ITrack };
