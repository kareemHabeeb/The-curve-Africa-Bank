import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashBoard from "./page/Dashboard/DashBoard";
import Login from "./page/Auth/Login";
import SignUp from "./page/Auth/SignUp";
import NotFound from "./components/NotFound";
import AddAcount from "./page/Dashboard/AddAcount";
import PrivateRoute from "./page/Auth/PrivateRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<PrivateRoute/>}>
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/add" element={<AddAcount/>}/>
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;
