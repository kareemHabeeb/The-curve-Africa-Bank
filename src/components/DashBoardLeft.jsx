import React from "react";
import SelectOption from "./SelectOption";
import Inputs from "./Inputs";
import TextArea from "./TextArea";
import "../page/Dashboard/css/DashboardStyle.css";
import Button from "./Button";
import { useContext,useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useSelector } from "react-redux";
import {useDispatch} from "react-redux";
import { transferFunds } from "../redux/usersSlice";
import "./css/ButtonStyle.css";
import axios from "axios";
import Swal from 'sweetalert2'

const DashBoardLeft = () => {
  const { fromAccount, setFromAccount, setRefresh } = useContext(AuthContext);
  const user = useSelector(state => state.apiInfo.user);
  const accessToken = useSelector(state => state.apiInfo.accessToken);
  const users = useSelector(state => state.users.signedUpUsers);
  const [recipientInfo, setRecipientInfo] = useState({
    id: 0,
    fullName: "",
    accountName: ""
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

  const handleSendFunds = async(e) => {
    e.preventDefault();
    setLoading(true);
   try{
    const config = {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    }
    const response = await axios.post(`${apiUrl}/transfers`, {
      recipientUserId: recipientInfo.userId,
      senderAccountId: fromAccount.id,
      recipientAccountNumber: recipientAccountNumber,
      amount: Number(amount),
      memo: memo,
    }, config);
    setRefresh(true);
    Swal.fire({
      icon: "success",
      title: "Funds transferred successfully",
      text: response.data.message,
    });
    
   }catch(error){
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.response.data.message,
    });
   }
   finally{
    setLoading(false);
   }
  }

  const getAccountInfo = () => {
    const account = user?.accounts?.find(account => account.id == accountID);
    // console.log("dashboard left",account);
    setFromAccount(account);
  }

  useEffect(() => {
    getAccountInfo();
  }, [accountID, user]);

  const fectRecipientInfo = async () => {
    try{
      const config = {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      }
      if(recipientAccountNumber.length === 9) {
        // findUserbyAccountNumber(recipientAccountNumber);
        const response = await axios.get(`${apiUrl}/accounts/lookup/${recipientAccountNumber}`, config);
        setRecipientInfo(response.data);
      }else if(recipientAccountNumber.length < 9) {
        setRecipientInfo({
          id: 0,
          fullName: "",
          accountName: ""
        });
      }
      
      // console.log("response",response.data);
    }catch(error){
      console.log("error",error);
    }
  }

  useEffect(() => {
    // console.log(recipientAccountNumber.length);
    fectRecipientInfo();
  }, [recipientAccountNumber]);
  
  // const accounts = .map(account => account);
  return (
    <div className="Bank_Form_Wrapper_Left">
      <header>
        <h4>Send Funds</h4>
      </header>
      <form onSubmit={handleSendFunds}>
       
      <div className={"SelectOption_ClassName_Container"}>
      <label>From Account</label>
      <select onChange={(e) => setAccountID(e.target.value)}>
        <option value="">Select Account</option>
        {user.accounts.map((item, index) => (
          <option value={item.id} key={index}>
            {item.accountName}
          </option>
        ))}
      </select>
    </div>

         
        <div className={"Inputs_className_Container"}>
      <label>Recipient Account Number</label>
      <input
        type={"text"}
        placeholder={"Enter Account Number"}
        value={recipientAccountNumber}
        onChange={(e) => setRecipientAccountNumber(e.target.value)}
      />
      </div>
        <div className="Inputs_className_Container">
      <label>Full Name</label>
      <input
        type={"text"}
        placeholder={"Full Name"}
        value={recipientInfo?.fullName}
      />
    </div>

    <div className="Inputs_className_Container">
      <label>Bank Name</label>
      <input
        type={"text"}
        placeholder={"Bank Name"}
        value={recipientInfo?.accountName}
      />
      </div>
       
      <div className="Inputs_className_Container">
      <label>Amount</label>
      <input
        type={"text"}
        placeholder={"Amount"}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      </div>
      <div className="TextArea_ClassName_Container">
      <label>Memo</label>
      <textarea
        placeholder={"Rent, dinner, etc."}
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
      />
      </div>

        <button type="submit" className="Btn Btn--primary Form_Btn" disabled={loading}>{loading ? "Sending..." : "Send Fund"}</button>
      </form>
    </div>
  );
};

export default DashBoardLeft;
