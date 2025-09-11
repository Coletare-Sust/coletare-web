import { toast } from "react-toastify";

const errorToast = (message: string, id?: string) => {
  toast.error(message, { type: "error", toastId: id });
};

const successToast = (message: string) => {
  toast.success(message, { type: "success" });
};

export { errorToast, successToast };
