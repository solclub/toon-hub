import Loader from "components/common/Loader";
import type { Id, ToastOptions } from "react-toastify";
import { toast } from "react-toastify";

const TOAST_POSITION: ToastOptions["position"] = "bottom-right";
type ToastStatus = "UPDATE" | "SUCCESS" | "ERROR" | "WARNING";

export const showToast = (msg: string) => {
  toast(`${msg}`, {
    position: TOAST_POSITION,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
  });
};

export const showSuccessToast = (msg: string, autoClose = 5000) => {
  toast.success(`${msg}`, {
    position: TOAST_POSITION,
    autoClose: autoClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
  });
};

export const showErrorToast = (error: string) => {
  toast.error(`${error}`, {
    position: TOAST_POSITION,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
  });
};

export const showPromisedToast = (
  toastId: React.MutableRefObject<Id>,
  message: string,
  update = true,
  status: ToastStatus = "UPDATE"
) => {
  const options: ToastOptions = {
    autoClose: status === "SUCCESS" ? 1000 : false,
    position: TOAST_POSITION,
  };

  if (!update) {
    toastId.current = toast(
      <div className="flex items-center gap-2">
        <Loader />
        <span>{message}</span>
      </div>,
      options
    );
  } else {
    switch (status) {
      case "SUCCESS":
        toast.update(toastId.current, { render: message, type: toast.TYPE.SUCCESS, ...options });
        break;
      case "ERROR":
        toast.update(toastId.current, { render: message, type: toast.TYPE.ERROR, ...options });
        break;
      case "WARNING":
        toast.update(toastId.current, { render: message, type: toast.TYPE.WARNING, ...options });
        break;
      default:
        toast.update(toastId.current, {
          render: (
            <div className="flex items-center gap-2">
              <Loader />
              <span>{message}</span>
            </div>
          ),
          ...options,
        });
        break;
    }
  }
};
