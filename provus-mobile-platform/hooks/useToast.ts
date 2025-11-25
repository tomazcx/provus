import Toast from "react-native-toast-message";

type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "primary"
  | "secondary";

interface ToastOptions {
  title?: string;
  description?: string;
  color?: ToastType | string;
  icon?: string;
  timeout?: number;
}

export function useToast() {
  const add = ({
    title,
    description,
    color = "info",
    timeout = 4000,
  }: ToastOptions) => {
    let type = color;
    if (
      !["success", "error", "warning", "info", "secondary", "primary"].includes(
        color
      )
    ) {
      type = "info";
    }

    Toast.show({
      type: type as string,
      text1: title,
      text2: description,
      visibilityTime: timeout,
      position: "top",
      topOffset: 60,
    });
  };

  return {
    add,
  };
}
