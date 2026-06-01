import React from "react";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useSelector, useDispatch } from "react-redux";
import { deleteAccount, logOut } from "../redux/usersSlice.js";
import { useNavigate } from "react-router-dom";
import "./css/ButtonStyle.css";
import axios from "axios";

const DashBoardRight = () => {
  const {fromAccount, refresh, setRefresh} = useContext(AuthContext);
  const users = useSelector(state => state.users.signedUpUsers);
  const user = useSelector(state => state.users.loggedInUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [theAccountInfo, setTheAccountInfo] = useState(null);
  const [theTransactions, setTheTransactions] = useState([]);
  const accessToken = useSelector(state => state.apiInfo.accessToken);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [userAccounts, setUserAccounts] = useState([]);

  const userAccountsInfo = async () => {
    try{
      const config = {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      }
      const response = await axios.get(`${apiUrl}/accounts`, config);
      setUserAccounts(response.data);
    }catch(error){
      console.log("error",error);
    }
    finally{
      setRefresh(false);
    }
  }
  useEffect(() => {
    userAccountsInfo();
  }, [refresh]);

  useEffect(() => {
    const accountInfo = users.find(e => e.id === user?.id) || null;
    const transactions = accountInfo?.transactions || [];
    const account = userAccounts?.find(account => account.id === fromAccount?.id);
    setTheAccountInfo(account);
    setTheTransactions(transactions);
  }, [fromAccount, users, user, refresh]);
  
  
  return (
    <div className="Bank_Form_Wrapper_Right">
      <div className="Bank_Form_Wrapper_Right_Top">
        <article className="Bank_Content_Wrapper_Right_Top">
          <p>Total Available Balance</p>
          <h2>&#8358; {theAccountInfo?.balance?.toLocaleString() ?? "0"}</h2>
          <span>Across {userAccounts?.length ?? 0} Accounts</span>
        </article>
      </div>
      <div className="Bank_Form_Wrapper_Right_Bottom">
        <p>Transaction History</p>
        <div className="Transactions_List">
          {
            theTransactions?.map((transaction, index) => (
              <div className="Bank_Content_Wrapper_Right_Bottom_Transaction" key={index}>
                <span className={`Transaction_Type ${transaction.type}`}>
                  {transaction.type === "debit" ? "Debit" : "Credit"}
                </span>
                <span className="Transaction_Memo">{transaction.memo}</span>
                <span className={`Transaction_Amount ${transaction.type}`}>
                  {transaction.type === "debit" ? "-" : "+"} &#8358; {transaction.amount?.toLocaleString()}
                </span>
              </div>
            ))
          }
        </div>
      </div>
      <div className="Dashboard_Actions">
        <button className="Btn Btn--secondary" onClick={() => navigate("/add")}>Add Account</button>
        <button className="Btn Btn--danger" onClick={() => {dispatch(deleteAccount(user?.id)); dispatch(logOut()); navigate("/signup")}}>Delete User</button>
      </div>
    </div>
  );
};

export default DashBoardRight;
