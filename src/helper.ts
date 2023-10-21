// ================================================================================================
// ================================================================================================
// ================================================================================================
// -> fs

export async function fileExist(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    throw error;
  }
}

// ================================================================================================
// ================================================================================================
// ================================================================================================
// -> generate

const all_characters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
const otp_characters = "0123456789";

export const generate = {
  Text: (length = 20) => {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += all_characters.charAt(
        Math.floor(Math.random() * all_characters.length)
      );
    }
    return result;
  },
  OTP: (length = 4) => {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += otp_characters.charAt(
        Math.floor(Math.random() * otp_characters.length)
      );
    }
    return result;
  },
  Integer: (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
};

// ================================================================================================
// ================================================================================================
// ================================================================================================
// -> validation

export const isArray = (value: any) => {
  return value && typeof value === "object" && Array.isArray(value);
};
export const isObject = (value: any) => {
  return value && typeof value === "object" && !Array.isArray(value);
};

export const isArrayOfString = (value: any) => {
  if (!isArray(value)) {
    return false;
  }
  for (let i = 0; i < value.length; i++) {
    const v = value[i];
    if (typeof v != "string") {
      return false;
    }
  }
  return true;
};

export const isUndefined = (value: any) => typeof value === "undefined";

export const isNumber = (val: any) => /^(\d+)$/.test(val);
export const isString = (value: any) => typeof value == "string";

export const isDateFormat = (date: any) => /^\d{4}-\d{2}-\d{2}$/.test(date);
