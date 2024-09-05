"use client";

import { useState, useEffect } from "react";
import { Network, Alchemy, Nft } from "alchemy-sdk";
import SignupButton from "src/components/SignupButton";
import { TOUCH_BADGE_ADDRESS } from "src/constants";

// Configure Alchemy SDK
const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.BASE_SEPOLIA, // or your preferred network
};
const alchemy = new Alchemy(config);

const Explore = () => {
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [collectionInfo, setCollectionInfo] = useState<{
    totalSupply: number;
    numHolders: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNFTsAndCollectionInfo();
  }, []);

  const fetchNFTsAndCollectionInfo = async () => {
    setIsLoading(true);
    try {
      const [nftData, ownersData] = await Promise.all([
        alchemy.nft.getNftsForContract(TOUCH_BADGE_ADDRESS),
        alchemy.nft.getOwnersForContract(TOUCH_BADGE_ADDRESS),
      ]);

      setNfts(nftData.nfts);
      setCollectionInfo({
        totalSupply: nftData.nfts.length,
        numHolders: ownersData.owners.length,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-2">
      <div className="mx-4 mt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl font-bold">Explore</div>
          <div className="flex items-center space-x-2">
            <SignupButton />
          </div>
        </div>

        {collectionInfo && (
          <div className="mb-4 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Collection Info</h2>
            <p>Total Supply: {collectionInfo.totalSupply}</p>
            <p>Number of Holders: {collectionInfo.numHolders}</p>
          </div>
        )}

        {isLoading ? (
          <p>Loading NFTs...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft) => (
              <div
                key={`${nft.contract.address}-${nft.tokenId}`}
                className="border p-4 rounded-lg"
              >
                <img
                  src={
                    nft.image?.thumbnailUrl || "https://via.placeholder.com/150"
                  }
                  alt={nft.name || "NFT"}
                  className="w-full h-48 object-cover mb-2"
                />
                <h2 className="text-xl font-semibold">{nft.name}</h2>
                <p>Collection: {nft.contract.name}</p>
                <p>Token ID: {nft.tokenId}</p>
                {nft.description && <p className="mt-2">{nft.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
