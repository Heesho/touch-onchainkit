"use client";
import { useAccount, useReadContract } from "wagmi";
import SignupButton from "src/components/SignupButton";
import { ethers, BigNumberish } from "ethers";
import { touchTokenABI } from "src/abis/touchTokenABI";
import { touchTokenAddress } from "src/constants";

const Home = () => {
  const { address } = useAccount();
  console.log("User address:", address); // Log the address

  const {
    data: balance,
    isLoading,
    isError,
  } = useReadContract({
    address: touchTokenAddress,
    abi: touchTokenABI,
    functionName: "balanceOf",
    args: [address],
  });

  const formattedBalance = balance
    ? ethers.formatEther(balance as BigNumberish)
    : "0";

  console.log("Balance data:", balance); // Log the balance data
  console.log("Formatted balance:", formattedBalance);
  console.log("Loading state:", isLoading); // Log the loading state
  console.log("Error state:", isError); // Log the error state

  return (
    <div className="mb-2">
      <div className="mx-4 mt-2">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold">Home</div>
          <div className="flex items-center space-x-2">
            <SignupButton />
          </div>
        </div>
      </div>
      <div>
        {!address ? (
          <div className="flex items-center justify-center h-screen">
            <SignupButton />
          </div>
        ) : (
          <>
            <div className="mx-4 text-lg font-bold">My Balance</div>
            <div className="flex flex-row mx-4 items-end">
              <div className="text-xl font-bold text-purple-600 flex items-end">
                ❖
              </div>
              <div className="text-3xl font-bold">
                {isLoading
                  ? "Loading..."
                  : formattedBalance !== undefined
                    ? String(formattedBalance)
                    : "N/A"}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
