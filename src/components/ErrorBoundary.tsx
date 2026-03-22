import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Beklenmeyen bir hata oluştu.";
      let isPermissionError = false;

      try {
        if (this.state.error?.message) {
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.error && parsedError.error.includes("Missing or insufficient permissions")) {
            isPermissionError = true;
            errorMessage = "Bu işlemi gerçekleştirmek için yetkiniz bulunmuyor. Lütfen giriş yaptığınızdan emin olun.";
          } else if (parsedError.error) {
            errorMessage = parsedError.error;
          }
        }
      } catch (e) {
        // Not a JSON error message, use the original message or default
        if (this.state.error?.message) {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-ivory px-6">
          <div className="max-w-md w-full bg-charcoal/5 p-8 rounded-3xl border border-charcoal/10 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-medium text-charcoal mb-4">
              {isPermissionError ? "Yetki Hatası" : "Bir Hata Oluştu"}
            </h2>
            <p className="text-charcoal/60 mb-8">
              {errorMessage}
            </p>
            <Button 
              onClick={() => window.location.href = "/"}
              className="w-full rounded-full"
            >
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
