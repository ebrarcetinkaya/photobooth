import { useState } from "react";
import PhotoBooth from "./PhotoBooth";
import AdminPanel from "./AdminPanel";

function App() {
  const isAdmin = window.location.pathname === "/admin";

  if (isAdmin) return <AdminPanel />;
  return <PhotoBooth />;
}

export default App;
