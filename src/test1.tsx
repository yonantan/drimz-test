import React from "react";

export type HelloProps = {
  name: string;
  hidden?: boolean;
};

export const HelloDiv = ({ name, hidden }: HelloProps) => (
  <div style={hidden ? { display: "none" } : {}}>Hello {name}</div>
);

export function FnComponent({ name }: HelloProps) {
  return <HelloDiv name={name} hidden />;
}

export function thisFunctionWillBeIgnored({
  ignoredProp,
}: {
  ignoredProp: string;
}) {
  console.log({ ignoredProp });
}
