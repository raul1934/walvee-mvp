import React, { createContext, useContext, useState, useCallback } from "react";
import NotificationModal from "@/components/common/NotificationModal";

const NotificationContext = createContext({
  showNotification: () => {},
});

export function NotificationProvider({ children }) {
  const [modal, setModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const showNotification = useCallback(
    ({ type = "info", title = "", message = "" }) => {
      setModal({ isOpen: true, type, title, message });
    },
    []
  );

  const close = useCallback(
    () => setModal((m) => ({ ...m, isOpen: false })),
    []
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationModal
        isOpen={modal.isOpen}
        onClose={close}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
