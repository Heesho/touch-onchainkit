"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { touchBadgeABI } from "src/abis/touchBadgeABI";
import SignupButton from "../../components/SignupButton";
import { TOUCH_BADGE_ADDRESS } from "src/constants";
import { create, Client } from "@web3-storage/w3up-client";
import Image from "next/image";

const Create = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY;
    if (key) {
      setApiKey(key);
    } else {
      console.error("NFT Storage API key is not set in environment variables");
    }

    const initializeClient = async () => {
      try {
        const c = await create();
        const email = process.env
          .NEXT_PUBLIC_WEB3STORAGE_EMAIL as `${string}@${string}`;
        await c.login(email);
        await c.setCurrentSpace(
          process.env
            .NEXT_PUBLIC_WEB3STORAGE_SPACE_DID as `did:${string}:${string}`
        );
        setClient(c);
        setIsClientReady(true);
      } catch (error) {
        console.error("Failed to initialize Web3.storage client:", error);
      }
    };
    initializeClient();
  }, []);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const { address } = useAccount();

  const { writeContract, data: hash, error: writeError } = useWriteContract();

  const uploadToWeb3Storage = async (file: File) => {
    if (!client) {
      throw new Error("Web3.storage client not initialized");
    }

    const files = [file];
    const cid = await client.uploadDirectory(files);
    return `https://${cid}.ipfs.w3s.link/${file.name}`;
  };

  const cropToSquare = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new globalThis.Image(); // Use the global Image constructor
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        const size = Math.min(img.width, img.height);
        canvas.width = canvas.height = size;
        ctx.drawImage(
          img,
          (img.width - size) / 2,
          (img.height - size) / 2,
          size,
          size,
          0,
          0,
          size,
          size
        );
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: "image/jpeg" }));
        }, "image/jpeg");
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const croppedFile = await cropToSquare(file);
      setImage(croppedFile);
      setImagePreview(URL.createObjectURL(croppedFile));
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !image || !isClientReady) {
      console.error("Address, image, or Web3.storage client is not ready");
      return;
    }

    try {
      console.log("Starting NFT creation process...");
      console.log("Uploading image to Web3.Storage...");
      const imageUri = await uploadToWeb3Storage(image);
      console.log("Image uploaded, URI:", imageUri);

      const metadata = {
        name,
        description,
        image: imageUri,
        properties: {
          location,
        },
      };

      console.log("Uploading metadata to Web3.Storage...");
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      });
      const metadataUri = await uploadToWeb3Storage(metadataFile);
      console.log("Metadata uploaded, URI:", metadataUri);

      console.log("Calling smart contract...");
      writeContract({
        abi: touchBadgeABI,
        address: TOUCH_BADGE_ADDRESS,
        functionName: "register",
        args: [address, address, name, metadataUri],
      });
    } catch (error) {
      console.error("Error creating NFT:", error);
    }
  };

  return (
    <div className="mb-2">
      <div className="mx-4 mt-2">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold">Create</div>
          <div className="flex items-center space-x-2">
            <SignupButton />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="NFT Name"
            className="w-full p-2 border rounded"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />
          <input
            type="file"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
            accept="image/*"
          />
          {imagePreview && (
            <div className="mt-4">
              <Image
                src={imagePreview}
                alt="Preview"
                width={200}
                height={200}
                className="object-cover rounded"
              />
            </div>
          )}
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full p-2 bg-black text-white rounded"
            disabled={!address || !image || !isClientReady}
          >
            Create
          </button>
        </form>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        {writeError && (
          <p className="text-red-500 mt-2">Error: {writeError.message}</p>
        )}
        {hash && (
          <p className="text-green-500 mt-2">Transaction sent: {hash}</p>
        )}
      </div>
    </div>
  );
};

export default Create;
