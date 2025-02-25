"use client";

import { usePrivy } from "@privy-io/react-auth";

const LoginButton = () => {
  const { login, ready } = usePrivy();

  return (
    <button className="btn btn-primary btn-lg" onClick={login} disabled={!ready}>
      {!ready ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : (
        "Login with your email or wallet of choice"
      )}
    </button>
  );
};

export default LoginButton;
