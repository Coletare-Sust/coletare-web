import { toast } from "react-toastify";

const errorToast = (message: string) => {
  toast.error(message, { type: "error" });
};

const successToast = (message: string) => {
  toast.success(message, { type: "success" });
};

export { errorToast, successToast };
