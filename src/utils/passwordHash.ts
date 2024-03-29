import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

export const verifyPassHash = async (normalPass: string, hashPass: string) => {
  return await bcrypt.compare(normalPass, hashPass);
};
