"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import SignupButton from "src/components/SignupButton";
import { ethers, BigNumberish } from "ethers";
import { touchTokenABI } from "src/abis/touchTokenABI";
import { TOUCH_TOKEN_ADDRESS, TOUCH_BADGE_ADDRESS } from "src/constants";
import { Network, Alchemy, OwnedNft } from "alchemy-sdk";

// Configure Alchemy SDK
const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.BASE_SEPOLIA,
};
const alchemy = new Alchemy(config);

const Home = () => {
  const { address } = useAccount();
  const [ownedNfts, setOwnedNfts] = useState<{
    [tokenId: string]: { nft: OwnedNft; count: number };
  }>({});
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);

  const {
    data: balance,
    isLoading: isLoadingBalance,
    isError,
  } = useReadContract({
    address: TOUCH_TOKEN_ADDRESS,
    abi: touchTokenABI,
    functionName: "balanceOf",
    args: [address],
  });

  const formattedBalance = balance
    ? ethers.formatEther(balance as BigNumberish)
    : "0";

  useEffect(() => {
    if (address) {
      fetchOwnedNFTs();
    }
  }, [address]);

  const fetchOwnedNFTs = async () => {
    if (!address) return;
    setIsLoadingNFTs(true);
    try {
      const nftsForOwner = await alchemy.nft.getNftsForOwner(address, {
        contractAddresses: [TOUCH_BADGE_ADDRESS],
      });

      const nftCounts: { [tokenId: string]: { nft: OwnedNft; count: number } } =
        {};
      nftsForOwner.ownedNfts.forEach((nft) => {
        if (nftCounts[nft.tokenId]) {
          nftCounts[nft.tokenId].count++;
        } else {
          nftCounts[nft.tokenId] = { nft, count: 1 };
        }
      });

      setOwnedNfts(nftCounts);
    } catch (error) {
      console.error("Error fetching owned NFTs:", error);
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  return (
    <div className="mb-2">
      <div className="mx-4 mt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl font-bold">Home</div>
          <div className="flex items-center space-x-2">
            <SignupButton />
          </div>
        </div>

        {!address ? (
          <div className="flex items-center justify-center h-screen">
            <SignupButton />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="text-lg font-bold">My TouchToken Balance</div>
              <div className="flex flex-row items-end">
                <div className="text-xl font-bold text-purple-600 flex items-end">
                  ❖
                </div>
                <div className="text-3xl font-bold">
                  {isLoadingBalance
                    ? "Loading..."
                    : formattedBalance !== undefined
                      ? String(formattedBalance)
                      : "N/A"}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Your Touch Badges</h2>
              {isLoadingNFTs ? (
                <p>Loading your Touch Badges...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(ownedNfts).map(
                    ([tokenId, { nft, count }]) => (
                      <div key={tokenId} className="border p-4 rounded-lg">
                        <img
                          src={
                            nft.image?.thumbnailUrl ||
                            "https://via.placeholder.com/150"
                          }
                          alt={nft.name || "NFT"}
                          className="w-full h-48 object-cover mb-2"
                        />
                        <h3 className="text-xl font-semibold">{nft.name}</h3>
                        <p>Token ID: {tokenId}</p>
                        <p className="font-bold">Owned: {count}</p>
                        {nft.description && (
                          <p className="mt-2">{nft.description}</p>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
              {Object.keys(ownedNfts).length === 0 && !isLoadingNFTs && (
                <p>You don't own any Touch Badges yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
