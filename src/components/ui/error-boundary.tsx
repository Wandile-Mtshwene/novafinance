"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 mb-5">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-[var(--nova-text)]">Something went wrong</h3>
          <p className="mt-2 max-w-sm text-sm text-[var(--nova-muted)] leading-relaxed">
            {this.state.error.message}
          </p>
          <div className="mt-5">
            <Button
              onClick={() => this.setState({ error: null })}
              className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white"
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
