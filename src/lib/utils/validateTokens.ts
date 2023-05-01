const validateToken = (accessToken: string): boolean => {
	// check for access token, for now just check for its existence
	if (accessToken) {
		return true;
	}
	return false;
};

export default validateToken;
