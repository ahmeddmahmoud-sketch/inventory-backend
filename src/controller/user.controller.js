
import {
  createUserService,
  loginUserService,
} from "../services/user.service.js";

import {
  refreshAccessTokenService,
} from "../services/refreshToken.service.js";

export async function createUserController(req, res) {
  const user = await createUserService(req.body);

  return res.status(201).json({
    status: "success",
    user,
  });
}

export async function loginUserController(req, res) {
  const { user, token, refreshToken } =
    await loginUserService(req.body);

  return res.status(200).json({
    status: "success",
    user,
    token,
    refreshToken,
  });
}


export async function refreshTokenController(req, res) {
  const { token, refreshToken } =
    await refreshAccessTokenService(req.body?.refreshToken);

  return res.status(200).json({
    status: "success",
    token,
    refreshToken,
  });
}