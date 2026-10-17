"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "@/lib/api";
import {
  CustomerAuthResponse,
  CustomerAuthStatus,
  CustomerProfile,
} from "@/types";

interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
}

interface TelegramContextValue {
  isReady: boolean;
  authStatus: CustomerAuthStatus | null;
  isAuthenticated: boolean;
  customer: CustomerProfile | null;
  telegramUser: TelegramUser | null;
  rejectionReason: string | null;
  statusMessage: string | null;
  initData: string;
  isRegistrationOpen: boolean;
  openRegistration: () => void;
  closeRegistration: () => void;
  refreshAuth: () => Promise<void>;
  registerCustomer: (fields: {
    companyName: string;
    contactName: string;
    phone: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    province?: string | null;
    district?: string | null;
    commune?: string | null;
  }) => Promise<void>;
  hapticFeedback: (
    type?: "light" | "medium" | "heavy" | "success" | "error",
  ) => void;
  closeApp: () => void;
}

const TelegramContext = createContext<TelegramContextValue>({
  isReady: false,
  authStatus: null,
  isAuthenticated: false,
  customer: null,
  telegramUser: null,
  rejectionReason: null,
  statusMessage: null,
  initData: "",
  isRegistrationOpen: false,
  openRegistration: () => {},
  closeRegistration: () => {},
  refreshAuth: async () => {},
  registerCustomer: async () => {},
  hapticFeedback: () => {},
  closeApp: () => {},
});

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initData?: string;
  HapticFeedback?: {
    impactOccurred: (style: string) => void;
    notificationOccurred: (type: string) => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [authStatus, setAuthStatus] = useState<CustomerAuthStatus | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [initData, setInitData] = useState<string>("");
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const openRegistration = useCallback(() => {
    setIsRegistrationOpen(true);
  }, []);

  const closeRegistration = useCallback(() => {
    setIsRegistrationOpen(false);
    try {
      sessionStorage.setItem("skip_initial_reg", "true");
    } catch {}
  }, []);

  useEffect(() => {
    if (isReady && authStatus === "REGISTRATION_REQUIRED") {
      try {
        const skipped = sessionStorage.getItem("skip_initial_reg");
        if (!skipped) {
          setIsRegistrationOpen(true);
        }
      } catch {}
    }
  }, [isReady, authStatus]);

  const hapticFeedback = useCallback(
    (type: "light" | "medium" | "heavy" | "success" | "error" = "medium") => {
      try {
        const tg = window.Telegram?.WebApp;
        if (!tg?.HapticFeedback) return;
        if (type === "success" || type === "error") {
          tg.HapticFeedback.notificationOccurred(type);
        } else {
          tg.HapticFeedback.impactOccurred(type);
        }
      } catch {}
    },
    [],
  );

  const closeApp = useCallback(() => {
    try {
      window.Telegram?.WebApp?.close();
    } catch {}
  }, []);

  const handleAuthResponse = useCallback((authRes: CustomerAuthResponse) => {
    setAuthStatus(authRes.status);
    setStatusMessage(authRes.message || null);

    if (authRes.status === "ACTIVE") {
      if (authRes.accessToken) {
        localStorage.setItem("tg_customer_token", authRes.accessToken);
      }
      setIsAuthenticated(true);
      setCustomer(authRes.customer || null);
      setRejectionReason(null);
    } else {
      setIsAuthenticated(false);
      localStorage.removeItem("tg_customer_token");

      if (authRes.status === "REGISTRATION_REQUIRED") {
        if (authRes.telegramUser) {
          setTelegramUser(authRes.telegramUser);
        }
      } else if (authRes.status === "PENDING") {
        setCustomer(authRes.customer || null);
      } else if (authRes.status === "REJECTED") {
        setCustomer(authRes.customer || null);
        setRejectionReason(
          authRes.rejectionReason ||
            authRes.customer?.rejectionReason ||
            "No reason provided",
        );
      } else if (
        authRes.status === "SUSPENDED" ||
        authRes.status === "BLOCKED"
      ) {
        setCustomer(authRes.customer || null);
      }
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    if (!initData) return;
    try {
      const authRes = await api.authenticateTelegram(initData);
      handleAuthResponse(authRes);
    } catch (err) {
      console.error("Refresh auth error:", err);
    }
  }, [initData, handleAuthResponse]);

  const registerCustomer = useCallback(
    async (fields: {
      companyName: string;
      contactName: string;
      phone: string;
      address: string;
      latitude?: number | null;
      longitude?: number | null;
      province?: string | null;
      district?: string | null;
      commune?: string | null;
    }) => {
      if (!initData) {
        throw new Error("Telegram session not found");
      }
      const res = await api.registerCustomer({
        initData,
        ...fields,
      });

      handleAuthResponse(res as CustomerAuthResponse);
      setIsRegistrationOpen(false);
      hapticFeedback("success");
    },
    [initData, handleAuthResponse, hapticFeedback],
  );

  useEffect(() => {
    async function initTelegram() {
      try {
        let rawInitData = "";
        const tg = window.Telegram?.WebApp;

        if (tg) {
          tg.ready();
          tg.expand();
          rawInitData = tg.initData || "";
        }

        // Development fallback if opened in desktop browser without Telegram container
        if (!rawInitData) {
          const mockUser = {
            id: 123456789,
            first_name: "Partner",
            last_name: "Client",
            username: "partner_user",
          };
          rawInitData = `user=${encodeURIComponent(JSON.stringify(mockUser))}&hash=dev_hash`;
        }

        setInitData(rawInitData);

        // Authenticate with backend API
        const authRes = await api.authenticateTelegram(rawInitData);
        handleAuthResponse(authRes);
      } catch (err) {
        console.error("Telegram authentication error:", err);
      } finally {
        setIsReady(true);
      }
    }

    initTelegram();
  }, [handleAuthResponse]);

  return (
    <TelegramContext.Provider
      value={{
        isReady,
        authStatus,
        isAuthenticated,
        customer,
        telegramUser,
        rejectionReason,
        statusMessage,
        initData,
        isRegistrationOpen,
        openRegistration,
        closeRegistration,
        refreshAuth,
        registerCustomer,
        hapticFeedback,
        closeApp,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  return useContext(TelegramContext);
}
