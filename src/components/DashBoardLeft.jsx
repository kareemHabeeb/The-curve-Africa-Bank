import React from "react";
import SelectOption from "./SelectOption";
import Inputs from "./Inputs";
import TextArea from "./TextArea";
import "./DashboardLeft.css";
import Button from "./Button";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { transferFunds } from "../redux/usersSlice";
import "./css/ButtonStyle.css";
import axios from "axios";
import Swal from "sweetalert2";

const DashBoardLeft = () => {
  const { fromAccount, setFromAccount, setRefresh } = useContext(AuthContext);
  const user = useSelector((state) => state.apiInfo.user);
  const accessToken = useSelector((state) => state.apiInfo.accessToken);
  const users = useSelector((state) => state.users.signedUpUsers);
  const [recipientInfo, setRecipientInfo] = useState({
    id: 0,
    fullName: "",
    accountName: "",
  });
  const [recipientAccountNumber, setRecipientAccountNumber] = useState("");
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");
  const [accountID, setAccountID] = useState("");
  const dispatch = useDispatch();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(false);

  // const findUserbyAccountNumber = (accountNumber) => {
  //   // console.log(accountNumber);
  //   const user = users.find(user => user.accounts.some(account => account.accountNumber === accountNumber));
  //   // console.log(user);
  //   const accountInfo = user.accounts.find(account => account.accountNumber === accountNumber);
  //   // console.log({
  //   //   id: user.id,
  //   //   fullName: user.fullName,
  //   //   account: accountInfo.name
  //   // })
  //   setRecipientInfo({
  //     id: user.id,
  //     fullName: user.fullName,
  //     account: accountInfo.accountName
  //   });
  // }

  const handleSendFunds = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.post(
        `${apiUrl}/transfers`,
        {
          recipientUserId: recipientInfo.userId,
          senderAccountId: fromAccount.id,
          recipientAccountNumber: recipientAccountNumber,
          amount: Number(amount),
          memo: memo,
        },
        config,
      );
      setRefresh(true);
      Swal.fire({
        icon: "success",
        title: "Funds transferred successfully",
        text: response.data.message,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response.data.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getAccountInfo = () => {
    const account = user?.accounts?.find((account) => account.id == accountID);
    // console.log("dashboard left",account);
    setFromAccount(account);
  };

  useEffect(() => {
    getAccountInfo();
  }, [accountID, user]);

  const fectRecipientInfo = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      if (recipientAccountNumber.length === 9) {
        // findUserbyAccountNumber(recipientAccountNumber);
        const response = await axios.get(
          `${apiUrl}/accounts/lookup/${recipientAccountNumber}`,
          config,
        );
        setRecipientInfo(response.data);
      } else if (recipientAccountNumber.length < 9) {
        setRecipientInfo({
          id: 0,
          fullName: "",
          accountName: "",
        });
      }

      // console.log("response",response.data);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    // console.log(recipientAccountNumber.length);
    fectRecipientInfo();
  }, [recipientAccountNumber]);

  // const accounts = .map(account => account);
  return (
    <div className="dashboard_left_card">
      <div className="transfer_header">
        <h2>Send Money</h2>
        <p>Transfer funds securely to any bank account</p>
      </div>

      <form onSubmit={handleSendFunds} className="transfer_form">
        {/* From Account */}
        <div className="form_group">
          <label>From Account</label>
          <select
            className="input_field"
            onChange={(e) => setAccountID(e.target.value)}
          >
            <option value="">Select Account</option>
            {user?.accounts?.map((item, index) => (
              <option value={item.id} key={index}>
                {item.accountName}
              </option>
            ))}
          </select>
        </div>

        {/* Recipient Account */}
        <div className="form_group">
          <label>Recipient Account Number</label>
          <input
            className="input_field"
            type="text"
            placeholder="Enter account number"
            value={recipientAccountNumber}
            onChange={(e) => setRecipientAccountNumber(e.target.value)}
          />
        </div>

        {/* Auto-filled Name */}
        <div className="form_group">
          <label>Recipient Name</label>
          <input
            className="input_field disabled"
            type="text"
            value={recipientInfo?.fullName}
            disabled
          />
        </div>

        {/* Bank */}
        <div className="form_group">
          <label>Bank Name</label>
          <input
            className="input_field disabled"
            type="text"
            value={recipientInfo?.accountName}
            disabled
          />
        </div>

        {/* Amount */}
        <div className="form_group">
          <label>Amount</label>
          <input
            className="input_field"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Memo */}
        <div className="form_group">
          <label>Note (Optional)</label>
          <textarea
            className="input_field textarea"
            placeholder="Rent, dinner, etc."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button type="submit" className="transfer_btn" disabled={loading}>
          {loading ? "Sending..." : "Send Money"}
        </button>
      </form>
    </div>
  );
};

export default DashBoardLeft;
