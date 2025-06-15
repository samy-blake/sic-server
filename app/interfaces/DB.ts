export namespace iDB {
  export interface Playlist {
    id: string;
    createUpdateLog: boolean;
    name: string;
    genre: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Song {
    id: string;
    artists: string;
    name: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface UpdateLog {
    id: number;
    song: Song;
    playlist: Playlist;
    type: "CREATE" | "UPDATE" | "DELETE";
    alternativeSong?: string;
  }
}
