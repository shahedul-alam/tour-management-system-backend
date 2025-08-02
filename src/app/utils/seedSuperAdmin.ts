import bcryptjs from "bcryptjs";
import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";

export const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExist = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
    });

    if (isSuperAdminExist) {
      return;
    }

    const hashedPassword = await bcryptjs.hash(
      envVars.SUPER_ADMIN_PASSWORD as string,
      envVars.BCRYPT_SALT_ROUND
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: envVars.SUPER_ADMIN_EMAIL as string,
    };

    const payload: IUser = {
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      email: envVars.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      isVerified: true,
      auths: [authProvider],
    };

    await User.create(payload);
  } catch (error) {
    console.error(error);
  }
};
