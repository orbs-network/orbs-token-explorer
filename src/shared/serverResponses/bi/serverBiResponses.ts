export interface IHolderStakeSnapshot {
    address: string;
    displayName: string;
    tokens: number;
    isOrbsAddress: boolean;
    isGuardian: boolean;
    isExchange: boolean;
}

export interface ITopHoldersAtTime {
    timestamp: number;
    totalTokens: number;
    topHolders: IHolderStakeSnapshot[];
}

export interface IAPITopHoldersResponse {
    topHoldersAtTimePoints: ITopHoldersAtTime[];
}