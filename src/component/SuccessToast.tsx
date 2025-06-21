import { toast } from "react-toastify";


const SuccessToast = (message: string) => {
  return toast.success(message, {
    style: { color: '#18181B' },
    position: "top-right",
    autoClose: 3500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });
}

export default SuccessToast