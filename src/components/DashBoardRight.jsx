import React from "react";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useSelector, useDispatch } from "react-redux";
import { deleteAccount, logOut } from "../redux/usersSlice.js";
import { useNavigate } from "react-router-dom";
import "./css/ButtonStyle.css";
import axios from "axios";
import "./DashboardRight.css";

const DashBoardRight = () => {
  const { fromAccount, refresh, setRefresh } = useContext(AuthContext);
  const users = useSelector((state) => state.users.signedUpUsers);
  const user = useSelector((state) => state.users.loggedInUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [theAccountInfo, setTheAccountInfo] = useState(null);
  const [theTransactions, setTheTransactions] = useState([]);
  const accessToken = useSelector((state) => state.apiInfo.accessToken);
  const apiUrl = import.meta.env.VITE_API_URL;
  const [userAccounts, setUserAccounts] = useState([]);

  const userAccountsInfo = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.get(`${apiUrl}/accounts`, config);
      setUserAccounts(response.data);
    } catch (error) {
      console.log("error", error);
    } finally {
      setRefresh(false);
    }
  };
  useEffect(() => {
    userAccountsInfo();
  }, [refresh]);

  useEffect(() => {
    const accountInfo = users.find((e) => e.id === user?.id) || null;
    const transactions = accountInfo?.transactions || [];
    const account = userAccounts?.find(
      (account) => account.id === fromAccount?.id,
    );
    setTheAccountInfo(account);
    setTheTransactions(transactions);
  }, [fromAccount, users, user, refresh]);

  return (
    <div className="dashboard_right">
      {/* BALANCE CARD */}
      <div className="balance_card">
        <p className="balance_label">Total Available Balance</p>

        <h1 className="balance_amount">
          ₦ {theAccountInfo?.balance?.toLocaleString() ?? "0"}
        </h1>

        <span className="balance_sub">
          Across {userAccounts?.length ?? 0} accounts
        </span>
      </div>

      {/* TRANSACTIONS */}
      <div className="transactions_card">
        <h3>Recent Transactions</h3>

        <div className="transactions_list">
          {theTransactions?.length > 0 ? (
            theTransactions.map((transaction, index) => (
              <div className="transaction_item" key={index}>
                <div className="transaction_left">
                  <span className={`badge ${transaction.type}`}>
                    {transaction.type === "debit" ? "−" : "+"}
                  </span>

                  <div>
                    <p className="memo">{transaction.memo}</p>
                    <span className="type">{transaction.type}</span>
                  </div>
                </div>

                <div className={`amount ${transaction.type}`}>
                  ₦ {transaction.amount?.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="empty">No transactions yet</p>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="actions_card">
        <button
          className="action_btn secondary"
          onClick={() => navigate("/add")}
        >
          Add Account
        </button>

        <button
          className="action_btn danger"
          onClick={() => {
            dispatch(deleteAccount(user?.id));
            dispatch(logOut());
            navigate("/signup");
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default DashBoardRight;
