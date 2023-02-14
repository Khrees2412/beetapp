interface IRecentlyPlayed {
    name: string;
    id: string;
    url: string;
    artists: string[] | any;
    duration_ms: number;
    preview_url: string;
    played_at: string;
}

export type { IRecentlyPlayed };
