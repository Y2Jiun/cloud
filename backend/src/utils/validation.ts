// Validation utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

export const validateUsername = (
  username: string
): { isValid: boolean; error?: string } => {
  if (username.length < 3) {
    return {
      isValid: false,
      error: "Username must be at least 3 characters long",
    };
  }

  if (username.length > 30) {
    return {
      isValid: false,
      error: "Username must be less than 30 characters",
    };
  }

  // Only allow alphanumeric characters, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      isValid: false,
      error:
        "Username can only contain letters, numbers, underscores, and hyphens",
    };
  }

  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") {
    return "";
  }
  return input.trim().replace(/[<>]/g, "");
};

export const validateScamReport = (data: {
  title: string;
  description: string;
  scammerInfo: string;
  platform: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.title = "Title is required";
  } else if (data.title.length > 200) {
    errors.title = "Title must be less than 200 characters";
  }

  // Description validation
  if (!data.description || data.description.trim().length === 0) {
    errors.description = "Description is required";
  } else if (data.description.length > 5000) {
    errors.description = "Description must be less than 5000 characters";
  }

  // Scammer info validation
  if (!data.scammerInfo || data.scammerInfo.trim().length === 0) {
    errors.scammerInfo = "Scammer information is required";
  } else if (data.scammerInfo.length > 2000) {
    errors.scammerInfo =
      "Scammer information must be less than 2000 characters";
  }

  // Platform validation
  if (!data.platform || data.platform.trim().length === 0) {
    errors.platform = "Platform is required";
  } else if (data.platform.length > 100) {
    errors.platform = "Platform must be less than 100 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateRegistration = (data: {
  email: string;
  password: string;
  username: string;
  name?: string;
  contact?: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  // Email validation
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (!data.password) {
    errors.password = "Password is required";
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }
  }

  // Username validation
  if (!data.username) {
    errors.username = "Username is required";
  } else {
    const usernameValidation = validateUsername(data.username);
    if (!usernameValidation.isValid) {
      errors.username = usernameValidation.error || "Invalid username";
    }
  }

  // Name validation (optional)
  if (data.name && !validateName(data.name)) {
    errors.name = "Name must be between 2 and 50 characters";
  }

  // Contact validation (optional)
  if (data.contact && data.contact.length > 20) {
    errors.contact = "Contact must be less than 20 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLogin = (data: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.password) {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
