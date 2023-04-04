import type { MutableRefObject } from "react";
import type { Id } from "react-toastify";
import { toast } from "react-toastify";
// import Loader from "../components/Loader";

export const showToast = (msg: string) => {
  toast(`${msg}`, {
    position: "bottom-right",
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
    position: "bottom-right",
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
    position: "bottom-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: false,
    progress: undefined,
  });
};

export const showPromisedToast = (
  toastId: MutableRefObject<Id>,
  msg: string,
  update = true,
  status = "update"
) => {
  if (!update) {
    toastId.current = toast(
      () => (
        <div className="flex items-center gap-2">
          {/* <Loader /> */}
          <span>{msg}</span>
        </div>
      ),
      { autoClose: false, position: "bottom-right" }
    );
  } else if (status == "update") {
    toast.update(toastId.current, {
      render: () => (
        <div className="flex items-center gap-2">
          {/* <Loader /> */}
          <span>{msg}</span>
        </div>
      ),
      position: "bottom-right",
    });
  } else if (status == "success") {
    toast.update(toastId.current, {
      render: msg,
      type: toast.TYPE.SUCCESS,
      autoClose: 1000,
      position: "bottom-right",
    });
  } else if (status == "error") {
    toast.update(toastId.current, {
      render: msg,
      type: toast.TYPE.ERROR,
      autoClose: 3000,
      position: "bottom-right",
    });
  } else {
    toast.update(toastId.current, {
      render: msg,
      type: toast.TYPE.WARNING,
      autoClose: 3000,
      position: "bottom-right",
    });
  }
};
