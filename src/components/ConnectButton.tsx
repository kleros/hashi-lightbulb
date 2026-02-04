"use client";
import React from "react";

export function ConnectButton({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <appkit-button className={`connect-btn ${className || ""}`} {...props} />
  );
}
