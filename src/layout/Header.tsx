import { useNavigate } from "react-router-dom";
import { removeLocalStorage } from "../utils/auth";

export const Header = () => {
  const navigate = useNavigate();
  
  const logout = () => {
    removeLocalStorage("access_token");
    navigate("/login");
  };
  
  return (
    <header>
      <div style={{ display: "flex", justifyContent: "end" }}>
        <button onClick={() => logout()}>Logout</button>
      </div>
    </header>
  );
};
