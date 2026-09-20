export const cleanErrors = (errors) => {
  const cleaned = { ...errors };
  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];
    if (
      value === "" ||
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

export const validateEmail = (email) => {
  if (!email.trim()) return ["Email is required"];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return ["please enter a valid email address"];
  return [];
};

export const validatePassword = (password) => {
  //return failedRules.length > 0 ? failedRules.join(", ") : "";
  // if (!password) {
  //   return "Password is required";
  // }
  // if (!/.{8,}/.test(password)) {
  //   return "Must be at least 8 characters";
  // }
  // if (!/[a-z]/.test(password)) {
  //   return "Must include a lowercase letter";
  // }
  // if (!/[A-Z]/.test(password)) {
  //   return "Must include an uppercase letter";
  // }
  // if (!/\d/.test(password)) {
  //   return "Must include a number";
  // }
  // if (!/[@$!%*?&]/.test(password)) {
  //   return "Must include a special character (@ $ ! % * ? &)";
  // }
  // return "";
  const passwordRules = [
    { regex: /.{8,}/, message: "Must be at least 8 characters" },
    { regex: /[a-z]/, message: "Must include a lowercase letter" },
    { regex: /[A-Z]/, message: "Must include an uppercase letter" },
    { regex: /\d/, message: "Must include a number" },
    {
      regex: /[@$!%*?&]/,
      message: "Must include a special character (@$!%*?&)",
    },
  ];
  if (!password) return ["Password is required"];
  return passwordRules
    .filter((rule) => !rule.regex.test(password))
    .map((rule) => rule.message);
};

export const validateAvatar = (file) => {
  if (!file) return; // avatar is optional

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    return "Avatar must be a JPG or PNG file";
  }

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return "Avatar must be less than 2MB";
  }
  return "";
};

// remove empty errors
// Object.keys(errors).forEach((key) => {
//   // if (!errors[key] ) delete errors[key];
//   const value = errors[key];
//   if (
//     !value ||
//     value === "" ||
//     value === null ||
//     value === undefined ||
//     (Array.isArray(value) && value.length === 0)
//   ) {
//     delete errors[key];
//   }
// });

export const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0, // optional
  }).format(amount);

export const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
