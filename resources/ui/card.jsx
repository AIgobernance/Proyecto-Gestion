import * as React from "react";
import { cn } from "./utils";

export function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn("card", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn("card-header", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h4
      data-slot="card-title"
      className={cn("card-title", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={cn("card-description", className)}
      {...props}
    />
  );
}

export function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn("card-action", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("card-content", className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("card-footer", className)}
      {...props}
    />
  );
}
