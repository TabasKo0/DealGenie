export const checkAuth = async (req) => {
    const token = req.cookies.token;
    if (!token) return null;
    try {
      return verifyToken(token);
    } catch {
      return null;
    }
  };
  