export interface IHolderStake {
    address: string;
    displayName: string;
    tokens: number;
    isOrbsAddress: boolean;
}

export interface ITopHoldersAtTime {
    timestamp: number;
    totalTokens: number;
    topHolders: IHolderStake[];
}

export interface IAPITopHoldersResponse {
    topHoldersAtTimePoints: ITopHoldersAtTime[];
}