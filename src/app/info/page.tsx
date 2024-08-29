"use client";

import SignupButton from "src/components/SignupButton";

const Info = () => {
  return (
    <div className="mb-2">
      <div className="mx-4 mt-2">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold">Info</div>
          <div className="flex items-center space-x-2">
            <SignupButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
