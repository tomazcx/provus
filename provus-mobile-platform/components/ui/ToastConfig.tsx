import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Toast, { BaseToastProps } from "react-native-toast-message";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X,
} from "lucide-react-native";

const BaseToast = ({ text1, text2, type, props }: any) => {
  let IconComponent = Info;
  let bgIcon = "bg-blue-100";
  let iconColor = "#3b82f6"; 
  let borderClass = "border-l-blue-500";

  switch (type) {
    case "success":
    case "secondary":
      IconComponent = CheckCircle;
      bgIcon = "bg-green-100";
      iconColor = "#22c55e";
      borderClass = "border-l-green-500";
      break;
    case "error":
      IconComponent = XCircle;
      bgIcon = "bg-red-100";
      iconColor = "#ef4444";
      borderClass = "border-l-red-500";
      break;
    case "warning":
      IconComponent = AlertTriangle;
      bgIcon = "bg-yellow-100";
      iconColor = "#eab308";
      borderClass = "border-l-yellow-500";
      break;
    case "info":
    case "primary":
    default:
      IconComponent = Info;
      bgIcon = "bg-blue-100";
      iconColor = "#3b82f6";
      borderClass = "border-l-blue-500";
      break;
  }

  return (
    <View
      className={`w-[90%] bg-white rounded-lg shadow-lg border-l-4 p-4 flex-row items-start ${borderClass}`}
      style={{
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      {/* Ícone */}
      <View
        className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${bgIcon}`}
      >
        <IconComponent size={18} color={iconColor} />
      </View>

      {/* Texto */}
      <View className="flex-1 mr-2">
        <Text className="text-gray-900 font-bold text-sm mb-1">{text1}</Text>
        {text2 ? (
          <Text className="text-gray-500 text-xs leading-4">{text2}</Text>
        ) : null}
      </View>

      <TouchableOpacity onPress={() => Toast.hide()} className="mt-1">
        <X size={16} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );
};

export const toastConfig = {
  success: (props: BaseToastProps) => <BaseToast {...props} type="success" />,
  error: (props: BaseToastProps) => <BaseToast {...props} type="error" />,
  warning: (props: BaseToastProps) => <BaseToast {...props} type="warning" />,
  info: (props: BaseToastProps) => <BaseToast {...props} type="info" />,
  secondary: (props: BaseToastProps) => <BaseToast {...props} type="success" />,
  primary: (props: BaseToastProps) => <BaseToast {...props} type="info" />,
};
