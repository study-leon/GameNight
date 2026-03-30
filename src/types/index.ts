import { Tables } from "./database.types";

export type Channel = Tables<"channels">;
export type User = Tables<"users">;

export type ChannelWithUsers = Channel & {
    users: User[];
};

export type GameCard = {
    id: number;
    name: string;
    playerCount: number;
    bio: string;
    color: string;
    imageUrl: string;
}

export type Message = Tables<"messages">;

export type Events = Tables<"events"> 

export type Games = Tables<"games">;

export type GameVotes = Tables<"game_votes">;
export type GameVoteStats = Tables<"game_vote_stats">;
export type Attendance = Tables<"attendance">;

export type Review = Tables<"reviews">;

export type GeoapifyRestaurant = {
  properties: {
    place_id: string;
    name: string | null;
    address_line2: string | null;
    lat: number;
    lon: number;
    rating?: number; // kommt evtl. nicht immer
    price_level?: number; 
    opening_hours?: {
      weekday_text?: string[];
    };
  };
};

export type RestaurantWithMeta = GeoapifyRestaurant & {
  meta: {
    caloriesEstimate: string; 
    priceLabel: string;      
    ratingLabel: string;      
  };
};