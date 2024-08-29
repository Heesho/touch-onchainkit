"use client";
import { useAccount, useReadContract } from "wagmi";
import SignupButton from "src/components/SignupButton";

const contractAddress = "0x1C3DFeA9D752EBb68555B926546Ae8E349Ec9226";
const contractABI = [
  // Minimal ABI to get ERC20 Token balance
  "function balanceOf(address owner) view returns (uint256)",
];

const Home = () => {
  const { address } = useAccount();
  const { data: balance } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "balanceOf",
    args: [address],
  });
  console.log("Balance data:", balance); // Log the balance data

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
              <div className="text-3xl font-bold">{String(balance)}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
