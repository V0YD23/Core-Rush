export interface NFT_interface {
        tokenId: number;
        owner: string;
        pricePerHour: string;
        metadata?: {
          name: string;
          description: string;
          image: string;
          attributes: any[];
        }
}
  