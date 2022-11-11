import React, { useState } from "react";
import { HelloDiv } from "./test1";

const ArrowComponent = ({ appName = "Drimz" }: { appName?: string }) => {
  const [name, setName] = useState(appName);

  return (
    <main className="main-page">
      <input
        placeholder="Inigo Montoya"
        onChange={(event) => {
          event.preventDefault();
          setName(event.currentTarget.value);
        }}
      />
      <HelloDiv name={name} />
    </main>
  );
};
